<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { gsap } from 'gsap';
import { convertFileSrc } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { confirm } from '@tauri-apps/plugin-dialog';
import type { Photo } from './types';
import DefaultGroupPanel from './components/layout/DefaultGroupPanel.vue';
import RejectGroupPanel from './components/layout/RejectGroupPanel.vue';
import MainImageViewer from './components/layout/MainImageViewer.vue';
import CompareViewer from './components/compare/CompareViewer.vue';
import ImportButton from './components/layout/ImportButton.vue';
import ImportDialog from './components/import/ImportDialog.vue';
import HelpPanel from './components/help/HelpPanel.vue';
import Button from './components/common/Button.vue';
import { movePhotosToSiblingFolder } from './services/tauri/fileService';
import { usePhotoStore } from './stores/photoStore';
import { useUIStore } from './stores/uiStore';

type FlyState = {
  id: string;
  imageUrl: string;
  from: { x: number; y: number; width: number; height: number };
  to: { x: number; y: number; width: number; height: number };
  targetGroupId: string;
};

const isImportOpen = ref(false);
const fly = ref<FlyState | null>(null);
const hiddenTarget = ref<null | { id: string; targetGroupId: string }>(null);
const flyItemEl = ref<HTMLDivElement | null>(null);
const viewerHoldId = ref<string | null>(null);
const pendingSelectAfterMove = ref<null | { id: string; sourceGroupId: string }>(null);
const helpOpen = ref(true);
const isMovingReject = ref(false);

const photoStore = usePhotoStore();
const uiStore = useUIStore();

const defaultPhotos = computed(() => Object.values(photoStore.photos).filter((p) => p.groupId === 'default'));
const rejectPhotos = computed(() => Object.values(photoStore.photos).filter((p) => p.groupId === 'reject'));
const compareIds = computed(() => photoStore.selectedIds.slice(0, 4));
const isCompareMode = computed(() => compareIds.value.length >= 2);
const selectedPhoto = computed<Photo | null>(() => {
  const id = viewerHoldId.value ?? photoStore.selectedId;
  if (!id) return null;
  return photoStore.photos[id] ?? null;
});

const canMoveReject = computed(() => !!photoStore.importDir && rejectPhotos.value.length > 0 && !isMovingReject.value);

async function handleMoveRejectPhotos() {
  const importDir = photoStore.importDir;
  if (!importDir) {
    uiStore.showNotification(
      { type: 'error', title: '无法处理不选', message: '请先导入一个文件夹' },
      2500
    );
    return;
  }

  const rejectList = rejectPhotos.value.slice();
  if (rejectList.length === 0) {
    uiStore.showNotification(
      { type: 'info', title: '没有不选照片', message: '不选分组为空，无需移动' },
      1800
    );
    return;
  }

  const ok = await confirm(
    `将“不选分组”的 ${rejectList.length} 张照片移动到导入文件夹同级的“不想要”文件夹？\n\n该操作会移动原文件，建议先确认已分完。`,
    { title: '处理不选照片', kind: 'warning' }
  );
  if (!ok) return;

  const paths = rejectList.map((p) => p.path);

  isMovingReject.value = true;
  try {
    const result = await movePhotosToSiblingFolder(paths, importDir, '不想要');

    // 只从应用里移除成功移动的条目（失败的保留）
    const failedSet = new Set(result.failed.map((f) => f.path));
    const movedIds = rejectList.filter((p) => !failedSet.has(p.path)).map((p) => p.id);
    if (movedIds.length > 0) photoStore.removePhotos(movedIds);

    if (result.failed.length > 0) {
      uiStore.showNotification(
        {
          type: 'warning',
          title: '部分移动失败',
          message: `已移动 ${result.moved} 张，失败 ${result.failed.length} 张（可在控制台查看原因）`,
        },
        4000
      );
      console.warn('Move failed list:', result.failed);
    } else {
      uiStore.showNotification(
        { type: 'success', title: '处理完成', message: `已移动 ${result.moved} 张到“不想要”文件夹` },
        3000
      );
    }
  } catch (e) {
    uiStore.showNotification(
      { type: 'error', title: '移动失败', message: e instanceof Error ? e.message : '未知错误' },
      4000
    );
  } finally {
    isMovingReject.value = false;
  }
}

function escapeSelector(value: string) {
  const css = (globalThis as unknown as { CSS?: { escape?: (value: string) => string } }).CSS;
  if (css?.escape) return css.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

async function handleImportComplete() {
  isImportOpen.value = false;
  try {
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (!isMaximized) await window.maximize();
  } catch (e) {
    console.error('Failed to maximize window:', e);
    try {
      await getCurrentWindow().setFullscreen(true);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  }

  try {
    await getCurrentWindow().setFocus();
  } catch {
    // best-effort
  }
}

async function raf() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function preloadImage(url: string) {
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    if (img.decode) {
      await Promise.race([
        img.decode(),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 80)),
      ]);
    }
  } catch {
    // ignore
  }
}

async function movePhotoWithFly(id: string, targetGroupId: string) {
  const photo = photoStore.photos[id];
  if (!photo) return;

  const sourceGroupId = photo.groupId;
  if (photoStore.selectedId === id && photoStore.selectedIds.length <= 1) {
    const sourceListSnapshot = (sourceGroupId === 'default' ? defaultPhotos.value : rejectPhotos.value).slice();
    const index = sourceListSnapshot.findIndex((p) => p.id === id);
    const prevId = index > 0 ? sourceListSnapshot[index - 1]?.id : null;
    const nextId = index >= 0 ? sourceListSnapshot[index + 1]?.id : null;
    const fallbackId = prevId ?? nextId ?? null;
    pendingSelectAfterMove.value = fallbackId ? { id: fallbackId, sourceGroupId } : null;
  } else {
    pendingSelectAfterMove.value = null;
  }

  const sourceEl = document.querySelector(
    `[data-photo-id="${escapeSelector(id)}"][data-group-id="${escapeSelector(sourceGroupId)}"]`
  ) as HTMLElement | null;
  const fromRect = sourceEl?.getBoundingClientRect();
  const imageUrl = photo.path ? convertFileSrc(photo.path) : '';

  if (photoStore.selectedId === id) {
    viewerHoldId.value = id;
  }

  photoStore.movePhoto(id, targetGroupId);

  if (!fromRect || !imageUrl) return;

  void preloadImage(imageUrl);

  await raf();
  await raf();
  await nextTick();

  const targetEl = document.querySelector(
    `[data-photo-id="${escapeSelector(id)}"][data-group-id="${escapeSelector(targetGroupId)}"]`
  ) as HTMLElement | null;
  const toRect = targetEl?.getBoundingClientRect();
  if (!toRect) return;

  hiddenTarget.value = { id, targetGroupId };
  fly.value = {
    id,
    imageUrl,
    from: { x: fromRect.left, y: fromRect.top, width: fromRect.width, height: fromRect.height },
    to: { x: toRect.left, y: toRect.top, width: toRect.width, height: toRect.height },
    targetGroupId,
  };
}

function handleSelect(id: string, event: MouseEvent) {
  const isMulti = event.metaKey || event.ctrlKey;
  if (isMulti && !photoStore.selectedIds.includes(id) && photoStore.selectedIds.length >= 4) {
    uiStore.showNotification(
      {
        type: 'warning',
        title: '最多选择 4 张',
        message: '对比模式最多支持 4 张照片',
      },
      2000
    );
    return;
  }

  photoStore.selectPhoto(id, isMulti);
}

let tween: gsap.core.Tween | null = null;
watch(
  fly,
  async (value) => {
    if (!value) return;
    await nextTick();
    const el = flyItemEl.value;
    if (!el) return;

    const scaleX = value.from.width > 0 ? value.to.width / value.from.width : 1;
    const scaleY = value.from.height > 0 ? value.to.height / value.from.height : 1;

    tween?.kill();
    tween = gsap.fromTo(
      el,
      {
        x: value.from.x,
        y: value.from.y,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: 'top left',
        force3D: true,
      },
      {
        x: value.to.x,
        y: value.to.y,
        scaleX,
        scaleY,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: true,
        autoRound: false,
        onComplete: () => {
          fly.value = null;
          hiddenTarget.value = null;
          const pending = pendingSelectAfterMove.value;
          pendingSelectAfterMove.value = null;

          if (!photoStore.selectedId && pending?.id) {
            const p = photoStore.photos[pending.id];
            if (p && p.groupId === pending.sourceGroupId) {
              photoStore.selectPhoto(pending.id);
            }
          }

          if (!photoStore.selectedId) {
            const candidate = defaultPhotos.value[0]?.id ?? rejectPhotos.value[0]?.id ?? null;
            if (candidate) photoStore.selectPhoto(candidate);
          }
          viewerHoldId.value = null;
        },
      }
    );
  },
  { flush: 'post' }
);

onMounted(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    // Double space to move photo between groups
    if (e.code === 'Space' && photoStore.selectedId) {
      e.preventDefault();
      const now = Date.now();
      const timeSinceLastSpace = now - lastSpaceTime;

      if (timeSinceLastSpace < DOUBLE_SPACE_INTERVAL) {
        const photo = photoStore.photos[photoStore.selectedId];
        if (photo && photo.groupId === 'default') {
          void movePhotoWithFly(photoStore.selectedId, 'reject');
        } else if (photo && photo.groupId === 'reject') {
          void movePhotoWithFly(photoStore.selectedId, 'default');
        }
        lastSpaceTime = 0;
      } else {
        lastSpaceTime = now;
      }
      return;
    }

    // ESC to exit fullscreen
    if (e.key === 'Escape') {
      void getCurrentWindow().setFullscreen(false);
    }
  };

  window.addEventListener('keydown', onKeyDown);
  cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown));
});

const DOUBLE_SPACE_INTERVAL = 300;
let lastSpaceTime = 0;
const cleanupFns: Array<() => void> = [];

onBeforeUnmount(() => {
  tween?.kill();
  tween = null;
  cleanupFns.forEach((fn) => fn());
});

watch(
  () => defaultPhotos.value.length,
  (len) => {
    if (fly.value || viewerHoldId.value) return;
    if (len > 0 && !photoStore.selectedId) {
      photoStore.selectPhoto(defaultPhotos.value[0].id);
    }
  },
  { immediate: true }
);

watch(
  () => photoStore.selectedIds.length,
  (len) => {
    if (len >= 2) {
      viewerHoldId.value = null;
    }
  }
);
</script>

<template>
  <div class="h-screen w-screen bg-background text-text-primary overflow-hidden flex relative">
    <div class="z-20 relative">
      <DefaultGroupPanel
        :photos="defaultPhotos"
        :selected-id="photoStore.selectedId"
        :hidden-photo-id="hiddenTarget?.targetGroupId === 'default' ? hiddenTarget.id : null"
        @select="handleSelect"
        @double-click="(id: string) => movePhotoWithFly(id, 'reject')"
      />
    </div>

    <div class="flex-1 z-0 relative">
      <CompareViewer v-if="isCompareMode" :photo-ids="compareIds" :photos="photoStore.photos" />
      <MainImageViewer v-else :photo="selectedPhoto" />
    </div>

    <div class="z-20 relative">
      <RejectGroupPanel
        :photos="rejectPhotos"
        :selected-id="photoStore.selectedId"
        :hidden-photo-id="hiddenTarget?.targetGroupId === 'reject' ? hiddenTarget.id : null"
        @select="handleSelect"
        @double-click="(id: string) => movePhotoWithFly(id, 'default')"
      />
    </div>

    <ImportButton @click="isImportOpen = true" />
    <div class="fixed top-4 left-[108px] z-50">
      <Button
        variant="danger"
        :disabled="!canMoveReject"
        :is-loading="isMovingReject"
        title="将不选分组的照片移到同级“不想要”文件夹"
        @click="handleMoveRejectPhotos"
      >
        处理不选
      </Button>
    </div>

    <ImportDialog
      :is-open="isImportOpen"
      @close="isImportOpen = false"
      @import-complete="handleImportComplete"
    />

    <div v-if="uiStore.notification" class="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div
        class="px-4 py-3 rounded-lg shadow-lg border min-w-[300px]"
        :class="{
          'bg-surface border-success/50': uiStore.notification.type === 'success',
          'bg-surface border-danger/50': uiStore.notification.type === 'error',
          'bg-surface border-warning/50': uiStore.notification.type === 'warning',
          'bg-surface border-primary/50': uiStore.notification.type === 'info',
        }"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :class="{
              'bg-success/20 text-success': uiStore.notification.type === 'success',
              'bg-danger/20 text-danger': uiStore.notification.type === 'error',
              'bg-warning/20 text-warning': uiStore.notification.type === 'warning',
              'bg-primary/20 text-primary': uiStore.notification.type === 'info',
            }"
          >
            <svg
              v-if="uiStore.notification.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-3 h-3"
            >
              <path
                fill-rule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="uiStore.notification.type === 'error'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-3 h-3"
            >
              <path
                fill-rule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="uiStore.notification.type === 'warning'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-3 h-3"
            >
              <path
                fill-rule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-3 h-3"
            >
              <path
                fill-rule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.5 1.748l.383 6.832-1.313.077-.384-6.832c-.021-.376-.314-.638-.632-.479-1.155.577-2.472-.465-2.539-1.786l-.065-1.166 1.313-.077.065 1.166c.012.213.168.363.372.417zM12 6.75a.75.75 0 110 1.5.75.75 0 010-1.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium text-text-primary">{{ uiStore.notification.title }}</p>
            <p class="text-sm text-text-secondary mt-0.5">{{ uiStore.notification.message }}</p>
          </div>

          <button @click="uiStore.hideNotification()" class="text-text-muted hover:text-text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="fly"
        class="pointer-events-none"
        :style="{
          position: 'fixed',
          inset: '0px',
          zIndex: 2147483647,
          overflow: 'visible',
          isolation: 'isolate',
          background: 'transparent',
        }"
      >
        <div
          ref="flyItemEl"
          :style="{
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: `${fly.from.width}px`,
            height: `${fly.from.height}px`,
            willChange: 'transform',
            outline: 'none',
          }"
        >
          <img
            :src="fly.imageUrl"
            alt=""
            :style="{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }"
            draggable="false"
          />
        </div>
      </div>
    </Teleport>

    <HelpPanel :open="helpOpen" @toggle="helpOpen = !helpOpen" />
  </div>
</template>

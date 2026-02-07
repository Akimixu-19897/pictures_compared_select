<script setup lang="ts">
import { computed, ref } from 'vue';
import DropZone from './DropZone.vue';
import Button from '../common/Button.vue';
import { scanDirectory, selectFolder } from '../../services/tauri/fileService';
import { usePhotoStore } from '../../stores/photoStore';
import { useUIStore } from '../../stores/uiStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'import-complete'): void;
}>();

const isImporting = ref(false);
const progress = ref({ current: 0, total: 0 });

const photoStore = usePhotoStore();
const uiStore = useUIStore();

const progressPct = computed(() => (progress.value.total > 0 ? (progress.value.current / progress.value.total) * 100 : 0));

async function handleImport(path: string) {
  isImporting.value = true;
  progress.value = { current: 0, total: 0 };

  try {
    const photos = await scanDirectory(path);

    if (photos.length === 0) {
      uiStore.showNotification({
        type: 'warning',
        title: '未找到照片',
        message: '所选文件夹中没有支持的照片格式',
      });
      return;
    }

    progress.value = { current: 0, total: photos.length };
    photoStore.addPhotos(photos, 'default');

    for (let i = 0; i <= photos.length; i += Math.ceil(photos.length / 10)) {
      progress.value = { current: i, total: photos.length };
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    uiStore.showNotification({
      type: 'success',
      title: '导入完成',
      message: `成功导入 ${photos.length} 张照片`,
    }, 3000);

    emit('import-complete');
    emit('close');
  } catch (error) {
    console.error('Import failed:', error);
    uiStore.showNotification({
      type: 'error',
      title: '导入失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  } finally {
    isImporting.value = false;
  }
}

async function handleSelectFolder() {
  const path = await selectFolder();
  if (path) await handleImport(path);
}

function handleDrop(_files: FileList) {
  uiStore.showNotification({
    type: 'info',
    title: '功能开发中',
    message: '拖拽导入功能即将上线',
  });
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-3xl bg-surface rounded-xl shadow-2xl border border-border overflow-hidden">
      <div class="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 class="text-lg font-semibold text-text-primary">导入照片</h2>
        <button v-if="!isImporting" @click="emit('close')" class="text-text-muted hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-8">
        <div v-if="isImporting" class="text-center py-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p class="text-lg font-medium text-text-primary mb-2">正在导入照片...</p>
          <p class="text-sm text-text-secondary">{{ progress.current }} / {{ progress.total }}</p>
          <div class="mt-4 w-full max-w-md mx-auto h-2 bg-surface-light rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${progressPct}%` }" />
          </div>
        </div>
        <DropZone v-else @drop-files="handleDrop" @click-select="handleSelectFolder" />
      </div>

      <div v-if="!isImporting" class="px-6 py-4 border-t border-border flex justify-end gap-3">
        <Button variant="ghost" @click="emit('close')">取消</Button>
        <Button @click="handleSelectFolder">选择文件夹</Button>
      </div>
    </div>
  </div>
</template>

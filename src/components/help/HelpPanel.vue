<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
  }>(),
  { open: true }
);

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const isWide = ref(props.open);
const showBody = ref(props.open);

watch(
  () => props.open,
  async (open, oldOpen) => {
    if (open) {
      isWide.value = true;
      showBody.value = false;
      // 初次渲染时如果默认就是打开状态，不需要等宽度动画
      if (oldOpen === undefined) {
        showBody.value = true;
        return;
      }
      await nextTick();
      // body will be shown on width transition end
      return;
    }

    showBody.value = false;
    isWide.value = false;
  },
  { immediate: true }
);

function onPanelTransitionEnd(e: TransitionEvent) {
  if (e.propertyName !== 'width') return;
  if (props.open) showBody.value = true;
}
</script>

<template>
  <div
    class="fixed left-1/2 bottom-4 -translate-x-1/2 z-50"
    :class="isWide ? 'w-[min(900px,calc(100vw-32px))]' : 'w-[56px]'"
  >
    <div
      class="bg-surface/95 border border-border shadow-2xl backdrop-blur-md overflow-hidden transition-[width,border-radius] duration-300 ease-out"
      :class="props.open ? 'rounded-xl' : 'rounded-full'"
      @transitionend="onPanelTransitionEnd"
    >
      <button
        class="w-full flex items-center justify-between text-left hover:bg-surface-light/40 transition-colors"
        :class="props.open ? 'px-4 py-3' : 'px-0 py-0 h-14 w-14 justify-center'"
        @click="emit('toggle')"
        :title="props.open ? undefined : '使用说明'"
      >
        <template v-if="props.open">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-primary" />
            <span class="font-medium text-text-primary">使用说明</span>
            <span class="text-xs text-text-muted">（点击展开/收起）</span>
          </div>
          <svg
            class="w-5 h-5 text-text-secondary transition-transform"
            :class="props.open ? 'rotate-180' : ''"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </template>

        <template v-else>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-6 h-6 text-text-primary"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.5 1.748l.383 6.832-1.313.077-.384-6.832c-.021-.376-.314-.638-.632-.479-1.155.577-2.472-.465-2.539-1.786l-.065-1.166 1.313-.077.065 1.166c.012.213.168.363.372.417zM12 6.75a.75.75 0 110 1.5.75.75 0 010-1.5z"
              clip-rule="evenodd"
            />
          </svg>
        </template>
      </button>

      <Transition name="help-body">
        <div v-show="showBody" class="px-4 pb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div class="rounded-lg bg-surface-light/40 border border-border/60 p-3">
              <h3 class="text-sm font-semibold text-text-primary">1. 导入照片</h3>
              <ul class="mt-2 text-sm text-text-secondary space-y-1">
                <li>点击左上角「导入」选择文件夹。</li>
                <li>导入完成会弹出提示，3 秒后自动消失。</li>
              </ul>
            </div>

            <div class="rounded-lg bg-surface-light/40 border border-border/60 p-3">
              <h3 class="text-sm font-semibold text-text-primary">2. 基础操作</h3>
              <ul class="mt-2 text-sm text-text-secondary space-y-1">
                <li>单击缩略图：选中并在中间预览。</li>
                <li>滚轮：缩放；按住拖动：平移（缩小也可拖）。</li>
              </ul>
            </div>

            <div class="rounded-lg bg-surface-light/40 border border-border/60 p-3">
              <h3 class="text-sm font-semibold text-text-primary">3. 分组移动（带飞入动画）</h3>
              <ul class="mt-2 text-sm text-text-secondary space-y-1">
                <li>双击缩略图：在「默认」与「不选」之间移动。</li>
                <li>双击空格：移动当前选中图片（默认 ⇄ 不选）。</li>
              </ul>
            </div>

            <div class="rounded-lg bg-surface-light/40 border border-border/60 p-3">
              <h3 class="text-sm font-semibold text-text-primary">4. 对比模式（最多 4 张）</h3>
              <ul class="mt-2 text-sm text-text-secondary space-y-1">
                <li>
                  按住 <span class="font-medium text-text-primary">Cmd/Ctrl</span> 多选 2–4 张，自动进入对比。
                </li>
                <li>2 张：左右各一半；3 张：左 1/2 + 右上下；4 张：2×2。</li>
                <li>每一块都支持独立缩放/拖动。</li>
              </ul>
            </div>
          </div>

          <div class="mt-3 text-xs text-text-muted flex flex-wrap gap-x-4 gap-y-1">
            <span>提示：再次按住 Cmd/Ctrl 点击已选中图片可取消。</span>
            <span>Esc：退出全屏。</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.help-body-enter-active,
.help-body-leave-active {
  transition: max-height 220ms ease, opacity 220ms ease;
  overflow: hidden;
}
.help-body-enter-from,
.help-body-leave-to {
  max-height: 0;
  opacity: 0;
}
.help-body-enter-to,
.help-body-leave-from {
  max-height: 480px;
  opacity: 1;
}
</style>

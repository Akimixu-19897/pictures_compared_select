<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
  }>(),
  { open: true }
);

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<template>
  <div
    class="fixed left-1/2 bottom-4 -translate-x-1/2 z-50 w-[min(900px,calc(100vw-32px))]"
  >
    <div class="bg-surface/95 border border-border rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-light/40 transition-colors"
        @click="emit('toggle')"
      >
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
      </button>

      <div v-show="props.open" class="px-4 pb-4">
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
              <li>按住 <span class="font-medium text-text-primary">Cmd/Ctrl</span> 多选 2–4 张，自动进入对比。</li>
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
    </div>
  </div>
</template>


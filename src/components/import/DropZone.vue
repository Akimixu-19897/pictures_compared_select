<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../utils/cn';

const props = withDefaults(
  defineProps<{
    isDragging?: boolean;
  }>(),
  { isDragging: false }
);

const emit = defineEmits<{
  (e: 'drop-files', files: FileList): void;
  (e: 'click-select'): void;
}>();

const internalDragging = ref(false);
const showDragging = computed(() => internalDragging.value || props.isDragging);

function onDragOver(e: DragEvent) {
  e.preventDefault();
  internalDragging.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  internalDragging.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  internalDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) emit('drop-files', files);
}
</script>

<template>
  <div
    :class="
      cn(
        'w-full max-w-2xl mx-auto p-12 rounded-2xl border-2 border-dashed transition-all duration-300',
        'flex flex-col items-center justify-center gap-6 cursor-pointer',
        showDragging ? 'border-primary bg-primary/5 scale-105' : 'border-border bg-surface hover:border-primary/50 hover:bg-surface-light'
      )
    "
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="emit('click-select')"
  >
    <div :class="cn('relative transition-transform duration-300', showDragging ? 'scale-110' : '')">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-16 h-16">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
        />
      </svg>
      <div
        :class="
          cn(
            'absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white transition-all duration-300',
            showDragging ? 'scale-110' : ''
          )
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      </div>
    </div>

    <div class="text-center">
      <p class="text-lg font-medium text-text-primary mb-2">{{ showDragging ? '松开以导入' : '拖拽文件夹到此处' }}</p>
      <p class="text-sm text-text-secondary">或 <span class="text-primary hover:underline">点击选择文件夹</span></p>
    </div>

    <p class="text-xs text-text-muted">支持格式: JPG, PNG, RAW, TIFF, HEIC</p>
  </div>
</template>


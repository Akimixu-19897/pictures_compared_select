<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    draggable?: boolean;
  }>(),
  { alt: '', draggable: false }
);

const scale = ref(1);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const positionRef = ref({ x: 0, y: 0 });

const cursor = computed(() => (isDragging.value ? 'grabbing' : 'grab'));

watch(
  () => props.src,
  () => {
    scale.value = 1;
    position.value = { x: 0, y: 0 };
    positionRef.value = { x: 0, y: 0 };
  }
);

function onWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  scale.value = Math.max(0.5, Math.min(5, scale.value * delta));
}

function onMouseDown(e: MouseEvent) {
  e.preventDefault();
  isDragging.value = true;
  dragStart.value = { x: e.clientX - positionRef.value.x, y: e.clientY - positionRef.value.y };
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const newX = e.clientX - dragStart.value.x;
  const newY = e.clientY - dragStart.value.y;
  positionRef.value = { x: newX, y: newY };
  position.value = { x: newX, y: newY };
}

function stopDrag() {
  isDragging.value = false;
}

function onWindowMouseUp() {
  stopDrag();
}

onMounted(() => {
  window.addEventListener('mouseup', onWindowMouseUp);
  window.addEventListener('blur', onWindowMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onWindowMouseUp);
  window.removeEventListener('blur', onWindowMouseUp);
});
</script>

<template>
  <div
    class="w-full h-full flex items-center justify-center overflow-hidden relative"
    :style="{ cursor }"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
  >
    <img
      :src="props.src"
      :alt="props.alt"
      class="max-w-full max-h-full object-contain select-none"
      :style="{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      }"
      :draggable="props.draggable"
    />

    <div class="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
      {{ Math.round(scale * 100) }}%
    </div>
  </div>
</template>


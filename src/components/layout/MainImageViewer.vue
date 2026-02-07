<script setup lang="ts">
import { computed } from 'vue';
import { convertFileSrc } from '@tauri-apps/api/core';
import type { Photo } from '../../types';
import ZoomPanImage from '../photo/ZoomPanImage.vue';

const props = defineProps<{
  photo: Photo | null;
}>();

const imageUrl = computed(() => (props.photo?.path ? convertFileSrc(props.photo.path) : ''));
</script>

<template>
  <div v-if="!props.photo" class="w-full h-full flex items-center justify-center bg-background">
    <div class="text-text-muted text-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-24 h-24 mx-auto mb-4">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      <p class="text-lg">导入图片开始选片</p>
      <p class="text-sm text-text-secondary mt-2">点击左上角导入按钮</p>
    </div>
  </div>

  <div v-else class="w-full h-full bg-background overflow-hidden relative z-0">
    <ZoomPanImage :src="imageUrl" :alt="props.photo.name" :draggable="false" />

    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm max-w-[80%] truncate">
      {{ props.photo.name }}
    </div>
  </div>
</template>

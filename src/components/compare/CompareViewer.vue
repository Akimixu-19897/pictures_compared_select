<script setup lang="ts">
import { computed } from 'vue';
import { convertFileSrc } from '@tauri-apps/api/core';
import type { Photo } from '../../types';
import ZoomPanImage from '../photo/ZoomPanImage.vue';

const props = defineProps<{
  photoIds: string[];
  photos: Record<string, Photo>;
}>();

const items = computed(() =>
  props.photoIds
    .map((id) => props.photos[id])
    .filter((p): p is Photo => !!p)
    .map((photo) => ({
      id: photo.id,
      name: photo.name,
      src: photo.path ? convertFileSrc(photo.path) : '',
    }))
);

const count = computed(() => items.value.length);
</script>

<template>
  <div class="w-full h-full bg-background overflow-hidden">
    <!-- 2-up -->
    <div v-if="count === 2" class="w-full h-full grid grid-cols-2">
      <div v-for="it in items" :key="it.id" class="relative border-r border-border last:border-r-0">
        <ZoomPanImage :src="it.src" :alt="it.name" :draggable="false" />
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs max-w-[90%] truncate">
          {{ it.name }}
        </div>
      </div>
    </div>

    <!-- 3-up: left half + right split -->
    <div v-else-if="count === 3" class="w-full h-full flex">
      <div class="w-1/2 h-full relative border-r border-border">
        <ZoomPanImage :src="items[0].src" :alt="items[0].name" :draggable="false" />
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs max-w-[90%] truncate">
          {{ items[0].name }}
        </div>
      </div>
      <div class="w-1/2 h-full flex flex-col">
        <div class="h-1/2 relative border-b border-border">
          <ZoomPanImage :src="items[1].src" :alt="items[1].name" :draggable="false" />
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs max-w-[90%] truncate">
            {{ items[1].name }}
          </div>
        </div>
        <div class="h-1/2 relative">
          <ZoomPanImage :src="items[2].src" :alt="items[2].name" :draggable="false" />
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs max-w-[90%] truncate">
            {{ items[2].name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 4-up -->
    <div v-else-if="count === 4" class="w-full h-full grid grid-cols-2 grid-rows-2">
      <div
        v-for="(it, idx) in items"
        :key="it.id"
        class="relative"
        :class="[
          idx % 2 === 0 ? 'border-r border-border' : '',
          idx < 2 ? 'border-b border-border' : '',
        ]"
      >
        <ZoomPanImage :src="it.src" :alt="it.name" :draggable="false" />
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs max-w-[90%] truncate">
          {{ it.name }}
        </div>
      </div>
    </div>

    <!-- fallback -->
    <div v-else class="w-full h-full flex items-center justify-center text-text-muted">
      <span>请选择 2-4 张照片进行对比</span>
    </div>
  </div>
</template>


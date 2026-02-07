<script setup lang="ts">
import { computed } from "vue";
import { convertFileSrc } from "@tauri-apps/api/core";
import type { Photo } from "../../types";

const props = withDefaults(
  defineProps<{
    photos: Photo[];
    selectedId: string | null;
    hiddenPhotoId?: string | null;
  }>(),
  { hiddenPhotoId: null },
);

const emit = defineEmits<{
  (e: "select", id: string, event: MouseEvent): void;
  (e: "double-click", id: string): void;
}>();

const photosWithUrl = computed(() =>
  props.photos.map((photo) => ({
    photo,
    imageUrl: photo.path ? convertFileSrc(photo.path) : "",
  })),
);
</script>

<template>
  <div
    class="w-[200px] h-full bg-surface border-r border-border flex flex-col relative shrink-0 z-20"
  >
    <div class="flex-1 overflow-y-auto p-2 pb-16 space-y-2 relative z-30">
      <div
        v-for="{ photo, imageUrl } in photosWithUrl"
        :key="photo.id"
        :data-photo-id="photo.id"
        data-group-id="default"
        class="relative aspect-square rounded-lg overflow-hidden cursor-pointer z-[100] transition-all duration-200"
        :class="[
          props.hiddenPhotoId === photo.id
            ? 'opacity-0 pointer-events-none'
            : '',
          props.selectedId === photo.id
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface scale-[1.02]'
            : 'hover:ring-1 hover:ring-primary/50',
        ]"
        @click="emit('select', photo.id, $event)"
        @dblclick="emit('double-click', photo.id)"
      >
        <img
          :src="imageUrl"
          :alt="photo.name"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          v-if="props.selectedId === photo.id"
          class="absolute inset-0 bg-primary/10 pointer-events-none"
        />
      </div>
    </div>

    <div class="absolute bottom-4 left-0 right-0 z-[200] flex justify-center pointer-events-none">
      <div
        class="px-4 py-1.5 bg-black/60 backdrop-blur-sm rounded-full shadow-lg"
      >
        <span class="text-sm font-medium text-white"
          >{{ props.photos.length }}张</span
        >
      </div>
    </div>
  </div>
</template>

import { defineStore } from 'pinia';
import type { Photo, PhotoInfo } from '../types';
import { generateId } from '../utils/format';

interface PhotoState {
  photos: Record<string, Photo>;
  selectedIds: string[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PhotoState = {
  photos: {},
  selectedIds: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const usePhotoStore = defineStore('photo', {
  state: (): PhotoState => ({ ...initialState }),
  getters: {
    getPhotosByGroup: (state) => {
      return (groupId: string) =>
        Object.values(state.photos)
          .filter((photo) => photo.groupId === groupId)
          .sort((a, b) => a.name.localeCompare(b.name));
    },
    getSelectedPhotos: (state) => {
      return state.selectedIds
        .map((id) => state.photos[id])
        .filter((photo): photo is Photo => !!photo);
    },
  },
  actions: {
    addPhotos(photoInfos: PhotoInfo[], groupId: string = 'default') {
      for (const info of photoInfos) {
        const photo: Photo = {
          ...info,
          id: generateId(),
          groupId,
          isSelected: false,
        };
        this.photos[photo.id] = photo;
      }
    },
    removePhotos(ids: string[]) {
      this.selectedIds = this.selectedIds.filter((id) => !ids.includes(id));
      if (this.selectedId && ids.includes(this.selectedId)) this.selectedId = null;
      for (const id of ids) delete this.photos[id];
    },
    updatePhoto(id: string, updates: Partial<Photo>) {
      const photo = this.photos[id];
      if (!photo) return;
      this.photos[id] = { ...photo, ...updates };
    },
    selectPhoto(id: string, multi?: boolean) {
      const photo = this.photos[id];
      if (!photo) return;

      if (multi) {
        const isAlreadySelected = this.selectedIds.includes(id);

        if (isAlreadySelected) {
          this.selectedIds = this.selectedIds.filter((x) => x !== id);
          this.photos[id] = { ...photo, isSelected: false };

          if (this.selectedId === id) {
            this.selectedId = this.selectedIds[this.selectedIds.length - 1] ?? null;
          }
        } else {
          this.selectedIds = [...this.selectedIds, id];
          this.photos[id] = { ...photo, isSelected: true };
          this.selectedId = id;
        }

        return;
      }

      // single select: clear old
      for (const selectedId of this.selectedIds) {
        const p = this.photos[selectedId];
        if (p) this.photos[selectedId] = { ...p, isSelected: false };
      }

      this.photos[id] = { ...photo, isSelected: true };
      this.selectedIds = [id];
      this.selectedId = id;
    },
    clearSelection() {
      for (const id of this.selectedIds) {
        const photo = this.photos[id];
        if (photo) this.photos[id] = { ...photo, isSelected: false };
      }
      this.selectedIds = [];
      this.selectedId = null;
    },
    selectAll(groupId?: string) {
      const newSelectedIds: string[] = [];
      for (const photo of Object.values(this.photos)) {
        if (!groupId || photo.groupId === groupId) {
          newSelectedIds.push(photo.id);
          this.photos[photo.id] = { ...photo, isSelected: true };
        }
      }
      this.selectedIds = newSelectedIds;
      if (newSelectedIds.length === 1) this.selectedId = newSelectedIds[0];
    },
    movePhotos(ids: string[], targetGroupId: string) {
      this.selectedIds = this.selectedIds.filter((id) => !ids.includes(id));
      if (this.selectedId && ids.includes(this.selectedId)) this.selectedId = null;

      for (const id of ids) {
        const photo = this.photos[id];
        if (!photo) continue;
        this.photos[id] = { ...photo, groupId: targetGroupId, isSelected: false };
      }
    },
    movePhoto(id: string, targetGroupId: string) {
      const photo = this.photos[id];
      if (!photo) return;

      this.photos[id] = { ...photo, groupId: targetGroupId, isSelected: false };

      if (this.selectedId === id) {
        this.selectedId = null;
        this.selectedIds = [];
      }
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
    reset() {
      this.$reset();
    },
  },
});

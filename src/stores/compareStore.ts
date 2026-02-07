import { defineStore } from 'pinia';

interface CompareState {
  isActive: boolean;
  leftPhotoId: string | null;
  rightPhotoId: string | null;
  leftGroupId: string;
  rightGroupId: string;
  syncZoom: boolean;
  syncPan: boolean;
}

const initialState: CompareState = {
  isActive: false,
  leftPhotoId: null,
  rightPhotoId: null,
  leftGroupId: 'default',
  rightGroupId: 'reject',
  syncZoom: true,
  syncPan: true,
};

export const useCompareStore = defineStore('compare', {
  state: (): CompareState => ({ ...initialState }),
  actions: {
    startCompare(leftId: string, rightId: string) {
      this.isActive = true;
      this.leftPhotoId = leftId;
      this.rightPhotoId = rightId;
    },
    endCompare() {
      this.isActive = false;
      this.leftPhotoId = null;
      this.rightPhotoId = null;
    },
    setLeftPhoto(id: string | null) {
      this.leftPhotoId = id;
    },
    setRightPhoto(id: string | null) {
      this.rightPhotoId = id;
    },
    swapPhotos() {
      const temp = this.leftPhotoId;
      this.leftPhotoId = this.rightPhotoId;
      this.rightPhotoId = temp;
    },
    toggleSyncZoom() {
      this.syncZoom = !this.syncZoom;
    },
    toggleSyncPan() {
      this.syncPan = !this.syncPan;
    },
  },
});


import { defineStore } from 'pinia';
import type { AppSettings, Notification, ViewMode } from '../types';

let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

interface UIState {
  viewMode: ViewMode;
  sidebarCollapsed: boolean;
  zoomLevel: number;
  isImporting: boolean;
  importProgress: number;
  importTotal: number;
  importCurrent: string;
  notification: Notification | null;
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  thumbnailSize: 'medium',
  gridColumns: 4,
  showFileName: true,
  showFileSize: false,
};

const initialState: UIState = {
  viewMode: 'grid',
  sidebarCollapsed: false,
  zoomLevel: 1,
  isImporting: false,
  importProgress: 0,
  importTotal: 0,
  importCurrent: '',
  notification: null,
  settings: defaultSettings,
};

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({ ...initialState, settings: { ...defaultSettings } }),
  actions: {
    setViewMode(mode: ViewMode) {
      this.viewMode = mode;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    setZoomLevel(level: number) {
      this.zoomLevel = Math.max(0.5, Math.min(2, level));
    },
    setImporting(isImporting: boolean) {
      this.isImporting = isImporting;
      if (!isImporting) {
        this.importProgress = 0;
        this.importTotal = 0;
        this.importCurrent = '';
      }
    },
    setImportProgress(progress: number, total: number, current: string) {
      this.importProgress = progress;
      this.importTotal = total;
      this.importCurrent = current;
    },
    showNotification(notification: Omit<Notification, 'id'>, autoHideMs?: number) {
      const id = Math.random().toString(36).substring(2, 9);
      this.notification = { ...notification, id };

      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        autoHideTimer = null;
      }

      if (autoHideMs && autoHideMs > 0) {
        autoHideTimer = setTimeout(() => {
          if (this.notification?.id === id) {
            this.hideNotification();
          }
        }, autoHideMs);
      }

      return id;
    },
    hideNotification() {
      this.notification = null;
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        autoHideTimer = null;
      }
    },
    updateSettings(settings: Partial<AppSettings>) {
      Object.assign(this.settings, settings);
    },
    reset() {
      this.$reset();
    },
  },
});

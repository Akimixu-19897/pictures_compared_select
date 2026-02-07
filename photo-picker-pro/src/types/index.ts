// Photo Types
export interface Photo {
  id: string;
  name: string;
  path: string;
  size: number;
  width?: number;
  height?: number;
  format: string;
  createdAt: number;
  modifiedAt: number;
  thumbnailUrl?: string;
  groupId: string;
  isSelected: boolean;
}

export interface PhotoInfo {
  id: string;
  name: string;
  path: string;
  size: number;
  format: string;
  createdAt: number;
  modifiedAt: number;
}

// Group Types
export type GroupType = 'default' | 'keep' | 'reject';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  icon: string;
  color?: string;
  order: number;
}

// UI Types
export type ViewMode = 'grid' | 'compare';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

// Settings Types
export interface AppSettings {
  theme: 'dark' | 'light';
  thumbnailSize: 'small' | 'medium' | 'large';
  gridColumns: number;
  showFileName: boolean;
  showFileSize: boolean;
}

// Error Types
export enum ErrorCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_FORMAT = 'INVALID_FORMAT',
  THUMBNAIL_FAILED = 'THUMBNAIL_FAILED',
  IMPORT_INTERRUPTED = 'IMPORT_INTERRUPTED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  STORAGE_FULL = 'STORAGE_FULL',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  recoverable: boolean;
}

// Compare Types
export interface CompareState {
  isActive: boolean;
  leftPhotoId: string | null;
  rightPhotoId: string | null;
  leftGroupId: string;
  rightGroupId: string;
  syncZoom: boolean;
  syncPan: boolean;
}

// Import Types
export interface ImportProgress {
  total: number;
  current: number;
  currentFile: string;
  status: 'scanning' | 'generating' | 'complete' | 'error';
}

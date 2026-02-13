import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { PhotoInfo } from '../../types';

/**
 * Open folder dialog and return selected path
 */
export async function selectFolder(): Promise<string | null> {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: '选择照片文件夹',
    });
    return selected as string | null;
  } catch (error) {
    console.error('Failed to select folder:', error);
    return null;
  }
}

/**
 * Scan directory for image files
 */
export async function scanDirectory(path: string): Promise<PhotoInfo[]> {
  try {
    return await invoke('scan_directory', { path });
  } catch (error) {
    console.error('Failed to scan directory:', error);
    throw error;
  }
}

/**
 * Generate thumbnail for image
 */
export async function generateThumbnail(
  path: string,
  size: number = 200
): Promise<string> {
  try {
    return await invoke('generate_thumbnail', { path, size });
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    throw error;
  }
}

/**
 * Export photos to target directory
 */
export async function exportPhotos(
  photoPaths: string[],
  targetPath: string
): Promise<boolean> {
  try {
    return await invoke('export_photos', { photoPaths, targetPath });
  } catch (error) {
    console.error('Failed to export photos:', error);
    throw error;
  }
}

export type MovePhotosResult = {
  moved: number;
  moved_entries: Array<{ from: string; to: string }>;
  failed: Array<{ path: string; reason: string }>;
};

/**
 * Move rejected photos out of the imported folder into a sibling folder.
 */
export async function movePhotosToSiblingFolder(
  photoPaths: string[],
  importDir: string,
  siblingFolderName: string
): Promise<MovePhotosResult> {
  try {
    return await invoke('move_photos_to_sibling_folder', {
      photoPaths,
      importDir,
      siblingFolderName,
    });
  } catch (error) {
    console.error('Failed to move photos:', error);
    throw error;
  }
}

export async function restorePhotosFromSiblingFolder(
  photoPaths: string[],
  importDir: string,
  siblingFolderName: string
): Promise<MovePhotosResult> {
  try {
    return await invoke('restore_photos_from_sibling_folder', {
      photoPaths,
      importDir,
      siblingFolderName,
    });
  } catch (error) {
    console.error('Failed to restore photos:', error);
    throw error;
  }
}

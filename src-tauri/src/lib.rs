use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
pub struct PhotoInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub format: String,
    pub created_at: u64,
    pub modified_at: u64,
}

#[tauri::command]
async fn scan_directory(path: String) -> Result<Vec<PhotoInfo>, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("路径不存在".to_string());
    }

    if !path.is_dir() {
        return Err("路径不是文件夹".to_string());
    }

    let mut photos = Vec::new();
    let supported_formats = [
        "jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "heic", "raw",
    ];

    match std::fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let path = entry.path();

                if path.is_file() {
                    if let Some(ext) = path.extension() {
                        let ext = ext.to_string_lossy().to_lowercase();

                        if supported_formats.contains(&ext.as_str()) {
                            if let Ok(metadata) = entry.metadata() {
                                let name = path
                                    .file_name()
                                    .map(|n| n.to_string_lossy().to_string())
                                    .unwrap_or_default();

                                let id = format!(
                                    "{}",
                                    std::time::SystemTime::now()
                                        .duration_since(std::time::UNIX_EPOCH)
                                        .unwrap_or_default()
                                        .as_nanos()
                                );

                                photos.push(PhotoInfo {
                                    id,
                                    name,
                                    path: path.to_string_lossy().to_string(),
                                    size: metadata.len(),
                                    format: ext,
                                    created_at: metadata
                                        .created()
                                        .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                                        .duration_since(std::time::UNIX_EPOCH)
                                        .unwrap_or_default()
                                        .as_secs(),
                                    modified_at: metadata
                                        .modified()
                                        .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                                        .duration_since(std::time::UNIX_EPOCH)
                                        .unwrap_or_default()
                                        .as_secs(),
                                });
                            }
                        }
                    }
                }
            }
        }
        Err(e) => return Err(format!("读取目录失败: {}", e)),
    }

    Ok(photos)
}

#[tauri::command]
async fn generate_thumbnail(path: String, size: u32) -> Result<String, String> {
  // For now, just return the original path
  // In a real implementation, this would generate a thumbnail
  let _ = size;
  Ok(path)
}

#[tauri::command]
async fn export_photos(photo_paths: Vec<String>, target_path: String) -> Result<bool, String> {
    use std::fs;

    let target = Path::new(&target_path);

    if !target.exists() {
        fs::create_dir_all(target).map_err(|e| format!("创建目标目录失败: {}", e))?;
    }

    for photo_path in photo_paths {
        let source = Path::new(&photo_path);
        if let Some(filename) = source.file_name() {
            let dest = target.join(filename);
            fs::copy(source, dest).map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }

  Ok(true)
}

#[derive(Debug, Serialize)]
struct MoveFailure {
  path: String,
  reason: String,
}

#[derive(Debug, Serialize)]
struct MoveResult {
  moved: usize,
  failed: Vec<MoveFailure>,
}

fn unique_dest_path(dest_dir: &Path, file_name: &str) -> PathBuf {
  let candidate = dest_dir.join(file_name);
  if !candidate.exists() {
    return candidate;
  }

  let file_path = Path::new(file_name);
  let stem = file_path
    .file_stem()
    .map(|s| s.to_string_lossy().to_string())
    .unwrap_or_else(|| "file".to_string());
  let ext = file_path.extension().map(|e| e.to_string_lossy().to_string());

  for i in 1..=1000 {
    let next_name = match &ext {
      Some(ext) if !ext.is_empty() => format!("{stem}_{i}.{ext}"),
      _ => format!("{stem}_{i}"),
    };
    let next_path = dest_dir.join(next_name);
    if !next_path.exists() {
      return next_path;
    }
  }

  // Fallback: extremely unlikely
  dest_dir.join(format!("{stem}_{}", uuid()))
}

fn uuid() -> String {
  let n = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap_or_default()
    .as_nanos();
  format!("{n}")
}

#[tauri::command]
async fn move_photos_to_sibling_folder(
  photo_paths: Vec<String>,
  import_dir: String,
  sibling_folder_name: String,
) -> Result<MoveResult, String> {
  let import_dir_path = PathBuf::from(import_dir);
  let import_dir_canon = import_dir_path
    .canonicalize()
    .map_err(|e| format!("导入目录不可用: {e}"))?;

  let parent = import_dir_canon
    .parent()
    .ok_or_else(|| "导入目录没有上级目录，无法创建同级文件夹".to_string())?;

  let dest_dir = parent.join(&sibling_folder_name);
  std::fs::create_dir_all(&dest_dir)
    .map_err(|e| format!("创建目标文件夹失败（{}）: {e}", dest_dir.display()))?;

  let mut moved = 0usize;
  let mut failed: Vec<MoveFailure> = Vec::new();

  for path in photo_paths {
    let src_path = PathBuf::from(&path);

    let src_canon = match src_path.canonicalize() {
      Ok(p) => p,
      Err(e) => {
        failed.push(MoveFailure {
          path,
          reason: format!("源文件不可用: {e}"),
        });
        continue;
      }
    };

    if !src_canon.starts_with(&import_dir_canon) {
      failed.push(MoveFailure {
        path,
        reason: "源文件不在导入目录内，已跳过".to_string(),
      });
      continue;
    }

    let file_name = match src_canon.file_name() {
      Some(n) => n.to_string_lossy().to_string(),
      None => {
        failed.push(MoveFailure {
          path,
          reason: "无法获取文件名".to_string(),
        });
        continue;
      }
    };

    let dest_path = unique_dest_path(&dest_dir, &file_name);

    match std::fs::rename(&src_canon, &dest_path) {
      Ok(()) => {
        moved += 1;
      }
      Err(rename_err) => {
        // Cross-device move or permissions: fallback to copy + delete
        match std::fs::copy(&src_canon, &dest_path) {
          Ok(_) => match std::fs::remove_file(&src_canon) {
            Ok(_) => moved += 1,
            Err(e) => {
              failed.push(MoveFailure {
                path,
                reason: format!("复制成功但删除源文件失败: {e}"),
              });
            }
          },
          Err(copy_err) => {
            failed.push(MoveFailure {
              path,
              reason: format!("移动失败: {rename_err}; 复制也失败: {copy_err}"),
            });
          }
        }
      }
    }
  }

  Ok(MoveResult { moved, failed })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      scan_directory,
      generate_thumbnail,
      export_photos,
      move_photos_to_sibling_folder
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

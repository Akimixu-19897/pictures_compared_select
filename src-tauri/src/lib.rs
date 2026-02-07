use serde::{Deserialize, Serialize};
use std::path::Path;

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
async fn generate_thumbnail(path: String, _size: u32) -> Result<String, String> {
    // For now, just return the original path
    // In a real implementation, this would generate a thumbnail
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            generate_thumbnail,
            export_photos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

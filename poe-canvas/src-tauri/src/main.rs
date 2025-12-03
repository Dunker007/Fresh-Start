// Nexus Workspace - Tauri Backend
// Native filesystem, LLM detection, and system integration

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
struct FileEntry {
    name: String,
    path: String,
    is_directory: bool,
    size: u64,
    modified: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct LLMStatus {
    available: bool,
    provider: Option<String>,
    models: Vec<String>,
}

// Read directory contents
#[tauri::command]
async fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let path = PathBuf::from(&path);
    
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }

    let mut entries = Vec::new();
    
    match fs::read_dir(&path) {
        Ok(dir) => {
            for entry in dir.flatten() {
                let metadata = entry.metadata().ok();
                let file_entry = FileEntry {
                    name: entry.file_name().to_string_lossy().to_string(),
                    path: entry.path().to_string_lossy().to_string(),
                    is_directory: entry.path().is_dir(),
                    size: metadata.as_ref().map(|m| m.len()).unwrap_or(0),
                    modified: metadata.and_then(|m| {
                        m.modified().ok().map(|t| {
                            format!("{:?}", t)
                        })
                    }),
                };
                entries.push(file_entry);
            }
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    }

    // Sort: directories first, then by name
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

// Check local LLM availability
#[tauri::command]
async fn check_local_llm() -> Result<LLMStatus, String> {
    let client = reqwest::Client::new();
    let mut status = LLMStatus {
        available: false,
        provider: None,
        models: Vec::new(),
    };

    // Check LM Studio (localhost:1234)
    if let Ok(resp) = client
        .get("http://localhost:1234/v1/models")
        .timeout(std::time::Duration::from_secs(2))
        .send()
        .await
    {
        if resp.status().is_success() {
            status.available = true;
            status.provider = Some("lmstudio".to_string());
            if let Ok(json) = resp.json::<serde_json::Value>().await {
                if let Some(data) = json.get("data").and_then(|d| d.as_array()) {
                    status.models = data
                        .iter()
                        .filter_map(|m| m.get("id").and_then(|id| id.as_str()))
                        .map(String::from)
                        .collect();
                }
            }
            return Ok(status);
        }
    }

    // Check Ollama (localhost:11434)
    if let Ok(resp) = client
        .get("http://localhost:11434/api/tags")
        .timeout(std::time::Duration::from_secs(2))
        .send()
        .await
    {
        if resp.status().is_success() {
            status.available = true;
            status.provider = Some("ollama".to_string());
            if let Ok(json) = resp.json::<serde_json::Value>().await {
                if let Some(models) = json.get("models").and_then(|m| m.as_array()) {
                    status.models = models
                        .iter()
                        .filter_map(|m| m.get("name").and_then(|n| n.as_str()))
                        .map(String::from)
                        .collect();
                }
            }
            return Ok(status);
        }
    }

    Ok(status)
}

// Get system paths (Desktop, Documents, Downloads)
#[tauri::command]
fn get_system_paths() -> Result<serde_json::Value, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    
    Ok(serde_json::json!({
        "home": home.to_string_lossy(),
        "desktop": dirs::desktop_dir().map(|p| p.to_string_lossy().to_string()),
        "documents": dirs::document_dir().map(|p| p.to_string_lossy().to_string()),
        "downloads": dirs::download_dir().map(|p| p.to_string_lossy().to_string()),
    }))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_directory,
            check_local_llm,
            get_system_paths
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

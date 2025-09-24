#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WindowBuilder};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            println!("ChefMind Tauri App Starting...");

            // 开发模式下自动打开开发者工具
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_devtools,
            log_message
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn toggle_devtools(window: tauri::Window) {
    window.open_devtools();
}

#[tauri::command]
fn log_message(message: String) {
    println!("[Tauri Log]: {}", message);
}
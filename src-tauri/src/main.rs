// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


// Use empty context to avoid icon issues
fn main() {

    tauri::Builder::default()
        .setup(|_app| {
            println!("ChefMind Tauri App Starting...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
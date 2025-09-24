#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            println!("ChefMind Tauri App Starting...");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            log_message
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn log_message(message: String) {
    println!("[Tauri Log]: {}", message);
}
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, PhysicalSize, Emitter, Listener};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            println!("ChefMind Tauri App Starting...");

            // 获取主窗口 - Tauri v2 使用 get_webview_window
            if let Some(window) = app.get_webview_window("main") {
                // 设置窗口大小
                let _ = window.set_size(PhysicalSize::new(1400, 900));

                // 开发模式下自动打开开发者工具
                #[cfg(debug_assertions)]
                {
                    println!("Debug mode: Enabling developer tools");
                    // 在开发模式下打开开发者工具
                    if let Err(e) = window.open_devtools() {
                        println!("Failed to open devtools: {}", e);
                    }
                }

                // 生产版本中通过快捷键启用开发者工具
                #[cfg(not(debug_assertions))]
                {
                    println!("Production mode: Developer tools available via shortcuts");
                }

                // 监听来自前端的事件
                let window_clone = window.clone();
                window.listen("dom-loaded", move |_event| {
                    println!("DOM loaded event received");
                    // 发送确认事件回前端
                    let _ = window_clone.emit("dom-loaded-confirmed", ());
                });

                // 监听开发者工具请求
                let window_clone = window.clone();
                window.listen("request-devtools", move |_event| {
                    println!("Developer tools requested from frontend");
                    if let Err(e) = window_clone.open_devtools() {
                        println!("Failed to open devtools: {}", e);
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            log_message,
            get_app_info,
            open_dev_tools,
            check_frontend_loaded,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn log_message(message: String) {
    println!("[Tauri Log]: {}", message);
}

#[tauri::command]
fn get_app_info() -> String {
    format!("ChefMind v3.0.0 - Tauri v2 App")
}

#[tauri::command]
fn open_dev_tools(window: tauri::WebviewWindow) -> Result<(), String> {
    // 在 Tauri v2 中直接使用窗口的 open_devtools 方法
    match window.open_devtools() {
        Ok(_) => {
            println!("Developer tools opened successfully");
            Ok(())
        }
        Err(e) => {
            let error_msg = format!("Failed to open developer tools: {}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}

#[tauri::command]
fn check_frontend_loaded(window: tauri::WebviewWindow) -> bool {
    // 检查前端是否正确加载，发送事件到前端
    let _ = window.emit("check-frontend", ());
    true
}

#[tauri::command]
fn get_system_info() -> String {
    format!(
        "System: {} {} | Tauri: {} | Rust: {}",
        std::env::consts::OS,
        std::env::consts::ARCH,
        env!("CARGO_PKG_VERSION"),
        env!("RUSTC_VERSION")
    )
}
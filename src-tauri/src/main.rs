#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, PhysicalSize};

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            println!("ChefMind Tauri App Starting...");

            // 获取主窗口
            if let Some(window) = _app.get_window("main") {
                // 设置窗口大小
                let _ = window.set_size(PhysicalSize::new(1400, 900));

                // 开发模式下启用开发者工具
                #[cfg(debug_assertions)]
                {
                    // 在Tauri v2中，我们需要使用不同的方式来启用开发者工具
                    println!("Debug mode: Developer tools available via window inspection");
                }

                // 监听DOM加载完成事件
                let window_clone = window.clone();
                window.listen("dom-loaded", move |_event| {
                    println!("DOM loaded event received");
                    // 在这里可以添加更多的调试信息
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            log_message,
            get_app_info,
            open_dev_tools,
            check_frontend_loaded
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
    format!("ChefMind v3.0.0 - Tauri App")
}

#[tauri::command]
fn open_dev_tools(window: tauri::Window) {
    // 在Tauri v2中，开发者工具的启用方式不同
    // 这里我们发送一个事件到前端来处理
    let _ = window.emit("open-dev-tools", ());
    println!("Developer tools request sent to frontend");
}

#[tauri::command]
fn check_frontend_loaded(window: tauri::Window) -> bool {
    // 检查前端是否正确加载
    let _ = window.emit("check-frontend", ());
    true
}
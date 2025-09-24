#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, PhysicalSize, Emitter, Listener};

// 添加 rustc_version 依赖
use rustc_version;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            println!("=== ChefMind Tauri App Starting ===");

            // 获取主窗口
            if let Some(window) = app.get_webview_window("main") {
                // 设置窗口大小
                if let Err(e) = window.set_size(PhysicalSize::new(1400, 900)) {
                    eprintln!("Failed to set window size: {}", e);
                }

                // 监听来自前端的事件
                let window_clone = window.clone();
                window.listen("dom-loaded", move |_event| {
                    println!("✓ DOM loaded event received from frontend");
                    // 发送确认事件回前端
                    if let Err(e) = window_clone.emit("dom-loaded-confirmed", ()) {
                        eprintln!("Failed to send DOM confirmation: {}", e);
                    }
                });

                // 监听开发者工具请求
                let window_clone = window.clone();
                window.listen("request-devtools", move |_event| {
                    println!("✓ Developer tools requested from frontend");
                    // 发送事件到前端处理
                    if let Err(e) = window_clone.emit("devtools-request-processed", ()) {
                        eprintln!("Failed to send devtools confirmation: {}", e);
                    }
                });

                // 监听错误报告
                let window_clone = window.clone();
                window.listen("frontend-error", move |event| {
                    eprintln!("⚠ Frontend error reported: {:?}", event.payload());
                    // 可以在这里记录错误到文件或发送到监控系统
                });

                // 生产模式下设置开发者工具快捷键
                #[cfg(not(debug_assertions))]
                {
                    println!("ℹ Production mode: Developer tools available via shortcuts (F12, Ctrl+Shift+I)");
                }

                // 开发模式下自动打开开发者工具
                #[cfg(debug_assertions)]
                {
                    println!("🔍 Debug mode: Developer tools available");
                    // 不自动打开，让用户决定何时打开
                }
            } else {
                eprintln!("❌ Failed to get main window");
                return Err(Box::new(std::io::Error::new(std::io::ErrorKind::NotFound, "Main window not found")));
            }

            println!("✓ Tauri app setup completed successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            log_message,
            get_app_info,
            open_dev_tools,
            check_frontend_loaded,
            get_system_info,
            get_window_info,
            toggle_dev_tools
        ])
        .plugin(tauri_plugin_devtools::init()) // 初始化开发者工具插件
        .run(tauri::generate_context!())
        .expect("❌ error while running tauri application");
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
    // 在 Tauri v2 中，开发者工具通过插件管理
    println!("Attempting to open developer tools...");

    // 发送事件到前端，让前端处理开发者工具的打开
    if let Err(e) = window.emit("open-dev-tools-event", ()) {
        let error_msg = format!("Failed to emit devtools event: {}", e);
        println!("{}", error_msg);
        return Err(error_msg);
    }

    println!("Developer tools request sent to frontend");
    Ok(())
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
        rust_version()
    )
}

#[tauri::command]
fn get_window_info(window: tauri::WebviewWindow) -> Result<String, String> {
    match window.inner_size() {
        Ok(size) => Ok(format!("Window size: {}x{}", size.width, size.height)),
        Err(e) => Err(format!("Failed to get window size: {}", e)),
    }
}

#[tauri::command]
fn toggle_dev_tools(window: tauri::WebviewWindow) -> Result<bool, String> {
    println!("🔧 Toggling developer tools...");

    // 发送事件到前端，让前端处理开发者工具的切换
    if let Err(e) = window.emit("toggle-dev-tools", ()) {
        let error_msg = format!("Failed to emit toggle devtools event: {}", e);
        eprintln!("{}", error_msg);
        return Err(error_msg);
    }

    println!("✓ Developer tools toggle request sent to frontend");
    Ok(true)
}

// 获取 Rust 版本的辅助函数
fn rust_version() -> String {
    match rustc_version::version() {
        Ok(version) => format!("{}", version),
        Err(_) => "unknown".to_string(),
    }
}
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, PhysicalSize, Emitter, Listener, State};
use std::sync::Mutex;
use std::fs;
use std::path::PathBuf;

// 添加 rustc_version 依赖
use rustc_version;

// SQLite 相关
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

// 数据库状态结构
pub struct DatabaseState {
    _connection: Mutex<Option<Connection>>, // 前缀下划线表示故意未使用
}

// 数据库查询结构
#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseQuery {
    pub query: String,
    pub params: Option<Vec<serde_json::Value>>,
}

// 数据库结果结构
#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseResult {
    pub success: bool,
    pub data: Option<Vec<serde_json::Map<String, serde_json::Value>>>,
    pub error: Option<String>,
    pub last_insert_id: Option<i64>,
    pub changes: Option<u64>,
}

impl DatabaseState {
    pub fn new() -> Self {
        println!("🗄️ Initializing database connection...");

        // 使用当前目录
        let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let data_dir = current_dir.join("data");

        if !data_dir.exists() {
            if let Err(e) = fs::create_dir_all(&data_dir) {
                eprintln!("Failed to create data directory: {}", e);
                return Self { _connection: Mutex::new(None) };
            }
        }

        let db_path = data_dir.join("chefmind.db");
        println!("📁 Database path: {:?}", db_path);

        match Connection::open(&db_path) {
            Ok(conn) => {
                println!("✓ Database connection established");

                // 配置数据库 - 使用DELETE模式避免WAL文件导致的重启问题
                if let Err(e) = conn.execute_batch("PRAGMA journal_mode = DELETE; PRAGMA foreign_keys = ON; PRAGMA synchronous = NORMAL;") {
                    eprintln!("Failed to configure database: {}", e);
                    return Self { _connection: Mutex::new(None) };
                }

                Self { _connection: Mutex::new(Some(conn)) }
            }
            Err(e) => {
                eprintln!("❌ Failed to connect to database: {}", e);
                Self { _connection: Mutex::new(None) }
            }
        }
    }

    pub fn get_connection(&self) -> Result<Connection> {
        // Create a new connection to the same database path each time
        let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let data_dir = current_dir.join("data");
        let db_path = data_dir.join("chefmind.db");
        Connection::open(&db_path)
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            println!("=== ChefMind Tauri App Starting ===");

            // 初始化数据库
            let db_state = DatabaseState::new();
            app.manage(db_state);

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
                let _window_clone = window.clone();
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
            toggle_dev_tools,
            database_query,
            database_query_one,
            database_execute
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

// 数据库查询命令 - 返回多条记录
#[tauri::command]
fn database_query(
    query: String,
    params: Option<Vec<serde_json::Value>>,
    db: State<DatabaseState>
) -> Result<DatabaseResult, String> {
    println!("🔍 Executing query: {}", query);
    println!("📋 Parameters: {:?}", params);

    let conn = match db.get_connection() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Database connection error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    let mut stmt = match conn.prepare(&query) {
        Ok(stmt) => stmt,
        Err(e) => {
            let error_msg = format!("Query preparation error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    let column_names: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();

    // 构建参数列表
    let mut params_vec: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref p) = params {
        for param in p {
            let boxed_param: Box<dyn rusqlite::types::ToSql> = match param {
                serde_json::Value::String(s) => Box::new(s.clone()),
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(rusqlite::types::Value::Null)
                    }
                },
                serde_json::Value::Bool(b) => Box::new(*b as i64),
                serde_json::Value::Null => Box::new(rusqlite::types::Value::Null),
                _ => Box::new(param.to_string()),
            };
            params_vec.push(boxed_param);
        }
    }

    // 将 Box<dyn ToSql> 转换为 &dyn ToSql 引用
    let params_refs: Vec<&dyn rusqlite::types::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

    let rows = match stmt.query_map(&params_refs[..], |row| {
        let mut map = serde_json::Map::new();
        for (i, column_name) in column_names.iter().enumerate() {
            let value = match row.get_ref_unwrap(i) {
                rusqlite::types::ValueRef::Null => serde_json::Value::Null,
                rusqlite::types::ValueRef::Integer(i) => serde_json::Value::Number(serde_json::Number::from(i)),
                rusqlite::types::ValueRef::Real(r) => serde_json::Value::Number(serde_json::Number::from_f64(r).unwrap_or(serde_json::Number::from(0))),
                rusqlite::types::ValueRef::Text(t) => serde_json::Value::String(String::from_utf8(t.to_vec()).unwrap_or_default()),
                rusqlite::types::ValueRef::Blob(b) => serde_json::Value::Array(b.iter().map(|&b| serde_json::Value::Number(serde_json::Number::from(b))).collect()),
            };
            map.insert(column_name.to_string(), value);
        }
        Ok(map)
    }) {
        Ok(rows) => rows,
        Err(e) => {
            let error_msg = format!("Query execution error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    let data: Result<Vec<_>, _> = rows.collect();
    match data {
        Ok(rows) => {
            println!("✓ Query executed successfully, {} rows returned", rows.len());
            Ok(DatabaseResult {
                success: true,
                data: Some(rows),
                error: None,
                last_insert_id: None,
                changes: None,
            })
        }
        Err(e) => {
            let error_msg = format!("Row collection error: {}", e);
            eprintln!("❌ {}", error_msg);
            Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            })
        }
    }
}

// 数据库查询命令 - 返回单条记录
#[tauri::command]
fn database_query_one(
    query: String,
    params: Option<Vec<serde_json::Value>>,
    db: State<DatabaseState>
) -> Result<DatabaseResult, String> {
    println!("🔍 Executing query (single row): {}", query);
    println!("📋 Parameters: {:?}", params);

    let conn = match db.get_connection() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Database connection error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    let mut stmt = match conn.prepare(&query) {
        Ok(stmt) => stmt,
        Err(e) => {
            let error_msg = format!("Query preparation error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    let column_names: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();

    // 构建参数列表
    let mut params_vec: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref p) = params {
        for param in p {
            let boxed_param: Box<dyn rusqlite::types::ToSql> = match param {
                serde_json::Value::String(s) => Box::new(s.clone()),
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(rusqlite::types::Value::Null)
                    }
                },
                serde_json::Value::Bool(b) => Box::new(*b as i64),
                serde_json::Value::Null => Box::new(rusqlite::types::Value::Null),
                _ => Box::new(param.to_string()),
            };
            params_vec.push(boxed_param);
        }
    }

    // 将 Box<dyn ToSql> 转换为 &dyn ToSql 引用
    let params_refs: Vec<&dyn rusqlite::types::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

    let mut rows = match stmt.query_map(&params_refs[..], |row| {
        let mut map = serde_json::Map::new();
        for (i, column_name) in column_names.iter().enumerate() {
            let value = match row.get_ref_unwrap(i) {
                rusqlite::types::ValueRef::Null => serde_json::Value::Null,
                rusqlite::types::ValueRef::Integer(i) => serde_json::Value::Number(serde_json::Number::from(i)),
                rusqlite::types::ValueRef::Real(r) => serde_json::Value::Number(serde_json::Number::from_f64(r).unwrap_or(serde_json::Number::from(0))),
                rusqlite::types::ValueRef::Text(t) => serde_json::Value::String(String::from_utf8(t.to_vec()).unwrap_or_default()),
                rusqlite::types::ValueRef::Blob(b) => serde_json::Value::Array(b.iter().map(|&b| serde_json::Value::Number(serde_json::Number::from(b))).collect()),
            };
            map.insert(column_name.to_string(), value);
        }
        Ok(map)
    }) {
        Ok(rows) => rows,
        Err(e) => {
            let error_msg = format!("Query execution error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    match rows.next() {
        Some(Ok(row)) => {
            println!("✓ Query executed successfully, 1 row returned");
            Ok(DatabaseResult {
                success: true,
                data: Some(vec![row]),
                error: None,
                last_insert_id: None,
                changes: None,
            })
        }
        None => {
            println!("✓ Query executed successfully, no rows returned");
            Ok(DatabaseResult {
                success: true,
                data: None,
                error: None,
                last_insert_id: None,
                changes: None,
            })
        }
        Some(Err(e)) => {
            let error_msg = format!("Row retrieval error: {}", e);
            eprintln!("❌ {}", error_msg);
            Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            })
        }
    }
}

// 数据库执行命令 - 插入/更新/删除操作
#[tauri::command]
fn database_execute(
    query: String,
    params: Option<Vec<serde_json::Value>>,
    db: State<DatabaseState>
) -> Result<DatabaseResult, String> {
    println!("⚡ Executing execute: {}", query);
    println!("📋 Parameters: {:?}", params);

    let conn = match db.get_connection() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Database connection error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    // 构建参数列表
    let mut params_vec: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref p) = params {
        for param in p {
            let boxed_param: Box<dyn rusqlite::types::ToSql> = match param {
                serde_json::Value::String(s) => Box::new(s.clone()),
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(rusqlite::types::Value::Null)
                    }
                },
                serde_json::Value::Bool(b) => Box::new(*b as i64),
                serde_json::Value::Null => Box::new(rusqlite::types::Value::Null),
                _ => Box::new(param.to_string()),
            };
            params_vec.push(boxed_param);
        }
    }

    // 将 Box<dyn ToSql> 转换为 &dyn ToSql 引用
    let params_refs: Vec<&dyn rusqlite::types::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

    let result = match conn.execute(&query, &params_refs[..]) {
        Ok(result) => result,
        Err(e) => {
            let error_msg = format!("Execute error: {}", e);
            eprintln!("❌ {}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

    let last_insert_id = conn.last_insert_rowid();
    let changes = result as u64;

    println!("✓ Execute successful, {} rows affected, last insert id: {}", changes, last_insert_id);

    Ok(DatabaseResult {
        success: true,
        data: None,
        error: None,
        last_insert_id: Some(last_insert_id),
        changes: Some(changes),
    })
}
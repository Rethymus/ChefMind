use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{Emitter, Listener, Manager, PhysicalSize, State};

// Database state structure
pub struct DatabaseState {
    _connection: Mutex<Option<Connection>>,
    db_path: PathBuf,
}

// Database query structure
#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseQuery {
    pub query: String,
    pub params: Option<Vec<serde_json::Value>>,
}

// Database result structure
#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseResult {
    pub success: bool,
    pub data: Option<Vec<serde_json::Map<String, serde_json::Value>>>,
    pub error: Option<String>,
    pub last_insert_id: Option<i64>,
    pub changes: Option<u64>,
}

impl DatabaseState {
    pub fn new(app: &tauri::App) -> Self {
        println!("Initializing database connection...");
        let data_dir = app.path().app_data_dir().unwrap_or_else(|_| {
            std::env::current_dir()
                .unwrap_or_else(|_| PathBuf::from("."))
                .join("data")
        });

        if !data_dir.exists() {
            if let Err(e) = fs::create_dir_all(&data_dir) {
                eprintln!("Failed to create data directory: {}", e);
                return Self {
                    _connection: Mutex::new(None),
                    db_path: data_dir.join("chefmind.db"),
                };
            }
        }

        let db_path = data_dir.join("chefmind.db");
        println!("Database path: {:?}", db_path);

        match Connection::open(&db_path) {
            Ok(conn) => {
                println!("Database connection established");
                if let Err(e) = conn.execute_batch("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 10000;") {
                    eprintln!("Failed to configure database: {}", e);
                    return Self { _connection: Mutex::new(None), db_path };
                }
                if let Err(e) = initialize_schema(&conn) {
                    eprintln!("Failed to initialize database schema: {}", e);
                    return Self {
                        _connection: Mutex::new(None),
                        db_path,
                    };
                }
                Self {
                    _connection: Mutex::new(Some(conn)),
                    db_path,
                }
            }
            Err(e) => {
                eprintln!("Failed to connect to database: {}", e);
                Self {
                    _connection: Mutex::new(None),
                    db_path,
                }
            }
        }
    }

    pub fn get_connection(&self) -> Result<Connection> {
        let conn = Connection::open(&self.db_path)?;
        conn.execute_batch("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 10000;")?;
        initialize_schema(&conn)?;
        Ok(conn)
    }
}

fn initialize_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            preferences TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            ingredients TEXT NOT NULL,
            instructions TEXT NOT NULL,
            cooking_time INTEGER,
            difficulty TEXT,
            servings INTEGER DEFAULT 4,
            category TEXT,
            tags TEXT,
            nutrition_info TEXT,
            image_url TEXT,
            cooking_methods TEXT,
            view_count INTEGER DEFAULT 0,
            favorite_count INTEGER DEFAULT 0,
            rating_count INTEGER DEFAULT 0,
            average_rating REAL DEFAULT 0,
            ai_provider TEXT,
            ai_model TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            recipe_id INTEGER NOT NULL,
            recipe_title TEXT,
            recipe_image TEXT,
            notes TEXT,
            rating INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
            UNIQUE(session_id, recipe_id)
        );

        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            ingredients TEXT NOT NULL,
            cooking_methods TEXT,
            dietary_restrictions TEXT,
            result_count INTEGER DEFAULT 0,
            search_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            ttl INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME
        );

        CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
        CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
        CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
        CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at);
        CREATE INDEX IF NOT EXISTS idx_favorites_session_id ON favorites(session_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_recipe_id ON favorites(recipe_id);
        CREATE INDEX IF NOT EXISTS idx_search_history_session_id ON search_history(session_id);
        CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
        CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
        CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
        "#,
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            println!("=== ChefMind Tauri App Starting ===");
            let db_state = DatabaseState::new(app);
            app.manage(db_state);

            if let Some(window) = app.get_webview_window("main") {
                #[cfg(not(mobile))]
                {
                    if let Err(e) = window.set_size(PhysicalSize::new(1400, 900)) {
                        eprintln!("Failed to set window size: {}", e);
                    }
                }

                let window_clone = window.clone();
                window.listen("dom-loaded", move |_event| {
                    println!("DOM loaded event received from frontend");
                    if let Err(e) = window_clone.emit("dom-loaded-confirmed", ()) {
                        eprintln!("Failed to send DOM confirmation: {}", e);
                    }
                });

                let window_clone = window.clone();
                window.listen("request-devtools", move |_event| {
                    println!("Developer tools requested from frontend");
                    if let Err(e) = window_clone.emit("devtools-request-processed", ()) {
                        eprintln!("Failed to send devtools confirmation: {}", e);
                    }
                });

                let _window_clone = window.clone();
                window.listen("frontend-error", move |event| {
                    eprintln!("Frontend error reported: {:?}", event.payload());
                });

                #[cfg(debug_assertions)]
                {
                    println!("Debug mode: Developer tools available");
                }
            } else {
                eprintln!("Failed to get main window");
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "Main window not found",
                )));
            }

            println!("Tauri app setup completed successfully");
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
        .plugin(tauri_plugin_devtools::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn log_message(message: String) {
    println!("[Tauri Log]: {}", message);
}

#[tauri::command]
fn get_app_info() -> String {
    "ChefMind v3.0.0 - Tauri v2 App".to_string()
}

#[tauri::command]
fn open_dev_tools(window: tauri::WebviewWindow) -> Result<(), String> {
    println!("Attempting to open developer tools...");
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
    let _ = window.emit("check-frontend", ());
    true
}

#[tauri::command]
fn get_system_info() -> String {
    format!(
        "System: {} {} | Tauri: {}",
        std::env::consts::OS,
        std::env::consts::ARCH,
        env!("CARGO_PKG_VERSION")
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
    println!("Toggling developer tools...");
    if let Err(e) = window.emit("toggle-dev-tools", ()) {
        let error_msg = format!("Failed to emit toggle devtools event: {}", e);
        eprintln!("{}", error_msg);
        return Err(error_msg);
    }
    println!("Developer tools toggle request sent to frontend");
    Ok(true)
}

#[tauri::command]
fn database_query(
    query: String,
    params: Option<Vec<serde_json::Value>>,
    db: State<DatabaseState>,
) -> Result<DatabaseResult, String> {
    println!("Executing query: {}", query);

    let conn = match db.get_connection() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Database connection error: {}", e);
            eprintln!("{}", error_msg);
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
            eprintln!("{}", error_msg);
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
                }
                serde_json::Value::Bool(b) => Box::new(*b as i64),
                serde_json::Value::Null => Box::new(rusqlite::types::Value::Null),
                _ => Box::new(param.to_string()),
            };
            params_vec.push(boxed_param);
        }
    }

    let params_refs: Vec<&dyn rusqlite::types::ToSql> =
        params_vec.iter().map(|p| p.as_ref()).collect();

    let rows = match stmt.query_map(&params_refs[..], |row| {
        let mut map = serde_json::Map::new();
        for (i, column_name) in column_names.iter().enumerate() {
            let value = match row.get_ref_unwrap(i) {
                rusqlite::types::ValueRef::Null => serde_json::Value::Null,
                rusqlite::types::ValueRef::Integer(i) => {
                    serde_json::Value::Number(serde_json::Number::from(i))
                }
                rusqlite::types::ValueRef::Real(r) => serde_json::Value::Number(
                    serde_json::Number::from_f64(r).unwrap_or(serde_json::Number::from(0)),
                ),
                rusqlite::types::ValueRef::Text(t) => {
                    serde_json::Value::String(String::from_utf8(t.to_vec()).unwrap_or_default())
                }
                rusqlite::types::ValueRef::Blob(b) => serde_json::Value::Array(
                    b.iter()
                        .map(|&b| serde_json::Value::Number(serde_json::Number::from(b)))
                        .collect(),
                ),
            };
            map.insert(column_name.to_string(), value);
        }
        Ok(map)
    }) {
        Ok(rows) => rows,
        Err(e) => {
            let error_msg = format!("Query execution error: {}", e);
            eprintln!("{}", error_msg);
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
            println!("Query executed successfully, {} rows returned", rows.len());
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
            eprintln!("{}", error_msg);
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

#[tauri::command]
fn database_query_one(
    query: String,
    params: Option<Vec<serde_json::Value>>,
    db: State<DatabaseState>,
) -> Result<DatabaseResult, String> {
    println!("Executing query (single row): {}", query);

    let conn = match db.get_connection() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Database connection error: {}", e);
            eprintln!("{}", error_msg);
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
            eprintln!("{}", error_msg);
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
                }
                serde_json::Value::Bool(b) => Box::new(*b as i64),
                serde_json::Value::Null => Box::new(rusqlite::types::Value::Null),
                _ => Box::new(param.to_string()),
            };
            params_vec.push(boxed_param);
        }
    }

    let params_refs: Vec<&dyn rusqlite::types::ToSql> =
        params_vec.iter().map(|p| p.as_ref()).collect();

    let mut rows = match stmt.query_map(&params_refs[..], |row| {
        let mut map = serde_json::Map::new();
        for (i, column_name) in column_names.iter().enumerate() {
            let value = match row.get_ref_unwrap(i) {
                rusqlite::types::ValueRef::Null => serde_json::Value::Null,
                rusqlite::types::ValueRef::Integer(i) => {
                    serde_json::Value::Number(serde_json::Number::from(i))
                }
                rusqlite::types::ValueRef::Real(r) => serde_json::Value::Number(
                    serde_json::Number::from_f64(r).unwrap_or(serde_json::Number::from(0)),
                ),
                rusqlite::types::ValueRef::Text(t) => {
                    serde_json::Value::String(String::from_utf8(t.to_vec()).unwrap_or_default())
                }
                rusqlite::types::ValueRef::Blob(b) => serde_json::Value::Array(
                    b.iter()
                        .map(|&b| serde_json::Value::Number(serde_json::Number::from(b)))
                        .collect(),
                ),
            };
            map.insert(column_name.to_string(), value);
        }
        Ok(map)
    }) {
        Ok(rows) => rows,
        Err(e) => {
            let error_msg = format!("Query execution error: {}", e);
            eprintln!("{}", error_msg);
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
            println!("Query executed successfully, 1 row returned");
            Ok(DatabaseResult {
                success: true,
                data: Some(vec![row]),
                error: None,
                last_insert_id: None,
                changes: None,
            })
        }
        None => {
            println!("Query executed successfully, no rows returned");
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
            eprintln!("{}", error_msg);
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

#[tauri::command]
fn database_execute(
    query: String,
    params: Option<Vec<serde_json::Value>>,
    db: State<DatabaseState>,
) -> Result<DatabaseResult, String> {
    println!("Executing execute: {}", query);

    let conn = match db.get_connection() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Database connection error: {}", e);
            eprintln!("{}", error_msg);
            return Ok(DatabaseResult {
                success: false,
                data: None,
                error: Some(error_msg),
                last_insert_id: None,
                changes: None,
            });
        }
    };

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
                }
                serde_json::Value::Bool(b) => Box::new(*b as i64),
                serde_json::Value::Null => Box::new(rusqlite::types::Value::Null),
                _ => Box::new(param.to_string()),
            };
            params_vec.push(boxed_param);
        }
    }

    let params_refs: Vec<&dyn rusqlite::types::ToSql> =
        params_vec.iter().map(|p| p.as_ref()).collect();

    let result = match conn.execute(&query, &params_refs[..]) {
        Ok(result) => result,
        Err(e) => {
            let error_msg = format!("Execute error: {}", e);
            eprintln!("{}", error_msg);
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

    println!(
        "Execute successful, {} rows affected, last insert id: {}",
        changes, last_insert_id
    );

    Ok(DatabaseResult {
        success: true,
        data: None,
        error: None,
        last_insert_id: Some(last_insert_id),
        changes: Some(changes),
    })
}

#[cfg(test)]
mod tests {
    use super::initialize_schema;
    use rusqlite::Connection;

    #[test]
    fn initializes_required_tables_and_indexes() {
        let conn = Connection::open_in_memory().expect("open in-memory sqlite database");

        initialize_schema(&conn).expect("initialize schema");

        for table_name in [
            "users",
            "recipes",
            "favorites",
            "search_history",
            "settings",
            "cache",
        ] {
            let count: i64 = conn
                .query_row(
                    "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = ?1",
                    [table_name],
                    |row| row.get(0),
                )
                .expect("query table count");
            assert_eq!(count, 1, "missing table {table_name}");
        }

        for index_name in [
            "idx_recipes_created_at",
            "idx_favorites_session_id",
            "idx_settings_key",
            "idx_cache_key",
        ] {
            let count: i64 = conn
                .query_row(
                    "SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = ?1",
                    [index_name],
                    |row| row.get(0),
                )
                .expect("query index count");
            assert_eq!(count, 1, "missing index {index_name}");
        }
    }

    #[test]
    fn initialized_schema_supports_native_recipe_and_settings_writes() {
        let conn = Connection::open_in_memory().expect("open in-memory sqlite database");

        initialize_schema(&conn).expect("initialize schema");
        conn.execute(
            "INSERT INTO recipes (title, ingredients, instructions, cooking_time, cooking_methods, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            (
                "番茄炒蛋",
                "[\"番茄\",\"鸡蛋\"]",
                "[\"炒蛋\",\"炒番茄\"]",
                15,
                "[\"炒\"]",
                "2026-06-09T00:00:00Z",
                "2026-06-09T00:00:00Z",
            ),
        )
        .expect("insert recipe");
        conn.execute(
            "INSERT INTO settings (key, value, category, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            (
                "ai_openai_config",
                "{\"provider\":\"OpenAI\"}",
                "ai_config",
                "2026-06-09T00:00:00Z",
                "2026-06-09T00:00:00Z",
            ),
        )
        .expect("insert setting");

        let recipe_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM recipes", [], |row| row.get(0))
            .expect("query recipes");
        let setting_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM settings", [], |row| row.get(0))
            .expect("query settings");

        assert_eq!(recipe_count, 1);
        assert_eq!(setting_count, 1);
    }
}

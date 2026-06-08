# Platform Storage

ChefMind is local-first. Release builds choose the strongest local storage backend available on each platform while keeping a shared data access API for the app.

## Release Targets

| Platform | Release asset | Primary storage | Fallback |
| --- | --- | --- | --- |
| Windows | Tauri desktop bundle | Native SQLite via Tauri commands | WebView IndexedDB if Tauri API is unavailable |
| Linux | Tauri desktop bundle | Native SQLite via Tauri commands | WebView IndexedDB if Tauri API is unavailable |
| macOS | Tauri desktop bundle | Native SQLite via Tauri commands | WebView IndexedDB if Tauri API is unavailable |
| Web / PWA | Static Vite build | IndexedDB | In-memory storage |
| Android | Tauri mobile project, not yet released by CI | Native SQLite via Tauri commands when bundled | WebView IndexedDB |

## Native Database Location

Tauri builds store `chefmind.db` under the OS app data directory resolved by Tauri:

- Windows: app data directory for `com.chefmind.tauri`
- Linux: XDG app data directory for `com.chefmind.tauri`
- macOS: application support directory for `com.chefmind.tauri`
- Android: app-private data directory when mobile release is enabled

The database is initialized on startup and uses WAL mode, foreign keys, and a 10 second busy timeout.

## Browser Storage

Web builds use IndexedDB database `ChefMindDB` with object stores for:

- `recipes`
- `favorites`
- `users`
- `search_history`
- `settings`

If IndexedDB is unavailable, the app falls back to in-memory sample data so the UI can still render, but data is not persistent.

## Compatibility Notes

Some UI state is intentionally small and remains in `localStorage`, such as theme preferences, temporary cooking guide handoff data, simple caches, and legacy migration backups. Persistent recipe, favorite, settings, and search tables should go through `dataAccess`.

# BYOK multi-provider and static web design

## Goal

Replace legacy GLM-centred runtime paths with a provider-neutral BYOK design. Ship a GitHub Pages-compatible web experience where API keys are session-only by default, user data can remain local to the browser, and users can export, import, or clear that data. Keep desktop credentials out of WebView storage by using the operating system credential store.

## Architecture

- Define a provider-neutral text-completion operation in the AI provider interface. Recipe generation, nutrition analysis, and legacy recipe helpers use the active provider instead of a GLM-specific service. The migration includes every `callGLM` consumer and removes provider API-key environment fallbacks.
- Retain GLM only as one provider preset/adapter. Rename generic OpenAI-compatible code and user-facing copy so it is not presented as Qwen or GLM.
- Store Web API keys in memory by default. The app may use `sessionStorage` only for an explicitly selected session mode; it must never persist a web API key in `localStorage`, IndexedDB, or compiled Vite environment variables. Startup migrates only non-secret metadata from the legacy storage records and then deletes both legacy key records.
- Keep non-secret user data in IndexedDB. Request `navigator.storage.persist()` on supported browsers and report that the request may be declined. Export/import uses a versioned schema, validates records before writing, excludes all AI settings, and clears all known IndexedDB, localStorage, and sessionStorage application records. Export warns that browser storage is not a backup.
- Store desktop provider keys with native Rust keyring commands. The frontend stores only a provider configuration record and refers to its key by provider ID. Rust resolves the key and makes the HTTPS provider request itself; no command returns a stored key to WebView JavaScript. Existing SQLite key material is migrated out and deleted.
- Provide a separate GitHub Pages workflow. It builds with an explicit project-site base path and publishes static files with least-privilege Pages permissions and deployment concurrency. It never receives or injects a provider API key. Provider support is shown as subject to the provider's browser CORS policy and a live connection test.

## User experience

- Settings explains the difference between desktop secure storage, web memory-only keys (lost on refresh), and optional session keys (lost when the browsing context ends). It never claims that a web key is securely persisted locally. The full-data clear action also deletes the desktop keyring credential after confirmation.
- The web build presents an explicit local-data notice with export and clear actions. It warns that key persistence is session-only and browser data may be removed by the user or browser.
- README identifies the project as `AI Provider | BYOK` and documents the deployment/security boundary.

## Safety constraints

- HTTPS is required for provider endpoints. Known provider presets remain available; custom endpoints reject credentials in the URL and non-HTTPS, local, loopback, or literal-IP hosts. Rust repeats this validation when saving a desktop credential, and its request command accepts only a provider ID and a constrained completion payload: it never accepts an arbitrary URL or caller-supplied headers.
- Credentials are never logged, placed in URLs, or placed in build environment variables.
- GitHub Pages is documented as a direct-to-provider experience: CORS support is required and the selected provider necessarily receives the key during authenticated requests.
- Tauri CSP removes HTTP and WebSocket wildcard connections. Credentials are no longer present in SQLite even though the existing data layer uses frontend database commands.

## Validation

- Unit tests cover storage-policy behaviour, provider-neutral text generation, configuration migration, and endpoint validation.
- Existing type check, unit tests, web build, and Tauri checks remain green.

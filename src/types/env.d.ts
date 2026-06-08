/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GLM_API_KEY: string
  readonly VITE_GLM_API_BASE_URL: string
  readonly VITE_GLM_MODEL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __TAURI__?: {
    invoke?: (command: string, args?: Record<string, unknown>) => Promise<unknown>
    [key: string]: unknown
  }
  $router?: unknown
}

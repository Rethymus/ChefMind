/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_BASE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __CHEFMIND_GITHUB_PAGES__: boolean

interface Window {
  __TAURI__?: {
    invoke?: (command: string, args?: Record<string, unknown>) => Promise<unknown>
    [key: string]: unknown
  }
  $router?: unknown
}

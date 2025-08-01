/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GLM_API_KEY: string
  readonly GLM_API_BASE_URL: string
  readonly GLM_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
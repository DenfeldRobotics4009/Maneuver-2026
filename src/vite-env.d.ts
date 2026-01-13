/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TBA_API_KEY?: string
  readonly VITE_NEXUS_API_KEY?: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

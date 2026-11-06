/// <reference types="vite/client" />

/** Version de l'application, injectée depuis package.json au build (vite.config.ts). */
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

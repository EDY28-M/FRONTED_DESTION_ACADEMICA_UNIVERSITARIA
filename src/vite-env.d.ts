/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string
    readonly VITE_APP_NAME?: string
    readonly VITE_APP_VERSION?: string
    readonly VITE_DEV_MODE?: string
    readonly VITE_ENABLE_DEVTOOLS?: string
    readonly VITE_ENABLE_BROWSER_CONSOLE?: string
    readonly VITE_SENTRY_DSN?: string
    readonly VITE_SENTRY_TUNNEL_ROUTE?: string
    readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string
    readonly VITE_SENTRY_ACTION_SAMPLE_RATE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

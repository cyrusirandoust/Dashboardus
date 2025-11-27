/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AAD_CLIENT_ID: string;
  readonly VITE_AAD_TENANT_ID: string;
  readonly VITE_DEFAULT_REFRESH_INTERVAL?: string;
  readonly VITE_ENABLE_LIVE_MODE?: string;
  readonly VITE_AUTO_LOCK_TIMEOUT?: string;
  readonly VITE_DEFAULT_ANONYMIZE_PII?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Made with Bob

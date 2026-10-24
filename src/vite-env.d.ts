/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  /**
   * The access code for the marketer dashboard. When it is not set the
   * dashboard is open; when it is set every dashboard route asks for it.
   * Set it in Netlify under Site configuration -> Environment variables.
   */
  readonly VITE_DASHBOARD_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

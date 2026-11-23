/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** JSON com os dados do cadastro de demonstração (só em dev; fica no .env.local). */
  readonly VITE_DEMO_DOCTOR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

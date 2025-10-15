// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  // добавляй другие переменные окружения по необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
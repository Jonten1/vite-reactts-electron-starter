/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'path-browserify';
declare module 'stream-browserify';
declare module 'crypto-browserify';
declare module 'buffer';
declare module 'process';

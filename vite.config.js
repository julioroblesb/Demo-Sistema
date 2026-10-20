import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        landing: resolve(import.meta.dirname, 'index.html'),
        crm: resolve(import.meta.dirname, 'SKYROTE13/index.html'),
      },
    },
  },
});

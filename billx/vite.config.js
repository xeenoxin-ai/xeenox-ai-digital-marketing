import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { billxPages } from './pages.mjs';

// Standalone BillX site (for Cloudflare Pages / your own domain):
//   npm run build:billx  ->  dist-billx/  (/, /app/, /portal.html, /admin.html, /legal/*)
export default defineConfig({
  root: __dirname,
  base: '/',
  envDir: resolve(__dirname, '..'),
  build: {
    // Firebase (cloud mode only) is one large lazy-loaded chunk.
    chunkSizeWarningLimit: 800,
    outDir: resolve(__dirname, '../dist-billx'),
    emptyOutDir: true,
    rollupOptions: { input: billxPages(__dirname) },
  },
});

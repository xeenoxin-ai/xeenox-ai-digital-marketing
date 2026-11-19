import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Standalone BookX site (Cloudflare Pages / your own domain):
//   npm run build:bookx  ->  dist-bookx/  (/, /book.html)
export default defineConfig({
  root: __dirname,
  base: './',
  publicDir: resolve(__dirname, '../public/bookx'),
  build: {
    outDir: resolve(__dirname, '../dist-bookx'),
    emptyOutDir: true,
    rollupOptions: { input: { app: resolve(__dirname, 'index.html'), book: resolve(__dirname, 'book.html') } },
  },
});

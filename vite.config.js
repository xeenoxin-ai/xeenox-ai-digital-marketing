import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { billxPages } from './billx/pages.mjs';

// Relative base so the build works on GitHub Pages under /<repo>/ as well as at a domain root.
// Two apps: EasyWay (index.html) and BillX (billx/ + its client portal).
export default defineConfig({
  base: './',
  build: {
    // Firebase (cloud mode only) is one large lazy-loaded chunk.
    chunkSizeWarningLimit: 800,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...Object.fromEntries(Object.entries(billxPages(resolve(__dirname, 'billx'))).map(([k, v]) => [`billx-${k}`, v])),
      },
    },
  },
});

import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Relative base so the build works on GitHub Pages under /<repo>/ as well as at a domain root.
// Two apps: EasyWay (index.html) and BillX (billx/ + its client portal).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        billx: resolve(__dirname, 'billx/index.html'),
        portal: resolve(__dirname, 'billx/portal.html'),
      },
    },
  },
});

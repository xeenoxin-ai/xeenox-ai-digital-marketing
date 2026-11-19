import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { billxPages } from './billx/pages.mjs';
import { billxSeo } from './billx/seo/plugin.mjs';
import { SITE } from './billx/src/site.js';

// Relative base so the build works on GitHub Pages under /<repo>/ as well as at a domain root.
// Three apps: EasyWay (index.html), BillX (billx/ + its client portal) and BookX (bookx/).
export default defineConfig({
  base: './',
  // BillX copy on GitHub Pages links its SEO pages to the main BillX site.
  plugins: [billxSeo({ linkBase: `${SITE.url}/`, emitPages: false })],
  build: {
    // Firebase (cloud mode only) is one large lazy-loaded chunk.
    chunkSizeWarningLimit: 800,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'bookx-app': resolve(__dirname, 'bookx/index.html'),
        'bookx-book': resolve(__dirname, 'bookx/book.html'),
        ...Object.fromEntries(Object.entries(billxPages(resolve(__dirname, 'billx'))).map(([k, v]) => [`billx-${k}`, v])),
      },
    },
  },
});

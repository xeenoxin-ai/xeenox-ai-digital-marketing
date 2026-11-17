// Vite plugin: pre-renders SEO content into the BillX home page and, for the
// standalone site, writes the SEO landing pages, sitemap.xml, robots.txt,
// their stylesheet and the logo.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { firebaseConfig } from '../src/cloud/config.js';
import {
  setCloudMode, homeHead, plansHTML, sectorsHTML, faqHTML, footerHTML, industryStripHTML, seoPages, sitemapXML, robotsTXT,
} from './content.mjs';
import { inlineIcons } from './icons.mjs';

/** Keep <!--CLOUD-->…<!--/CLOUD--> or <!--FREE-->…<!--/FREE--> blocks for the current mode. */
export const applyMode = (html, cloud) => html
  .replace(/<!--CLOUD-->([\s\S]*?)<!--\/CLOUD-->/g, cloud ? '$1' : '')
  .replace(/<!--FREE-->([\s\S]*?)<!--\/FREE-->/g, cloud ? '' : '$1');

const EXTRA_CSS = `
.crumbs { max-width: 1160px; margin: 14px auto 0; padding: 0 16px; font-size: 13px; color: var(--ink-3); }
.seo { display: block; }
.seo-hero { max-width: 1160px; margin: 0 auto; padding: 32px 16px 24px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: center; }
.seo-hero h1, .seo-sec h1 { font-size: clamp(30px, 4.4vw, 46px); line-height: 1.1; letter-spacing: -0.02em; margin: 6px 0 14px; }
.seo-sec { max-width: 1160px; margin: 0 auto; padding: 28px 16px; }
.seo-sec h2 { font-size: 26px; margin-bottom: 12px; }
.seo-inv { margin: 0; text-align: center; }
.seo-inv-zoom { zoom: 0.62; box-shadow: 0 20px 50px -20px rgb(15 23 42 / .35); border-radius: 10px; overflow: hidden; display: inline-block; text-align: left; background: #fff; }
.seo-inv figcaption { color: var(--ink-3); font-size: 13px; margin-top: 8px; }
.seo-links { display: flex; flex-wrap: wrap; gap: 8px; }
.seo-links a, .seo-links span { border: 1px solid var(--line); border-radius: 99px; padding: 6px 14px; background: var(--panel); font-size: 14px; }
.seo-steps li { margin-bottom: 8px; color: var(--ink-2); }
.l-footlinks { display: flex; gap: 40px; flex-wrap: wrap; width: 100%; }
.l-footlinks div { display: flex; flex-direction: column; gap: 4px; }
.l-footlinks b { color: var(--ink-2); }
@media (max-width: 900px) { .seo-hero { grid-template-columns: minmax(0, 1fr); } .seo-inv-zoom { zoom: 0.42; } }
`;

/**
 * linkBase: how the home page links to SEO pages ('' when they are on the same
 * site, the absolute site URL when they are not, e.g. on the GitHub Pages copy).
 * emitPages: write the landing pages, sitemap and robots (standalone site only).
 */
export function billxSeo({ linkBase = '', emitPages = true } = {}) {
  const dir = fileURLToPath(new URL('..', import.meta.url));
  let cloud = true;
  return {
    name: 'billx-seo',
    configResolved(config) {
      cloud = !!((config.env && config.env.VITE_BILLX_FIREBASE) || firebaseConfig);
      setCloudMode(cloud);
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename.replaceAll('\\', '/').endsWith('/billx/index.html')) return html;
        return inlineIcons(applyMode(html, cloud)
          .replace('<!--SEO:HEAD-->', homeHead())
          .replace('<!--SEO:STRIP-->', industryStripHTML(linkBase))
          .replace('<!--SEO:SECTORS-->', sectorsHTML(linkBase))
          .replace('<!--SEO:PLANS-->', plansHTML())
          .replace('<!--SEO:FAQ-->', faqHTML())
          .replace('<!--SEO:FOOTER-->', footerHTML(linkBase)));
      },
    },
    async generateBundle() {
      if (!emitPages) return;
      const pages = seoPages();
      for (const p of pages) this.emitFile({ type: 'asset', fileName: `${p.path}index.html`, source: inlineIcons(p.html) });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXML(pages.map((p) => p.path)) });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTXT() });
      this.emitFile({ type: 'asset', fileName: 'logo.svg', source: readFileSync(resolve(dir, 'logo.svg')) });
      const css = ['src/app.css', 'src/invoice.css', 'src/landing.css'].map((f) => readFileSync(resolve(dir, f), 'utf8')).join('\n') + EXTRA_CSS;
      const { code } = await transform(css, { loader: 'css', minify: true });
      this.emitFile({ type: 'asset', fileName: 'seo.css', source: code });
    },
  };
}

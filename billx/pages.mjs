// The HTML pages that make up BillX, for both builds.
import { resolve } from 'node:path';

export const billxPages = (dir) => ({
  home: resolve(dir, 'index.html'),
  app: resolve(dir, 'app/index.html'),
  portal: resolve(dir, 'portal.html'),
  pay: resolve(dir, 'pay.html'),
  admin: resolve(dir, 'admin.html'),
  terms: resolve(dir, 'legal/terms.html'),
  privacy: resolve(dir, 'legal/privacy.html'),
  refund: resolve(dir, 'legal/refund.html'),
  contact: resolve(dir, 'legal/contact.html'),
});

// QR code as an inline SVG string (synchronous, works offline).
import QRCode from 'qrcode';

export function qrSvg(text, { size = 120, color = '#000' } = {}) {
  if (!text) return '';
  let qr;
  try {
    qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  } catch {
    return '';
  }
  const n = qr.modules.size;
  const data = qr.modules.data;
  const q = 2; // quiet zone
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (data[y * n + x]) d += `M${x + q} ${y + q}h1v1h-1z`;
  }
  const v = n + q * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${v} ${v}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${v}" height="${v}" fill="#fff"/><path d="${d}" fill="${color}"/></svg>`;
}

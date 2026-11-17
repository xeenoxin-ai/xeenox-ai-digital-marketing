// Client portal links without a server: the client's documents are
// compressed into the link's #fragment. The fragment never reaches any
// server; only someone holding the link can open it.

const b64url = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};
const fromB64url = (str) => {
  const s = atob(str.replaceAll('-', '+').replaceAll('_', '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

export async function encodePortal(payload) {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  if (typeof CompressionStream === 'function') {
    return `z${b64url(await pipe(json, new CompressionStream('deflate-raw')))}`;
  }
  return `j${b64url(json)}`;
}

export async function decodePortal(token) {
  const kind = token[0];
  let bytes = fromB64url(token.slice(1));
  if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (kind !== 'j') throw new Error('Unknown link format');
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** The slice of settings and documents a client is allowed to see. */
export function portalPayload(settings, client, docs, { includeLogo = true } = {}) {
  const b = { ...settings.business };
  delete b.signature;
  if (!includeLogo || (b.logo && b.logo.length > 12000)) b.logo = '';
  const design = { ...settings.design, customFields: undefined };
  return {
    v: 1,
    at: new Date().toISOString(),
    s: {
      business: b, currency: settings.currency, taxMode: settings.taxMode, roundOff: settings.roundOff,
      taxInclusive: settings.taxInclusive, industry: settings.industry, clientLabel: settings.clientLabel,
      docTitles: settings.docTitles, footer: settings.footer, design,
    },
    c: { name: client.name, company: client.company },
    d: docs.filter((d) => d.status !== 'draft').map((d) => {
      const { id, createdAt, updatedAt, ...rest } = d;
      return { id, ...rest };
    }),
  };
}

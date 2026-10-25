// Browser-local persistence. Every access is guarded because storage can be
// unavailable (private mode, blocked site data).

const KEY = 'xeenox-route';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable: settings live for this session only */
  }
}

export function load(name, fallback) {
  const v = readAll()[name];
  return v === undefined ? fallback : v;
}

export function save(name, value) {
  const all = readAll();
  all[name] = value;
  writeAll(all);
}

export const DEFAULT_SETTINGS = {
  useOllama: false,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...load('settings', {}) };
}

export function saveSettings(s) {
  save('settings', s);
}

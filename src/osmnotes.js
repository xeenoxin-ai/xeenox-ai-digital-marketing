// "Add a missing place": posts a public OpenStreetMap note at the spot.
// Notes are free and need no account; local mappers turn them into map
// data, and EasyWay then finds the place like any other.

const NOTES_API = 'https://api.openstreetmap.org/api/0.6/notes.json';

export function noteText({ name, category, phone, details }) {
  return [
    `Missing place reported from the EasyWay app: "${name.trim()}"`,
    category && `Type: ${category.trim()}`,
    phone && `Phone: ${phone.trim()}`,
    details && `Details: ${details.trim()}`,
    'The marker shows where it is.',
  ].filter(Boolean).join('\n');
}

// Resolves to the public note URL.
export async function addMissingPlace([lat, lon], info) {
  if (!info.name?.trim()) throw new Error('Name is required');
  const params = new URLSearchParams({ lat: lat.toFixed(6), lon: lon.toFixed(6), text: noteText(info) });
  const res = await fetch(`${NOTES_API}?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Could not send (${res.status})`);
  const note = await res.json();
  return `https://www.openstreetmap.org/note/${note.properties.id}`;
}

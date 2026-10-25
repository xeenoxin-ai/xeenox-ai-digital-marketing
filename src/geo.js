// Small geometry helpers. Points are [lat, lon].

const R = 6371000; // earth radius in metres
const toRad = (d) => (d * Math.PI) / 180;

export function haversine(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Shortest distance in metres from point p to segment a-b, using a local
// equirectangular projection (accurate enough at city scale).
export function pointToSegment(p, a, b) {
  const k = Math.cos(toRad(p[0]));
  const ax = (a[1] - p[1]) * k, ay = a[0] - p[0];
  const bx = (b[1] - p[1]) * k, by = b[0] - p[0];
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? -(ax * dx + ay * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx, y = ay + t * dy;
  return Math.sqrt(x * x + y * y) * (Math.PI / 180) * R;
}

export function distanceToPolyline(p, line) {
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const d = pointToSegment(p, line[i - 1], line[i]);
    if (d < best) best = d;
  }
  return best;
}

// Point offset from the midpoint of a-b, perpendicular to a-b, by `fraction`
// of the a-b distance. Positive goes left of the direction of travel.
export function perpendicularOffset(a, b, fraction) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const k = Math.cos(toRad(mid[0]));
  const dx = (b[1] - a[1]) * k, dy = b[0] - a[0];
  return [mid[0] + dx * fraction, mid[1] + (-dy * fraction) / k];
}

export function bboxOf(points, padDeg = 0) {
  let s = 90, w = 180, n = -90, e = -180;
  for (const [lat, lon] of points) {
    if (lat < s) s = lat;
    if (lat > n) n = lat;
    if (lon < w) w = lon;
    if (lon > e) e = lon;
  }
  return [s - padDeg, w - padDeg, n + padDeg, e + padDeg];
}

export function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}

export function formatDuration(s) {
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

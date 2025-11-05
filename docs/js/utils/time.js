export function nowIso() {
  return new Date().toISOString();
}

export function secondsBetween(startIso, endIso = nowIso()) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.round((end - start) / 1000));
}

export function formatRelativeTime(isoString) {
  const diff = secondsBetween(isoString);
  if (diff < 60) {
    return `${diff}s ago`;
  }
  const minutes = Math.round(diff / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}
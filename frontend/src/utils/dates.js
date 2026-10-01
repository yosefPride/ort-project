// Date formatting. Every function returns "—" for a missing or invalid date.

function toDate(iso) {
  const date = new Date(iso);
  return !iso || Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso) {
  return toDate(iso)?.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) ?? '—';
}

export function formatDateTime(iso) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return toDate(iso)?.toLocaleString(undefined, options) ?? '—';
}

// "2 days ago", "3 hours ago"; anything under a minute is "just now".
export function formatRelativeTime(iso) {
  const date = toDate(iso);
  if (!date) return '—';
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.trunc(seconds / size), unit);
  }
  return 'just now';
}

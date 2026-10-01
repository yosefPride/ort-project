// How roles, priorities and statuses are shown in the UI.

export const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export const roleLabel = (role) => (role === 'admin' ? 'Team Admin' : 'Contributor');

// Which Badge variant (components/ui/Badge.jsx) each issue priority and status uses.
export const PRIORITY_VARIANT = { low: 'neutral', high: 'accent', critical: 'danger' };

export const STATUS_VARIANT = { open: 'accent', closed: 'outline' };

// "Ada Lovelace" -> "AL". Used by Avatar and the account page.
export const initials = (name = '?') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

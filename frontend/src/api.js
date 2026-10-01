const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

// Every request goes through here. It sends the session cookie and turns the
// backend's {"error": "..."} replies into thrown Errors.
export async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(BASE_URL + path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? 'Something went wrong');
  return data;
}

// Cache keys follow the URL: "/teams/1/issues" -> ["teams", "1", "issues"].
// Refreshing "/teams" therefore also refreshes everything nested under it.
export const keyOf = (path) => path.split('/').filter(Boolean);

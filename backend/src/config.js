/**
 * Settings read from environment variables (or a `.env` file) at startup.
 * See `.env.example` for the full list.
 * Stops the server with a clear message if a required setting is missing or invalid.
 */
export function loadConfig() {
  try {
    process.loadEnvFile(); // reads ./.env; variables that are already set win
  } catch {
    // No .env file: the settings come from the real environment.
  }
  const or = (name, fallback) => process.env[name] ?? fallback;

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI must be set');
  const port = Number(or('PORT', '8080'));
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be a number');

  return {
    mongoUri,
    mongoDb: or('MONGO_DB', 'resolve'),
    // Optional: without it the server still runs, but the AI chat is unavailable.
    geminiKey: process.env.GEMINI_API_KEY || null,
    // `false` for local http development; must be `true` in production (https).
    cookieSecure: or('COOKIE_SECURE', 'true') !== 'false',
    // The one site allowed to call the API from a browser (CORS).
    frontendOrigin: or('FRONTEND_ORIGIN', 'http://localhost:5173'),
    port,
  };
}

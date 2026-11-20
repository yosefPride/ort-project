import { createHash, randomBytes } from 'node:crypto';

import { SESSIONS } from '../db/index.js';

export const SESSION_COOKIE = 'session';
const SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a session for the user and puts the cookie that carries its token
 * on the response.
 *
 * A signed-in browser is one `sessions` document. The cookie holds a random
 * token; the database only keeps its SHA-256 hash (as `_id`), so a leaked
 * database can't be used to sign in.
 */
export async function startSession(req, res, userId) {
  const token = randomBytes(32).toString('base64url'); // 43 characters
  const session = {
    _id: hashToken(token),
    user_id: userId,
    expires_at: new Date(Date.now() + SESSION_MS),
  };
  await req.app.locals.db.collection(SESSIONS).insertOne(session);
  setSessionCookie(req, res, token, SESSION_MS);
}

/**
 * httpOnly: page JavaScript can't read the token. In production the frontend
 * is on another site, which browsers only allow with SameSite=None + Secure.
 */
export function setSessionCookie(req, res, value, maxAgeMs) {
  const { cookieSecure } = req.app.locals;
  res.cookie(SESSION_COOKIE, value, {
    path: '/',
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSecure ? 'none' : 'lax',
    maxAge: maxAgeMs,
  });
}

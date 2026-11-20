import { SESSIONS, USERS } from '../db/index.js';
import { unauthorized } from '../error.js';
import { SESSION_COOKIE, hashToken } from './session.js';

/** The signed-in user who sent this request, or `null`. */
export async function currentUser(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string') return null;
  const { db } = req.app.locals;
  const filter = { _id: hashToken(token), expires_at: { $gt: new Date() } };
  const session = await db.collection(SESSIONS).findOne(filter);
  if (!session) return null;
  return db.collection(USERS).findOne({ _id: session.user_id });
}

/** Like `currentUser`, but being signed out is a 401. */
export async function requireUser(req) {
  const user = await currentUser(req);
  if (!user) throw unauthorized();
  return user;
}

/**
 * Put `authUser` before a handler and it only runs for signed-in users (as
 * `req.user`); everyone else gets a 401.
 */
export async function authUser(req, res, next) {
  req.user = await requireUser(req);
  next();
}

import { SESSIONS, USERS, newId, now } from '../db/index.js';
import { badRequest } from '../error.js';
import { publicUser } from '../user/model.js';
import { check, checkEmail, requireString } from '../validation.js';
import { currentUser } from './middleware.js';
import { hashPassword, passwordMatches } from './password.js';
import { SESSION_COOKIE, hashToken, setSessionCookie, startSession } from './session.js';

export async function register(req, res) {
  const input = req.body ?? {};
  const user = {
    _id: newId(),
    name: check('Name', input.name, 80),
    email: checkEmail(input.email),
    password_hash: await hashPassword(input.password),
    is_admin: false,
    created_at: now(),
  };
  await req.app.locals.db.collection(USERS).insertOne(user);
  await signedIn(req, res, user);
}

export async function login(req, res) {
  const input = req.body ?? {};
  // Same message for an unknown email and a wrong password, so the form
  // can't be used to find out who has an account.
  const wrong = () => badRequest('Wrong email or password');
  const email = checkEmail(input.email);
  const password = requireString('Password', input.password);
  const user = await req.app.locals.db.collection(USERS).findOne({ email });
  if (!user) throw wrong();
  if (!(await passwordMatches(password, user))) throw wrong();
  await signedIn(req, res, user);
}

async function signedIn(req, res, user) {
  await startSession(req, res, user._id);
  res.json(publicUser(user));
}

export async function logout(req, res) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === 'string') {
    await req.app.locals.db.collection(SESSIONS).deleteOne({ _id: hashToken(token) });
  }
  setSessionCookie(req, res, '', 0); // expires the cookie
  res.status(204).end();
}

/**
 * The signed-in user, or `null` when signed out (so the frontend can tell
 * "signed out" apart from a real error).
 */
export async function me(req, res) {
  const user = await currentUser(req);
  res.json(user ? publicUser(user) : null);
}

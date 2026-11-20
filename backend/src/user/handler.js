import { hashPassword, passwordMatches } from '../auth/password.js';
import { startSession } from '../auth/session.js';
import { SESSIONS, USERS } from '../db/index.js';
import { badRequest } from '../error.js';
import { check, checkEmail, requireString } from '../validation.js';
import { publicUser } from './model.js';

async function requirePassword(password, user) {
  if (!(await passwordMatches(password, user))) {
    throw badRequest('Current password is incorrect');
  }
}

export async function updateProfile(req, res) {
  const { user } = req;
  const input = req.body ?? {};
  const email = checkEmail(input.email);
  // Changing the sign-in email needs the password, so someone who only
  // grabbed an open session can't take over the account.
  if (email !== user.email) {
    await requirePassword(requireString('Current password', input.current_password ?? ''), user);
  }
  user.name = check('Name', input.name, 80);
  user.email = email;
  await req.app.locals.db.collection(USERS).replaceOne({ _id: user._id }, user);
  res.json(publicUser(user));
}

export async function changePassword(req, res) {
  const { user } = req;
  const { db } = req.app.locals;
  const input = req.body ?? {};
  await requirePassword(requireString('Current password', input.current_password), user);
  user.password_hash = await hashPassword(input.new_password);
  await db.collection(USERS).replaceOne({ _id: user._id }, user);
  // Sign out every device, then sign this one back in with a fresh session.
  await db.collection(SESSIONS).deleteMany({ user_id: user._id });
  await startSession(req, res, user._id);
  res.status(204).end();
}

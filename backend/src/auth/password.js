import bcrypt from 'bcrypt';

import { badRequest } from '../error.js';

const COST = 12;

// bcrypt is slow on purpose (to resist guessing). The `bcrypt` package runs it
// on a background thread, so it doesn't block the server while it works.
export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw badRequest('Password must be at least 8 characters');
  }
  return bcrypt.hash(password, COST);
}

export function passwordMatches(password, user) {
  return bcrypt.compare(password, user.password_hash);
}

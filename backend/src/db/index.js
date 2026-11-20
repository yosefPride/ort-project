import { ObjectId } from 'mongodb';

export { createIndexes } from './indexes.js';
export { Scoped } from './scoped.js';

// Collection names, so code writes `db.collection(USERS)` instead of
// repeating the string "users".
export const USERS = 'users';
export const SESSIONS = 'sessions';
export const TEAMS = 'teams';
export const ISSUES = 'issues';
export const COMMENTS = 'comments';
export const CHAT_MESSAGES = 'chat_messages';
export const AUDIT_LOGS = 'audit_logs';

/**
 * IDs are plain strings (ObjectId hex), so the same object can be stored in
 * MongoDB and sent as JSON without any conversion.
 */
export function newId() {
  return new ObjectId().toHexString();
}

let lastTime = 0;

/**
 * The current time as an ISO string ("2026-01-31T12:00:00.000Z"), which is how
 * `created_at` and `updated_at` are stored and sent. Two calls never return
 * the same value, so sorting by `created_at` always gives the order things
 * were created in.
 */
export function now() {
  lastTime = Math.max(Date.now(), lastTime + 1);
  return new Date(lastTime).toISOString();
}

export function findAll(collection, filter, sort) {
  return collection.find(filter).sort(sort).toArray();
}

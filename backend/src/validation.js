import { badRequest } from './error.js';

// Request bodies are untrusted JSON, so every field is checked for its type
// before it is used (a number or an object where text is expected is a 400).

/** Trims a text input and checks it's between 1 and `max` characters. */
export function check(field, value, max) {
  const text = typeof value === 'string' ? value.trim() : '';
  // The spread counts whole characters, so one emoji is 1 and not 2.
  if (text === '' || [...text].length > max) {
    throw badRequest(`${field} must be 1 to ${max} characters`);
  }
  return text;
}

/** Emails are stored lowercase so "Bob@x.com" and "bob@x.com" are the same account. */
export function checkEmail(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!email.includes('@') || email.length > 254) {
    throw badRequest('Enter a valid email');
  }
  return email;
}

/** A required text field that is used as it is (passwords are never trimmed). */
export function requireString(field, value) {
  if (typeof value !== 'string') throw badRequest(`${field} is required`);
  return value;
}

/** A field that must be one of a fixed list of words, like a role or a priority. */
export function oneOf(field, value, allowed) {
  if (!allowed.includes(value)) throw badRequest(`${field} must be one of: ${allowed.join(', ')}`);
  return value;
}

import { log } from './logging.js';

/**
 * Handlers throw an AppError and `errorHandler` (below) turns it into a JSON
 * response: {"error": "..."}. Anything else that is thrown becomes a plain 500.
 */
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message) => new AppError(400, message);
export const unauthorized = () => new AppError(401, 'Please sign in');
export const forbidden = () => new AppError(403, 'You are not allowed to do that');
export const notFound = () => new AppError(404, 'Not found');
export const conflict = (message) => new AppError(409, message);
export const aiUnavailable = () => new AppError(503, 'The AI assistant is unavailable right now, try again soon');

/** Unknown URLs get the same {"error": "..."} shape as every other error. */
export function notFoundHandler(req, res, next) {
  next(notFound());
}

// Express recognises an error handler by its four arguments.
export function errorHandler(error, req, res, next) {
  const { status, message } = toAppError(error);
  res.status(status).json({ error: message });
}

function toAppError(error) {
  if (error instanceof AppError) return error;
  // Code 11000 means a unique index rejected the write. The only unique
  // field a user can type is their email, so that's what we report.
  if (error?.code === 11000) return conflict('That email is already in use');
  // A request body that isn't valid JSON (or is too large) is the client's mistake.
  if (typeof error?.type === 'string' && error.type.startsWith('entity.')) return badRequest(error.message);
  // Everything else is never the user's fault: log the details, answer with a plain 500.
  log.error(error?.stack ?? String(error));
  return new AppError(500, 'Something went wrong');
}

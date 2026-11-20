import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import adminRoutes from './admin/routes.js';
import authRoutes from './auth/routes.js';
import chatRoutes from './chat/routes.js';
import commentRoutes from './comment/routes.js';
import { errorHandler, notFoundHandler } from './error.js';
import issueRoutes from './issue/routes.js';
import { logRequests } from './logging.js';
import teamRoutes from './team/routes.js';
import userRoutes from './user/routes.js';

/** Builds the Express app: CORS, routes, shared state. `main.js` starts it. */
export function createApp({ db, geminiKey, cookieSecure, frontendOrigin }) {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');

  // Shared by every request (handlers read it as `req.app.locals`).
  app.locals.db = db;
  app.locals.geminiKey = geminiKey;
  app.locals.cookieSecure = cookieSecure;

  app.use(logRequests);
  // The frontend runs on another origin and must send the session cookie.
  app.use(cors({ origin: frontendOrigin, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  app.use('/api', authRoutes, userRoutes, teamRoutes, issueRoutes, commentRoutes, chatRoutes, adminRoutes);

  // Unknown URLs and every error get the same {"error": "..."} shape.
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

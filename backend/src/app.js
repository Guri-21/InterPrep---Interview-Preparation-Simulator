import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { env, getAllowedOrigins } from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Build a fully-configured Express app instance.
 * Exported as a factory so tests can spin up an in-process server too.
 */
export function buildApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false, // SPA is served separately
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  const allowed = getAllowedOrigins();
  app.use(cors({
    origin(origin, cb) {
      // Allow same-origin / curl (no Origin header) and any allow-listed origin.
      if (!origin || allowed.includes(origin) || allowed.includes('*')) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }));

  app.use(compression());
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: true, limit: '256kb' }));

  if (!env.isProd) app.use(morgan('dev'));
  else app.use(morgan('combined'));

  // Mount all REST routes under /api.
  app.use('/api', apiLimiter, routes);

  // Helpful root route — gives engineers / faculty a quick visual confirmation.
  app.get('/', (_req, res) => {
    res.json({
      name: 'InterPrep API',
      docs: '/api/health',
      mountedRoutes: [
        'POST   /api/auth/signup',
        'POST   /api/auth/login',
        'GET    /api/auth/me',
        'POST   /api/auth/logout',
        'PATCH  /api/users/me',
        'POST   /api/users/me/password',
        'DELETE /api/users/me',
        'GET    /api/domains',
        'GET    /api/domains/:slug',
        'POST   /api/domains            (admin)',
        'GET    /api/questions',
        'POST   /api/questions',
        'PATCH  /api/questions/:id',
        'DELETE /api/questions/:id',
        'POST   /api/interviews/analyze',
        'GET    /api/interviews',
        'GET    /api/interviews/stats',
        'GET    /api/interviews/:id',
        'DELETE /api/interviews/:id',
        'GET    /api/admin/stats        (admin)',
        'GET    /api/admin/users        (admin)',
        'PATCH  /api/admin/users/:id/role (admin)',
        'GET    /api/admin/interviews   (admin)',
      ],
    });
  });

  // 404 + error tail.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

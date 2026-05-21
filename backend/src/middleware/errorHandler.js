import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/* eslint-disable no-unused-vars */
/** Express error handler (4-arg signature). Maps known error types to clean JSON. */
export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let code = err.code || 'INTERNAL';
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Mongoose validation errors → 400
  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  }

  // Mongoose cast error (bad ObjectId) → 400
  if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = 'INVALID_ID';
    message = 'Invalid identifier in URL';
  }

  // Duplicate key (E11000) → 409
  if (err?.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  // JWT errors → 401
  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  const body = { error: { code, message } };
  if (details) body.error.details = details;
  if (!env.isProd && status >= 500) body.error.stack = err.stack;

  res.status(status).json(body);
}

/** Express 404 catch-all (mount after all routes). */
export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

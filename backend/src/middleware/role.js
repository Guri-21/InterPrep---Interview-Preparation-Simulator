import { ApiError } from '../utils/ApiError.js';

/**
 * Gate route(s) behind one or more roles. Use after `requireAuth`.
 *
 *   router.get('/admin/users', requireAuth, requireRole('admin'), listUsers);
 */
export function requireRole(...allowed) {
  return function gateRole(req, _res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowed.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: ${allowed.join(' | ')}`));
    }
    next();
  };
}

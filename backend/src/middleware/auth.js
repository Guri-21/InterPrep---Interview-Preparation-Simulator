import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/tokenService.js';

/**
 * Hard auth — requires a valid Bearer token and loads the user onto req.user.
 * Throws 401 if missing/invalid.
 */
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing bearer token');
    }
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('User no longer exists');
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Soft auth — populates req.user when a valid token is present, but doesn't
 * fail if not. Used by endpoints that have a "guest" code path.
 */
export async function attachUserIfPresent(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return next();
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (user) {
        req.user = user;
        req.token = token;
      }
    } catch { /* swallow — invalid token = guest */ }
    next();
  } catch (err) {
    next(err);
  }
}

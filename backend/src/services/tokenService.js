import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign a JWT for a user. Keep the claim shape stable — frontend reads `sub`
 * and `role`. `exp` is enforced by jsonwebtoken via `expiresIn`.
 */
export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id || user._id?.toString(),
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE, issuer: 'interprep' },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { issuer: 'interprep' });
}

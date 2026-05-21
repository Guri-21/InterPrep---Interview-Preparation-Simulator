import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken } from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/auth/signup — create a new user account.
 * Anyone can sign up; role is always 'user'. Admin promotion goes through
 * `npm run seed:admin` or PATCH /api/admin/users/:id/role.
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with that email already exists');
  }

  const user = new User({ name, email, role: 'user' });
  user.password = password; // virtual setter triggers bcrypt hash in pre-save
  await user.save();

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user);
  return res.status(201).json({ user, token });
});

/** POST /api/auth/login — issue a JWT for valid credentials. */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user);
  return res.json({ user, token });
});

/** GET /api/auth/me — return the authenticated user. */
export const me = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});

/**
 * POST /api/auth/logout — stateless server (JWT). Client is expected to drop
 * its token. We return 204 so the frontend can treat it uniformly.
 */
export const logout = asyncHandler(async (_req, res) => {
  return res.status(204).end();
});

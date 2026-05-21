import User from '../models/User.js';
import Domain from '../models/Domain.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** PATCH /api/users/me — update display name, preferred domain, avatar. */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferredDomain, avatarUrl } = req.body;

  if (typeof name === 'string') req.user.name = name;
  if (typeof avatarUrl === 'string') req.user.avatarUrl = avatarUrl;

  if (preferredDomain === null) {
    req.user.preferredDomain = null;
  } else if (typeof preferredDomain === 'string') {
    // Accept either a Mongo ObjectId or a domain slug.
    const isObjectId = /^[a-f0-9]{24}$/i.test(preferredDomain);
    const dom = isObjectId
      ? await Domain.findById(preferredDomain)
      : await Domain.findOne({ slug: preferredDomain.toLowerCase() });
    if (!dom) throw ApiError.badRequest('Unknown preferredDomain');
    req.user.preferredDomain = dom._id;
  }

  await req.user.save();
  const fresh = await User.findById(req.user._id);
  return res.json({ user: fresh });
});

/** POST /api/users/me/password — change password (requires current password). */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.unauthorized('Current password is incorrect');

  user.password = newPassword;
  await user.save();
  return res.status(204).end();
});

/** DELETE /api/users/me — delete the authenticated user's account. */
export const deleteAccount = asyncHandler(async (req, res) => {
  await User.deleteOne({ _id: req.user._id });
  // Note: associated interviews remain (the user reference becomes dangling but
  // the data itself is preserved for platform-level analytics). Production
  // systems would either cascade or anonymize here — that's a policy choice.
  return res.status(204).end();
});

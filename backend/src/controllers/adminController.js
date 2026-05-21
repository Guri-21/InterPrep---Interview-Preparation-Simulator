import User from '../models/User.js';
import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import Domain from '../models/Domain.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/* ─── Platform statistics ───────────────────────────────────────── */

export const platformStats = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 7 * 86_400_000);

  const [userCount, adminCount, interviewCount, questionCount, domainCount, last7, byDomain, recent] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Interview.countDocuments(),
    Question.countDocuments({ active: true }),
    Domain.countDocuments({ active: true }),
    Interview.countDocuments({ createdAt: { $gte: since } }),
    Interview.aggregate([
      {
        $group: {
          _id: '$domainSlug',
          count: { $sum: 1 },
          avgOverall: { $avg: '$feedback.overall' },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Interview.find()
      .populate('user', 'name email')
      .populate('domain', 'slug label')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return res.json({
    counts: { userCount, adminCount, interviewCount, questionCount, domainCount, last7Interviews: last7 },
    byDomain: byDomain.map((row) => ({
      domainSlug: row._id,
      count: row.count,
      avgOverall: Math.round(row.avgOverall || 0),
    })),
    recentInterviews: recent,
  });
});

/* ─── Users management ──────────────────────────────────────────── */

export const listUsers = asyncHandler(async (req, res) => {
  const { q, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [
    { name:  { $regex: q, $options: 'i' } },
    { email: { $regex: q, $options: 'i' } },
  ];

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);

  const [total, items] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return res.json({ items, page, limit, total });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) throw ApiError.badRequest('Role must be "user" or "admin"');

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  // Prevent the last admin from demoting themselves.
  if (user.role === 'admin' && role === 'user') {
    const others = await User.countDocuments({ role: 'admin', _id: { $ne: user._id } });
    if (others === 0) throw ApiError.badRequest('Cannot demote the last admin');
  }

  user.role = role;
  await user.save();
  return res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') {
    const others = await User.countDocuments({ role: 'admin', _id: { $ne: user._id } });
    if (others === 0) throw ApiError.badRequest('Cannot delete the last admin');
  }
  await user.deleteOne();
  return res.status(204).end();
});

/* ─── Interviews management ─────────────────────────────────────── */

export const listAllInterviews = asyncHandler(async (req, res) => {
  const { domainSlug, difficulty, userId } = req.query;
  const filter = {};
  if (domainSlug) filter.domainSlug = String(domainSlug).toLowerCase();
  if (difficulty) filter.difficulty = difficulty;
  if (userId) filter.user = userId;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 200);

  const [total, items] = await Promise.all([
    Interview.countDocuments(filter),
    Interview.find(filter)
      .populate('user', 'name email role')
      .populate('domain', 'slug label shortLabel')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return res.json({ items, page, limit, total });
});

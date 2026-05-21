import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Domain from '../models/Domain.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function resolveDomain(domainInput) {
  if (!domainInput) return null;
  if (mongoose.isValidObjectId(domainInput)) {
    return Domain.findById(domainInput);
  }
  return Domain.findOne({ slug: String(domainInput).toLowerCase() });
}

/**
 * GET /api/questions
 *
 * Public + authenticated. Query params:
 *   domain     — slug or id (optional)
 *   difficulty — Easy|Medium|Hard (optional)
 *   q          — full-text contains (optional)
 *   mine       — '1' to limit to user's custom (auth required)
 *   includeInactive — '1' (admin only)
 *   page, limit — pagination
 */
export const listQuestions = asyncHandler(async (req, res) => {
  const { domain, difficulty, q, mine, includeInactive } = req.query;
  const filter = {};

  if (domain) {
    const dom = await resolveDomain(domain);
    if (!dom) throw ApiError.badRequest('Unknown domain');
    filter.domain = dom._id;
  }
  if (difficulty) filter.difficulty = difficulty;
  if (q) filter.$or = [
    { question: { $regex: q, $options: 'i' } },
    { topic:    { $regex: q, $options: 'i' } },
  ];
  if (mine === '1') {
    if (!req.user) throw ApiError.unauthorized();
    filter.createdBy = req.user._id;
  }
  if (!(req.user?.role === 'admin' && includeInactive === '1')) {
    filter.active = true;
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

  const [total, items] = await Promise.all([
    Question.countDocuments(filter),
    Question.find(filter)
      .populate('domain', 'slug label shortLabel accent')
      .sort({ isBuiltIn: -1, difficulty: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return res.json({ items, page, limit, total });
});

/** GET /api/questions/:id — single question fetch. */
export const getQuestion = asyncHandler(async (req, res) => {
  const item = await Question.findById(req.params.id).populate('domain', 'slug label shortLabel accent');
  if (!item) throw ApiError.notFound('Question not found');
  return res.json({ question: item });
});

/**
 * POST /api/questions — create a custom question.
 * Users own their questions; admins create built-ins if `isBuiltIn=true`.
 */
export const createQuestion = asyncHandler(async (req, res) => {
  const dom = await resolveDomain(req.body.domain);
  if (!dom) throw ApiError.badRequest('Unknown domain');

  const isAdminBuiltIn = req.user.role === 'admin' && req.body.isBuiltIn === true;

  const item = await Question.create({
    domain:     dom._id,
    topic:      req.body.topic,
    difficulty: req.body.difficulty,
    question:   req.body.question,
    timeLimit:  req.body.timeLimit,
    isBuiltIn:  isAdminBuiltIn,
    createdBy:  isAdminBuiltIn ? null : req.user._id,
  });
  const populated = await item.populate('domain', 'slug label shortLabel accent');
  return res.status(201).json({ question: populated });
});

/**
 * PATCH /api/questions/:id — update a question.
 * Permissions:
 *   - admin can edit anything.
 *   - non-admin can edit only their own custom questions.
 */
export const updateQuestion = asyncHandler(async (req, res) => {
  const item = await Question.findById(req.params.id);
  if (!item) throw ApiError.notFound('Question not found');

  if (req.user.role !== 'admin') {
    if (item.isBuiltIn || !item.createdBy?.equals(req.user._id)) {
      throw ApiError.forbidden('You can only edit your own custom questions');
    }
  }

  if (req.body.domain) {
    const dom = await resolveDomain(req.body.domain);
    if (!dom) throw ApiError.badRequest('Unknown domain');
    item.domain = dom._id;
  }
  ['topic', 'difficulty', 'question', 'timeLimit'].forEach((k) => {
    if (req.body[k] !== undefined) item[k] = req.body[k];
  });

  await item.save();
  const populated = await item.populate('domain', 'slug label shortLabel accent');
  return res.json({ question: populated });
});

/** DELETE /api/questions/:id — soft delete (set active=false). */
export const deleteQuestion = asyncHandler(async (req, res) => {
  const item = await Question.findById(req.params.id);
  if (!item) throw ApiError.notFound('Question not found');
  if (req.user.role !== 'admin') {
    if (item.isBuiltIn || !item.createdBy?.equals(req.user._id)) {
      throw ApiError.forbidden('You can only delete your own custom questions');
    }
  }
  item.active = false;
  await item.save();
  return res.status(204).end();
});

/** POST /api/questions/:id/restore — admin-only un-delete. */
export const restoreQuestion = asyncHandler(async (req, res) => {
  const item = await Question.findById(req.params.id);
  if (!item) throw ApiError.notFound('Question not found');
  item.active = true;
  await item.save();
  return res.json({ question: item });
});

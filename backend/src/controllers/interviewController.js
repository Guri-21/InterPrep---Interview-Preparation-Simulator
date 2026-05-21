import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import Domain from '../models/Domain.js';
import Question from '../models/Question.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { evaluateAnswer } from '../services/aiService.js';

/**
 * POST /api/interviews/analyze
 *
 * Run the AI evaluator on the candidate's answer AND persist the result as
 * an Interview record owned by the current user. This is the single seam
 * between the speech-recorder UI and the database.
 */
export const analyzeAndPersist = asyncHandler(async (req, res) => {
  const {
    transcript, question, questionId, domain: domainInput, topic, difficulty,
    durationSec = 0, wpm = 0, fillerCount = 0,
  } = req.body;

  // Resolve domain by slug or id.
  const dom = mongoose.isValidObjectId(domainInput)
    ? await Domain.findById(domainInput)
    : await Domain.findOne({ slug: String(domainInput).toLowerCase() });
  if (!dom) throw ApiError.badRequest('Unknown domain');

  // Optional: resolve to a Question record if `questionId` was supplied.
  let questionRef = null;
  if (questionId && mongoose.isValidObjectId(questionId)) {
    questionRef = await Question.findById(questionId);
  }

  const { feedback, providerModel } = await evaluateAnswer({
    transcript, question, domain: dom.label, topic, difficulty, durationSec,
  });

  const interview = await Interview.create({
    user: req.user._id,
    domain: dom._id,
    domainSlug: dom.slug,
    question,
    questionRef: questionRef?._id || null,
    topic: topic || questionRef?.topic || 'General',
    difficulty: difficulty || questionRef?.difficulty || 'Medium',
    transcript,
    durationSec,
    wpm,
    fillerCount,
    feedback,
    providerModel,
  });

  return res.status(201).json({ interview });
});

/**
 * GET /api/interviews
 *
 * Authenticated user's own history. Query params:
 *   domain (slug or id), difficulty, since (ISO date), page, limit
 *   Sorted by createdAt desc.
 */
export const listMyInterviews = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.domain) {
    const dom = mongoose.isValidObjectId(req.query.domain)
      ? await Domain.findById(req.query.domain)
      : await Domain.findOne({ slug: String(req.query.domain).toLowerCase() });
    if (dom) filter.domain = dom._id;
  }
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.since) filter.createdAt = { $gte: new Date(req.query.since) };

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

  const [total, items] = await Promise.all([
    Interview.countDocuments(filter),
    Interview.find(filter)
      .populate('domain', 'slug label shortLabel accent')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  return res.json({ items, page, limit, total });
});

/** GET /api/interviews/:id — single fetch (owner or admin). */
export const getInterview = asyncHandler(async (req, res) => {
  const item = await Interview.findById(req.params.id).populate('domain', 'slug label shortLabel accent');
  if (!item) throw ApiError.notFound('Interview not found');
  if (req.user.role !== 'admin' && !item.user.equals(req.user._id)) {
    throw ApiError.forbidden('You do not own this interview');
  }
  return res.json({ interview: item });
});

/** DELETE /api/interviews/:id — owner or admin. */
export const deleteInterview = asyncHandler(async (req, res) => {
  const item = await Interview.findById(req.params.id);
  if (!item) throw ApiError.notFound('Interview not found');
  if (req.user.role !== 'admin' && !item.user.equals(req.user._id)) {
    throw ApiError.forbidden('You do not own this interview');
  }
  await item.deleteOne();
  return res.status(204).end();
});

/* ─── Analytics aggregates (per user) ──────────────────────────── */

/** GET /api/interviews/stats — aggregate the user's KPIs server-side. */
export const myStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totals, byDomain, recentSeries] = await Promise.all([
    Interview.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgOverall: { $avg: '$feedback.overall' },
          minutes: { $sum: { $divide: ['$durationSec', 60] } },
        },
      },
    ]),

    Interview.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$domainSlug',
          count: { $sum: 1 },
          avgOverall: { $avg: '$feedback.overall' },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Interview.aggregate([
      { $match: { user: userId } },
      { $sort: { createdAt: -1 } },
      { $limit: 30 },
      {
        $project: {
          _id: 0,
          date: '$createdAt',
          overall: '$feedback.overall',
          domainSlug: 1,
        },
      },
      { $sort: { date: 1 } },
    ]),
  ]);

  return res.json({
    totals: {
      total: totals[0]?.total || 0,
      avgOverall: Math.round(totals[0]?.avgOverall || 0),
      minutesPracticed: Math.round(totals[0]?.minutes || 0),
    },
    byDomain: byDomain.map((row) => ({
      domainSlug: row._id,
      count: row.count,
      avgOverall: Math.round(row.avgOverall || 0),
    })),
    trend: recentSeries.map((row) => ({
      date: row.date,
      overall: Math.round(row.overall || 0),
      domainSlug: row.domainSlug,
    })),
  });
});

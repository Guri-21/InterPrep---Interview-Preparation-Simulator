import Domain from '../models/Domain.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/domains — public list of active domains, ordered. */
export const listDomains = asyncHandler(async (_req, res) => {
  const domains = await Domain.find({ active: true }).sort({ order: 1, label: 1 });
  return res.json({ domains });
});

/** GET /api/domains/:slug — public single fetch. */
export const getDomain = asyncHandler(async (req, res) => {
  const dom = await Domain.findOne({ slug: req.params.slug.toLowerCase() });
  if (!dom) throw ApiError.notFound('Domain not found');
  return res.json({ domain: dom });
});

/* ─── Admin ─────────────────────────────────────────────────────── */

export const createDomain = asyncHandler(async (req, res) => {
  const dom = await Domain.create(req.body);
  return res.status(201).json({ domain: dom });
});

export const updateDomain = asyncHandler(async (req, res) => {
  const dom = await Domain.findOneAndUpdate(
    { slug: req.params.slug.toLowerCase() },
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!dom) throw ApiError.notFound('Domain not found');
  return res.json({ domain: dom });
});

export const deleteDomain = asyncHandler(async (req, res) => {
  const dom = await Domain.findOneAndUpdate(
    { slug: req.params.slug.toLowerCase() },
    { $set: { active: false } },
    { new: true },
  );
  if (!dom) throw ApiError.notFound('Domain not found');
  return res.status(204).end();
});

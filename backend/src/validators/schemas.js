import { z } from 'zod';

/* ─── Auth ──────────────────────────────────────────────────────── */

export const signupSchema = z.object({
  name:     z.string().trim().min(2).max(80),
  email:    z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(120),
});

export const loginSchema = z.object({
  email:    z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(120),
});

/* ─── User profile ─────────────────────────────────────────────── */

export const updateProfileSchema = z.object({
  name:            z.string().trim().min(2).max(80).optional(),
  preferredDomain: z.string().trim().nullable().optional(),
  avatarUrl:       z.string().url().or(z.literal('')).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(120),
});

/* ─── Questions ─────────────────────────────────────────────────── */

export const questionCreateSchema = z.object({
  domain:     z.string().min(1, 'Domain is required'), // accepts slug or ObjectId
  topic:      z.string().trim().min(1).max(80).default('General'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  question:   z.string().trim().min(10).max(2000),
  timeLimit:  z.number().int().min(15).max(600).default(120),
});

export const questionUpdateSchema = questionCreateSchema.partial();

/* ─── Domain (admin) ────────────────────────────────────────────── */

export const domainCreateSchema = z.object({
  slug:       z.string().trim().toLowerCase().min(2).max(40).regex(/^[a-z0-9-]+$/),
  label:      z.string().trim().min(2).max(80),
  shortLabel: z.string().trim().min(2).max(40),
  blurb:      z.string().trim().max(500).default(''),
  tagline:    z.string().trim().max(140).default(''),
  iconKey:    z.string().trim().max(40).default('Binary'),
  accent:     z.string().trim().max(80).default('from-brand-400 to-cyan-400'),
  skills:     z.array(z.string().trim().max(40)).max(12).default([]),
  order:      z.number().int().min(0).default(0),
});

export const domainUpdateSchema = domainCreateSchema.partial();

/* ─── Analyze ───────────────────────────────────────────────────── */

export const analyzeSchema = z.object({
  transcript:  z.string().trim().min(20).max(20_000),
  question:    z.string().trim().min(5).max(2000),
  questionId:  z.string().optional(),
  domain:      z.string().min(1), // slug or label
  topic:       z.string().trim().max(80).optional(),
  difficulty:  z.enum(['Easy', 'Medium', 'Hard']).optional(),
  durationSec: z.number().int().min(0).max(7200).optional(),
  wpm:         z.number().int().min(0).max(400).optional(),
  fillerCount: z.number().int().min(0).max(1000).optional(),
});

/* ─── Common ────────────────────────────────────────────────────── */

export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

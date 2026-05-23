/**
 * Shared test setup for InterPrep backend tests.
 *
 * Starts a MongoMemoryServer, wires env vars, and exports helpers for
 * creating test users, tokens, domains, and questions.
 *
 * IMPORTANT: env vars must be set BEFORE any app code is imported because
 * `src/config/env.js` validates at module load time.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongod;
let mongoose;
let buildApp;
let signAccessToken;
let setEvaluatorOverride;

// Models (dynamically imported after env is set).
let User, Domain, Question, Interview;

/* ─── Lifecycle ──────────────────────────────────────────────────── */

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Set env vars BEFORE importing app code.
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';
  process.env.JWT_EXPIRE = '1h';
  process.env.NODE_ENV = 'test';
  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_API_KEY = 'fake-test-key';

  // Dynamic imports — must happen after env vars are set.
  const mongooseMod = await import('mongoose');
  mongoose = mongooseMod.default;

  await mongoose.connect(uri);

  const appMod = await import('../app.js');
  buildApp = appMod.buildApp;

  const tokenMod = await import('../services/tokenService.js');
  signAccessToken = tokenMod.signAccessToken;

  const aiMod = await import('../services/aiService.js');
  setEvaluatorOverride = aiMod.setEvaluatorOverride;

  const userMod = await import('../models/User.js');
  User = userMod.default;

  const domainMod = await import('../models/Domain.js');
  Domain = domainMod.default;

  const questionMod = await import('../models/Question.js');
  Question = questionMod.default;

  const interviewMod = await import('../models/Interview.js');
  Interview = interviewMod.default;
});

afterEach(async () => {
  // Clear all collections between tests.
  if (mongoose?.connection?.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose) await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

/* ─── Helpers ────────────────────────────────────────────────────── */

/**
 * Build a fresh Express app instance for testing.
 */
export function getApp() {
  return buildApp();
}

/**
 * Create a user directly in the DB (bypasses the API).
 */
export async function createTestUser(overrides = {}) {
  const base = {
    name: 'Test User',
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    role: 'user',
    ...overrides,
  };
  const user = new User(base);
  user.password = overrides.password || 'TestPassword123!';
  await user.save();
  return user;
}

/**
 * Create an admin user.
 */
export async function createTestAdmin(overrides = {}) {
  return createTestUser({ role: 'admin', name: 'Admin User', ...overrides });
}

/**
 * Sign a JWT for a test user.
 */
export function getAuthToken(user) {
  return signAccessToken(user);
}

/**
 * Create a domain directly in the DB.
 */
export async function createTestDomain(overrides = {}) {
  const slug = `test-domain-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return Domain.create({
    slug,
    label: 'Test Domain',
    shortLabel: 'Test',
    blurb: 'A test domain',
    tagline: 'For testing',
    iconKey: 'Binary',
    accent: 'from-blue-400 to-cyan-400',
    skills: ['testing', 'vitest'],
    order: 0,
    active: true,
    ...overrides,
  });
}

/**
 * Create a question directly in the DB.
 */
export async function createTestQuestion(domain, overrides = {}) {
  return Question.create({
    domain: domain._id,
    topic: 'General',
    difficulty: 'Medium',
    question: 'This is a test question that is long enough to pass validation checks.',
    timeLimit: 120,
    isBuiltIn: true,
    active: true,
    ...overrides,
  });
}

/**
 * Create an interview directly in the DB.
 */
export async function createTestInterview(user, domain, overrides = {}) {
  return Interview.create({
    user: user._id,
    domain: domain._id,
    domainSlug: domain.slug,
    question: 'What is a binary tree?',
    topic: 'Trees',
    difficulty: 'Medium',
    transcript: 'A binary tree is a data structure where each node has at most two children.',
    durationSec: 60,
    wpm: 120,
    fillerCount: 2,
    feedback: {
      scores: { Content: 75, Structure: 70, Clarity: 80, Confidence: 65, Communication: 72 },
      overall: 72,
      summary: 'Test feedback summary.',
      strengths: ['Good point 1', 'Good point 2', 'Good point 3'],
      weaknesses: ['Weak point 1', 'Weak point 2', 'Weak point 3'],
      suggestions: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
      followUp: 'What about edge cases?',
      communication: { tone: 'Confident', pacing: 'Steady', fillerNote: 'Minimal fillers' },
    },
    providerModel: 'test-mock',
    ...overrides,
  });
}

/**
 * Mock AI evaluator — returns valid feedback without hitting a real API.
 */
export const MOCK_FEEDBACK = {
  feedback: {
    scores: { Content: 75, Structure: 70, Clarity: 80, Confidence: 65, Communication: 72 },
    overall: 72,
    summary: 'Test feedback summary.',
    strengths: ['Good point 1', 'Good point 2', 'Good point 3'],
    weaknesses: ['Weak point 1', 'Weak point 2', 'Weak point 3'],
    suggestions: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
    followUp: 'What about edge cases?',
    communication: { tone: 'Confident', pacing: 'Steady', fillerNote: 'Minimal filler words' },
  },
  providerModel: 'test-mock',
};

export function installMockEvaluator() {
  setEvaluatorOverride(() => MOCK_FEEDBACK);
}

export function clearMockEvaluator() {
  setEvaluatorOverride(null);
}

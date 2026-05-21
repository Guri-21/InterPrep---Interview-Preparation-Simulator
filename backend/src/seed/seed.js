/**
 * `npm run seed` — populate MongoDB with the canonical domain + question bank.
 *
 * Idempotent: upserts by `slug` for domains and by the natural composite
 * (domain + question text) for questions, so running it twice doesn't create
 * duplicates. Built-in seed questions always have isBuiltIn=true.
 *
 *   - Existing custom user questions are untouched.
 *   - To delete and re-seed everything, run `npm run seed -- --fresh`.
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Domain from '../models/Domain.js';
import Question from '../models/Question.js';
import Interview from '../models/Interview.js';
import { DOMAINS, QUESTIONS } from './seedData.js';

/**
 * Explicitly build every collection index defined in the schemas. In
 * production we run with autoIndex disabled (for performance), so seed
 * time is when we materialize indexes on Atlas.
 */
async function syncAllIndexes() {
  await Promise.all([
    User.syncIndexes(),
    Domain.syncIndexes(),
    Question.syncIndexes(),
    Interview.syncIndexes(),
  ]);
}

async function seedDomains() {
  const writes = DOMAINS.map((d) => ({
    updateOne: {
      filter: { slug: d.slug },
      update: { $set: d },
      upsert: true,
    },
  }));
  const result = await Domain.bulkWrite(writes);
  return result;
}

async function seedQuestions(fresh = false) {
  if (fresh) {
    await Question.deleteMany({ isBuiltIn: true });
  }
  const domains = await Domain.find({});
  const bySlug = Object.fromEntries(domains.map((d) => [d.slug, d._id]));

  const ops = QUESTIONS.map(([slug, topic, difficulty, question, timeLimit]) => {
    const domainId = bySlug[slug];
    if (!domainId) throw new Error(`No domain for slug "${slug}"`);
    return {
      updateOne: {
        filter: { domain: domainId, question },
        update: { $set: { topic, difficulty, timeLimit, isBuiltIn: true, active: true, createdBy: null } },
        upsert: true,
      },
    };
  });
  const result = await Question.bulkWrite(ops);
  return result;
}

async function main() {
  const fresh = process.argv.includes('--fresh');
  console.log(`[seed] starting (fresh=${fresh})`);

  await connectDB();
  await syncAllIndexes();
  console.log('[seed] indexes synced');
  const d = await seedDomains();
  console.log(`[seed] domains: ${d.upsertedCount} new, ${d.modifiedCount} updated, ${d.matchedCount} matched`);
  const q = await seedQuestions(fresh);
  console.log(`[seed] questions: ${q.upsertedCount} new, ${q.modifiedCount} updated`);

  await disconnectDB();
  console.log('[seed] done.');
}

main().catch((err) => {
  console.error('[seed] error:', err);
  // Make sure we don't leave the process hanging on the connection.
  try { mongoose.connection.close(); } catch { /* ignore */ }
  process.exit(1);
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import {
  getApp, createTestUser, createTestDomain, getAuthToken,
  installMockEvaluator, clearMockEvaluator, createTestInterview,
} from './setup.js';

describe('Interview Endpoints', () => {
  let app, user, token, domain;

  beforeEach(async () => {
    app = getApp();
    installMockEvaluator();
    domain = await createTestDomain({ slug: 'dsa' });
    user = await createTestUser({ email: 'interviewee@test.com' });
    token = getAuthToken(user);
  });

  afterEach(() => {
    clearMockEvaluator();
  });

  /* ─── POST /api/interviews/analyze ──────────────────────────── */

  describe('POST /api/interviews/analyze', () => {
    const validPayload = () => ({
      transcript: 'A binary search tree is a data structure where each node has at most two children, with the left child being smaller and the right child being larger.',
      question: 'Explain what a binary search tree is.',
      domain: 'dsa',
      topic: 'Trees',
      difficulty: 'Medium',
      durationSec: 45,
      wpm: 130,
      fillerCount: 1,
    });

    it('returns 201 with interview + AI feedback', async () => {
      const res = await request(app)
        .post('/api/interviews/analyze')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload());

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('interview');

      const iv = res.body.interview;
      expect(iv.domainSlug).toBe('dsa');
      expect(iv.feedback).toBeDefined();
      expect(iv.feedback.overall).toBe(72);
      expect(iv.feedback.scores.Content).toBe(75);
      expect(iv.feedback.strengths).toHaveLength(3);
      expect(iv.feedback.weaknesses).toHaveLength(3);
      expect(iv.feedback.suggestions).toHaveLength(3);
      expect(iv.providerModel).toBe('test-mock');
    });

    it('returns 400 for transcript too short', async () => {
      const res = await request(app)
        .post('/api/interviews/analyze')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validPayload(), transcript: 'Too short' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for missing question', async () => {
      const payload = validPayload();
      delete payload.question;

      const res = await request(app)
        .post('/api/interviews/analyze')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);
    });

    it('returns 400 for unknown domain', async () => {
      const res = await request(app)
        .post('/api/interviews/analyze')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validPayload(), domain: 'nonexistent-domain' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/interviews/analyze')
        .send(validPayload());

      expect(res.status).toBe(401);
    });
  });

  /* ─── GET /api/interviews ───────────────────────────────────── */

  describe('GET /api/interviews', () => {
    it('returns 200 with paginated interview history', async () => {
      await createTestInterview(user, domain);
      await createTestInterview(user, domain);

      const res = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body).toHaveProperty('total', 2);
      expect(res.body).toHaveProperty('page', 1);
    });

    it('returns only the authenticated user\'s interviews', async () => {
      const otherUser = await createTestUser({ email: 'other@test.com' });
      await createTestInterview(user, domain);
      await createTestInterview(otherUser, domain);

      const res = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/interviews');
      expect(res.status).toBe(401);
    });
  });

  /* ─── GET /api/interviews/stats ─────────────────────────────── */

  describe('GET /api/interviews/stats', () => {
    it('returns 200 with aggregated KPIs', async () => {
      await createTestInterview(user, domain);
      await createTestInterview(user, domain, { feedback: { overall: 85 } });

      const res = await request(app)
        .get('/api/interviews/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totals');
      expect(res.body).toHaveProperty('byDomain');
      expect(res.body).toHaveProperty('trend');
      expect(res.body.totals.total).toBe(2);
    });

    it('returns zeros when user has no interviews', async () => {
      const res = await request(app)
        .get('/api/interviews/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totals.total).toBe(0);
    });
  });

  /* ─── GET /api/interviews/:id ───────────────────────────────── */

  describe('GET /api/interviews/:id', () => {
    it('returns 200 for the interview owner', async () => {
      const iv = await createTestInterview(user, domain);

      const res = await request(app)
        .get(`/api/interviews/${iv._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.interview.question).toBe('What is a binary tree?');
    });

    it('returns 403 for a non-owner', async () => {
      const otherUser = await createTestUser({ email: 'other2@test.com' });
      const iv = await createTestInterview(otherUser, domain);

      const res = await request(app)
        .get(`/api/interviews/${iv._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent interview', async () => {
      const res = await request(app)
        .get('/api/interviews/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  /* ─── DELETE /api/interviews/:id ────────────────────────────── */

  describe('DELETE /api/interviews/:id', () => {
    it('returns 204 for the interview owner', async () => {
      const iv = await createTestInterview(user, domain);

      const res = await request(app)
        .delete(`/api/interviews/${iv._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it('returns 403 for a non-owner', async () => {
      const otherUser = await createTestUser({ email: 'other3@test.com' });
      const iv = await createTestInterview(otherUser, domain);

      const res = await request(app)
        .delete(`/api/interviews/${iv._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});

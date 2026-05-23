import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import {
  getApp, createTestUser, createTestAdmin, createTestDomain,
  createTestQuestion, getAuthToken,
} from './setup.js';

describe('Question Endpoints', () => {
  let app, user, userToken, admin, adminToken, domain;

  beforeEach(async () => {
    app = getApp();
    domain = await createTestDomain({ slug: 'frontend' });
    user = await createTestUser({ email: 'quser@test.com' });
    userToken = getAuthToken(user);
    admin = await createTestAdmin({ email: 'qadmin@test.com' });
    adminToken = getAuthToken(admin);
  });

  /* ─── GET /api/questions ────────────────────────────────────── */

  describe('GET /api/questions', () => {
    it('returns 200 with paginated questions (public)', async () => {
      await createTestQuestion(domain);
      await createTestQuestion(domain, { topic: 'React' });

      const res = await request(app).get('/api/questions');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body).toHaveProperty('total', 2);
    });

    it('filters by domain slug', async () => {
      const other = await createTestDomain({ slug: 'backend' });
      await createTestQuestion(domain);
      await createTestQuestion(other);

      const res = await request(app).get('/api/questions?domain=frontend');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });

    it('filters by difficulty', async () => {
      await createTestQuestion(domain, { difficulty: 'Easy' });
      await createTestQuestion(domain, { difficulty: 'Hard' });

      const res = await request(app).get('/api/questions?difficulty=Hard');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });
  });

  /* ─── GET /api/questions/:id ────────────────────────────────── */

  describe('GET /api/questions/:id', () => {
    it('returns 200 with the question', async () => {
      const q = await createTestQuestion(domain);

      const res = await request(app).get(`/api/questions/${q._id}`);

      expect(res.status).toBe(200);
      expect(res.body.question).toBeDefined();
    });

    it('returns 404 for non-existent question', async () => {
      const res = await request(app).get('/api/questions/000000000000000000000000');
      expect(res.status).toBe(404);
    });
  });

  /* ─── POST /api/questions ───────────────────────────────────── */

  describe('POST /api/questions', () => {
    it('creates a custom question (201)', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          domain: 'frontend',
          topic: 'CSS Grid',
          difficulty: 'Medium',
          question: 'Explain how CSS Grid works and when you would use it over Flexbox.',
          timeLimit: 90,
        });

      expect(res.status).toBe(201);
      expect(res.body.question.topic).toBe('CSS Grid');
      expect(res.body.question.isBuiltIn).toBe(false);
    });

    it('returns 400 for question text too short', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          domain: 'frontend',
          difficulty: 'Easy',
          question: 'Short?',
        });

      expect(res.status).toBe(400);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({
          domain: 'frontend',
          difficulty: 'Easy',
          question: 'This question is long enough to pass validation checks for the minimum length.',
        });

      expect(res.status).toBe(401);
    });
  });

  /* ─── PATCH /api/questions/:id ──────────────────────────────── */

  describe('PATCH /api/questions/:id', () => {
    it('owner can update their own custom question', async () => {
      const q = await createTestQuestion(domain, {
        isBuiltIn: false,
        createdBy: user._id,
        question: 'Original question text that is long enough for validation.',
      });

      const res = await request(app)
        .patch(`/api/questions/${q._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ topic: 'Updated Topic' });

      expect(res.status).toBe(200);
      expect(res.body.question.topic).toBe('Updated Topic');
    });

    it('non-owner cannot update another user\'s question (403)', async () => {
      const otherUser = await createTestUser({ email: 'otherq@test.com' });
      const q = await createTestQuestion(domain, {
        isBuiltIn: false,
        createdBy: otherUser._id,
      });

      const res = await request(app)
        .patch(`/api/questions/${q._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ topic: 'Hacked' });

      expect(res.status).toBe(403);
    });

    it('admin can update any question', async () => {
      const q = await createTestQuestion(domain);

      const res = await request(app)
        .patch(`/api/questions/${q._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ topic: 'Admin Updated' });

      expect(res.status).toBe(200);
      expect(res.body.question.topic).toBe('Admin Updated');
    });
  });

  /* ─── DELETE /api/questions/:id ─────────────────────────────── */

  describe('DELETE /api/questions/:id', () => {
    it('owner can soft-delete their question (204)', async () => {
      const q = await createTestQuestion(domain, {
        isBuiltIn: false,
        createdBy: user._id,
      });

      const res = await request(app)
        .delete(`/api/questions/${q._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(204);
    });

    it('non-owner cannot delete built-in questions (403)', async () => {
      const q = await createTestQuestion(domain, { isBuiltIn: true });

      const res = await request(app)
        .delete(`/api/questions/${q._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  /* ─── POST /api/questions/:id/restore (admin only) ──────────── */

  describe('POST /api/questions/:id/restore', () => {
    it('admin can restore a soft-deleted question', async () => {
      const q = await createTestQuestion(domain, { active: false });

      const res = await request(app)
        .post(`/api/questions/${q._id}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.question.active).toBe(true);
    });

    it('non-admin cannot restore (403)', async () => {
      const q = await createTestQuestion(domain, { active: false });

      const res = await request(app)
        .post(`/api/questions/${q._id}/restore`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});

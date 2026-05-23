import { describe, it, expect } from 'vitest';
import request from 'supertest';
import {
  getApp, createTestUser, getAuthToken,
} from './setup.js';

describe('Auth Endpoints', () => {
  let app;

  it('setup', () => { app = getApp(); });

  /* ─── POST /api/auth/signup ──────────────────────────────────── */

  describe('POST /api/auth/signup', () => {
    it('creates a new user and returns 201 with user + token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Alice', email: 'alice@test.com', password: 'SecurePass123!' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.name).toBe('Alice');
      expect(res.body.user.email).toBe('alice@test.com');
      expect(res.body.user.role).toBe('user');
      // Password hash must never be exposed.
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('returns 409 for duplicate email', async () => {
      await createTestUser({ email: 'dup@test.com' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Bob', email: 'dup@test.com', password: 'SecurePass123!' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('returns 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'noname@test.com', password: 'SecurePass123!' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for short password (< 8 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Short', email: 'short@test.com', password: '123' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Bad', email: 'not-an-email', password: 'SecurePass123!' });

      expect(res.status).toBe(400);
    });
  });

  /* ─── POST /api/auth/login ───────────────────────────────────── */

  describe('POST /api/auth/login', () => {
    it('returns 200 with user + token for valid credentials', async () => {
      await createTestUser({ email: 'login@test.com', password: 'MyPassword99!' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'MyPassword99!' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('returns 401 for wrong password', async () => {
      await createTestUser({ email: 'wrongpw@test.com', password: 'CorrectPass1!' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrongpw@test.com', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'SomePass123!' });

      expect(res.status).toBe(401);
    });

    it('returns 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });
  });

  /* ─── GET /api/auth/me ───────────────────────────────────────── */

  describe('GET /api/auth/me', () => {
    it('returns 200 with current user when authenticated', async () => {
      const user = await createTestUser({ email: 'me@test.com' });
      const token = getAuthToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('me@test.com');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-garbage-token');

      expect(res.status).toBe(401);
    });
  });

  /* ─── POST /api/auth/logout ──────────────────────────────────── */

  describe('POST /api/auth/logout', () => {
    it('returns 204 for authenticated user', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  /* ─── GET /api/health ────────────────────────────────────────── */

  describe('GET /api/health', () => {
    it('returns 200 with health info', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.name).toBe('InterPrep API');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});

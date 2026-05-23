import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import {
  getApp, createTestUser, createTestAdmin, createTestDomain, getAuthToken,
} from './setup.js';

describe('User Endpoints', () => {
  let app, user, token;

  beforeEach(async () => {
    app = getApp();
    user = await createTestUser({ email: 'profile@test.com', name: 'Profile User' });
    token = getAuthToken(user);
  });

  /* ─── PATCH /api/users/me ───────────────────────────────────── */

  describe('PATCH /api/users/me', () => {
    it('updates display name (200)', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('New Name');
    });

    it('updates preferred domain by slug (200)', async () => {
      const domain = await createTestDomain({ slug: 'dsa-pref' });

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ preferredDomain: 'dsa-pref' });

      expect(res.status).toBe(200);
    });

    it('clears preferred domain with null (200)', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ preferredDomain: null });

      expect(res.status).toBe(200);
    });

    it('returns 400 for unknown preferredDomain', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ preferredDomain: 'nonexistent-slug' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .send({ name: 'Hack' });

      expect(res.status).toBe(401);
    });
  });

  /* ─── POST /api/users/me/password ───────────────────────────── */

  describe('POST /api/users/me/password', () => {
    it('changes password with correct current password (204)', async () => {
      const res = await request(app)
        .post('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'TestPassword123!', newPassword: 'NewSecurePass456!' });

      expect(res.status).toBe(204);

      // Verify new password works for login.
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'profile@test.com', password: 'NewSecurePass456!' });

      expect(loginRes.status).toBe(200);
    });

    it('returns 401 for wrong current password', async () => {
      const res = await request(app)
        .post('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'WrongPassword!', newPassword: 'NewPass123!' });

      expect(res.status).toBe(401);
    });

    it('returns 400 for too-short new password', async () => {
      const res = await request(app)
        .post('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'TestPassword123!', newPassword: '123' });

      expect(res.status).toBe(400);
    });
  });

  /* ─── DELETE /api/users/me ──────────────────────────────────── */

  describe('DELETE /api/users/me', () => {
    it('deletes the authenticated user (204)', async () => {
      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);

      // Verify user is gone — login should fail.
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'profile@test.com', password: 'TestPassword123!' });

      expect(loginRes.status).toBe(401);
    });
  });
});

describe('Domain Endpoints', () => {
  let app, admin, adminToken;

  beforeEach(async () => {
    app = getApp();
    admin = await createTestAdmin({ email: 'domadmin@test.com' });
    adminToken = getAuthToken(admin);
  });

  /* ─── GET /api/domains ──────────────────────────────────────── */

  describe('GET /api/domains', () => {
    it('returns 200 with active domains (public)', async () => {
      await createTestDomain({ slug: 'dom-a', order: 1 });
      await createTestDomain({ slug: 'dom-b', order: 0 });
      await createTestDomain({ slug: 'dom-c', active: false });

      const res = await request(app).get('/api/domains');

      expect(res.status).toBe(200);
      expect(res.body.domains).toHaveLength(2); // dom-c is inactive
    });
  });

  /* ─── GET /api/domains/:slug ────────────────────────────────── */

  describe('GET /api/domains/:slug', () => {
    it('returns 200 with the domain', async () => {
      await createTestDomain({ slug: 'specific-domain', label: 'Specific' });

      const res = await request(app).get('/api/domains/specific-domain');

      expect(res.status).toBe(200);
      expect(res.body.domain.label).toBe('Specific');
    });

    it('returns 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/domains/nope');
      expect(res.status).toBe(404);
    });
  });

  /* ─── POST /api/domains (admin) ─────────────────────────────── */

  describe('POST /api/domains (admin)', () => {
    it('creates a domain (201)', async () => {
      const res = await request(app)
        .post('/api/domains')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'new-domain',
          label: 'New Domain',
          shortLabel: 'New',
          skills: ['skill1'],
        });

      expect(res.status).toBe(201);
      expect(res.body.domain.slug).toBe('new-domain');
    });

    it('returns 403 for non-admin', async () => {
      const user = await createTestUser({ email: 'nonadmin@test.com' });
      const userToken = getAuthToken(user);

      const res = await request(app)
        .post('/api/domains')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          slug: 'forbidden-domain',
          label: 'Forbidden',
          shortLabel: 'Nope',
        });

      expect(res.status).toBe(403);
    });
  });
});

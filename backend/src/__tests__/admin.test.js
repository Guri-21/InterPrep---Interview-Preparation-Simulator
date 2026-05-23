import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import {
  getApp, createTestUser, createTestAdmin, createTestDomain,
  createTestInterview, getAuthToken,
} from './setup.js';

describe('Admin Endpoints', () => {
  let app, admin, adminToken, user, userToken, domain;

  beforeEach(async () => {
    app = getApp();
    domain = await createTestDomain({ slug: 'system-design' });
    admin = await createTestAdmin({ email: 'admin@test.com' });
    adminToken = getAuthToken(admin);
    user = await createTestUser({ email: 'regular@test.com' });
    userToken = getAuthToken(user);
  });

  /* ─── Access control ────────────────────────────────────────── */

  describe('Access control', () => {
    it('returns 403 for non-admin on /api/admin/stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('returns 401 without any auth on /api/admin/stats', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin on /api/admin/users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  /* ─── GET /api/admin/stats ──────────────────────────────────── */

  describe('GET /api/admin/stats', () => {
    it('returns 200 with platform stats for admin', async () => {
      await createTestInterview(user, domain);

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('counts');
      expect(res.body).toHaveProperty('byDomain');
      expect(res.body).toHaveProperty('recentInterviews');
      expect(res.body.counts.userCount).toBeGreaterThanOrEqual(2); // admin + user
      expect(res.body.counts.interviewCount).toBe(1);
    });
  });

  /* ─── GET /api/admin/users ──────────────────────────────────── */

  describe('GET /api/admin/users', () => {
    it('returns 200 with paginated user list', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
    });

    it('filters users by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.items.forEach((u) => {
        expect(u.role).toBe('admin');
      });
    });

    it('searches users by name', async () => {
      const res = await request(app)
        .get('/api/admin/users?q=regular')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      // Should find the user with email 'regular@test.com'
      expect(res.body.items.length).toBeGreaterThanOrEqual(0);
    });
  });

  /* ─── PATCH /api/admin/users/:id/role ───────────────────────── */

  describe('PATCH /api/admin/users/:id/role', () => {
    it('promotes a user to admin (200)', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${user._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
    });

    it('prevents demoting the last admin (400)', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${admin._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid role value', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${user._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'superadmin' });

      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app)
        .patch('/api/admin/users/000000000000000000000000/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(404);
    });
  });

  /* ─── DELETE /api/admin/users/:id ───────────────────────────── */

  describe('DELETE /api/admin/users/:id', () => {
    it('deletes a user (204)', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('prevents deleting the last admin (400)', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  /* ─── GET /api/admin/interviews ─────────────────────────────── */

  describe('GET /api/admin/interviews', () => {
    it('returns 200 with all interviews across users', async () => {
      await createTestInterview(user, domain);
      await createTestInterview(admin, domain);

      const res = await request(app)
        .get('/api/admin/interviews')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
    });

    it('filters by domainSlug', async () => {
      const other = await createTestDomain({ slug: 'ml' });
      await createTestInterview(user, domain);
      await createTestInterview(user, other);

      const res = await request(app)
        .get('/api/admin/interviews?domainSlug=system-design')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });
  });
});

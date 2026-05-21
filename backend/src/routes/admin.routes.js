import { Router } from 'express';
import * as ctrl from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// Every admin route requires both auth + admin role.
router.use(requireAuth, requireRole('admin'));

router.get('/stats',                ctrl.platformStats);
router.get('/users',                ctrl.listUsers);
router.patch('/users/:id/role',     ctrl.updateUserRole);
router.delete('/users/:id',         ctrl.deleteUser);
router.get('/interviews',           ctrl.listAllInterviews);

export default router;

import { Router } from 'express';
import * as ctrl from '../controllers/questionController.js';
import { requireAuth, attachUserIfPresent } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { questionCreateSchema, questionUpdateSchema } from '../validators/schemas.js';

const router = Router();

// Public + soft-auth (so logged-in users can use ?mine=1, admins see inactive).
router.get('/',     attachUserIfPresent, ctrl.listQuestions);
router.get('/:id',  ctrl.getQuestion);

router.post  ('/',          requireAuth, validate(questionCreateSchema), ctrl.createQuestion);
router.patch ('/:id',       requireAuth, validate(questionUpdateSchema), ctrl.updateQuestion);
router.delete('/:id',       requireAuth, ctrl.deleteQuestion);
router.post  ('/:id/restore', requireAuth, requireRole('admin'), ctrl.restoreQuestion);

export default router;

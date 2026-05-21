import { Router } from 'express';
import * as ctrl from '../controllers/interviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { analyzeLimiter } from '../middleware/rateLimit.js';
import { analyzeSchema } from '../validators/schemas.js';

const router = Router();

router.post('/analyze', requireAuth, analyzeLimiter, validate(analyzeSchema), ctrl.analyzeAndPersist);

router.get('/stats',   requireAuth, ctrl.myStats);
router.get('/',        requireAuth, ctrl.listMyInterviews);
router.get('/:id',     requireAuth, ctrl.getInterview);
router.delete('/:id',  requireAuth, ctrl.deleteInterview);

export default router;

import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { signupSchema, loginSchema } from '../validators/schemas.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), ctrl.signup);
router.post('/login',  authLimiter, validate(loginSchema),  ctrl.login);
router.get ('/me',     requireAuth, ctrl.me);
router.post('/logout', requireAuth, ctrl.logout);

export default router;

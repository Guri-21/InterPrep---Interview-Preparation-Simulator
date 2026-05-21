import { Router } from 'express';
import * as ctrl from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/schemas.js';

const router = Router();

router.patch ('/me',          requireAuth, validate(updateProfileSchema),  ctrl.updateProfile);
router.post  ('/me/password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);
router.delete('/me',          requireAuth, ctrl.deleteAccount);

export default router;

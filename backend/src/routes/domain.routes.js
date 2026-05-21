import { Router } from 'express';
import * as ctrl from '../controllers/domainController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { domainCreateSchema, domainUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/',      ctrl.listDomains);
router.get('/:slug', ctrl.getDomain);

router.post  ('/',      requireAuth, requireRole('admin'), validate(domainCreateSchema), ctrl.createDomain);
router.patch ('/:slug', requireAuth, requireRole('admin'), validate(domainUpdateSchema), ctrl.updateDomain);
router.delete('/:slug', requireAuth, requireRole('admin'), ctrl.deleteDomain);

export default router;

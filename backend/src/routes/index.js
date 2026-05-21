import { Router } from 'express';
import authRoutes      from './auth.routes.js';
import userRoutes      from './user.routes.js';
import domainRoutes    from './domain.routes.js';
import questionRoutes  from './question.routes.js';
import interviewRoutes from './interview.routes.js';
import adminRoutes     from './admin.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    name: 'InterPrep API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth',       authRoutes);
router.use('/users',      userRoutes);
router.use('/domains',    domainRoutes);
router.use('/questions',  questionRoutes);
router.use('/interviews', interviewRoutes);
router.use('/admin',      adminRoutes);

export default router;

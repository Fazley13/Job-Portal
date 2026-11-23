import express from 'express';
import { getAlumniDashboardData } from '../controllers/alumniController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/dashboard', authorize('alumni', 'admin'), getAlumniDashboardData);
router.get('/dashboard/:alumniId', authorize('alumni', 'admin'), getAlumniDashboardData);

export default router;

import express from 'express';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getJobAnalytics
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/', authorize('employer', 'admin'), createJob);
router.put('/:id', authorize('employer', 'admin'), updateJob);
router.delete('/:id', authorize('employer', 'admin'), deleteJob);
router.get('/employer/my', authorize('employer', 'admin'), getEmployerJobs);
router.get('/:id/analytics', authorize('employer', 'admin'), getJobAnalytics);

export default router;
import express from 'express';
import {
  applyForJob,
  updateApplicationStatus,
  getMyApplications,
  getEmployerApplications,
  withdrawApplication
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', applyForJob);
router.get('/my', getMyApplications);
router.get('/employer', authorize('employer', 'admin'), getEmployerApplications);
router.put('/:id/status', updateApplicationStatus);
router.delete('/:id', withdrawApplication);

export default router;
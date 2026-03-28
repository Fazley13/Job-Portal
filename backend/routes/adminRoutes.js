import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllJobs,
  updateJobStatus,
  getRecentActivities,
  getAllEvents
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard and statistics
router.get('/stats', getAdminStats);
router.get('/activities', getRecentActivities);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Job management
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/status', updateJobStatus);

//changes for event fix 2.47
router.get('/events', getAllEvents);

export default router;
import express from 'express';
import {
  startRoadmap,
  getMyRoadmaps,
  getRoadmapProgress,
  updateSkillCompletion,
  getRoadmapStats
} from '../controllers/userRoadmapController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student/Alumni routes
router.post('/start/:roadmapId', authorize('student', 'alumni'), startRoadmap);
router.get('/my', authorize('student', 'alumni'), getMyRoadmaps);
router.get('/:roadmapId', authorize('student', 'alumni'), getRoadmapProgress);
router.put('/:roadmapId/skill', authorize('student', 'alumni'), updateSkillCompletion);

// Admin routes
router.get('/stats/:roadmapId', authorize('admin'), getRoadmapStats);

export default router;
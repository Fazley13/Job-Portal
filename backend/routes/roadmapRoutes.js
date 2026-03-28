import express from 'express';
import {
  createRoadmap,
  getRoadmaps,
  getRoadmap,
  updateRoadmap,
  deleteRoadmap,
  startRoadmap,
  getRoadmapProgress,
  completeSkill,
  rateRoadmap,
  getPopularRoadmaps,
  getUserRoadmaps
} from '../controllers/roadmapController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getRoadmaps);
router.get('/popular', getPopularRoadmaps);
router.get('/:id', getRoadmap);

// Protected routes
router.use(protect);

router.get('/my/progress', getUserRoadmaps);
router.post('/:id/start', startRoadmap);
router.get('/:id/progress', getRoadmapProgress);
router.post('/:id/complete-skill', completeSkill);
router.post('/:id/rate', rateRoadmap);

// Admin only routes
router.post('/', authorize('admin'), createRoadmap);
router.put('/:id', authorize('admin'), updateRoadmap);
router.delete('/:id', authorize('admin'), deleteRoadmap);

export default router;
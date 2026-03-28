import express from 'express';
import {
  generateCareerSuggestion,
  getMyCareerSuggestions,
  updateProgress,
  getAvailableRoles
} from '../controllers/careerSuggestionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/roles', getAvailableRoles);

// Protected routes
router.use(protect);

router.post('/generate', generateCareerSuggestion);
router.get('/my', getMyCareerSuggestions);
router.put('/:id/progress', updateProgress);

export default router;
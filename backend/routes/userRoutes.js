import express from 'express';
import {
  searchUsers,
  getUserProfile,
  getUserStats
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/search', searchUsers);
router.get('/stats', getUserStats);
router.get('/:userId', getUserProfile);

export default router;
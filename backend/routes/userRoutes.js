import express from 'express';
import {
  searchUsers,
  getUserProfile,
  getUserStats,
  avatarUpload,
  uploadAvatar,
  deleteAvatar
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/search', searchUsers);
router.get('/stats', getUserStats);
router.post('/avatar', (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.get('/:userId', getUserProfile);

export default router;
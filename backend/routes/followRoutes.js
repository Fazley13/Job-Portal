import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
  getSuggestedUsers
} from '../controllers/followController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/suggestions', getSuggestedUsers);
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/status', getFollowStatus);

export default router;
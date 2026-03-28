import express from 'express';
import {
  createPost,
  getFeedPosts,
  getUserPosts,
  toggleLikePost,
  addComment,
  deletePost,
  searchPosts
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', createPost);
router.get('/feed', getFeedPosts);
router.get('/search', searchPosts);
router.get('/user/:userId', getUserPosts);
router.post('/:id/like', toggleLikePost);
router.post('/:id/comment', addComment);
router.delete('/:id', deletePost);

export default router;
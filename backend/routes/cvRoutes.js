import express from 'express';
import {
  uploadCV,
  getMyCV,
  getUserCV,
  downloadCV,
  updateCVVisibility,
  deleteCV,
  upload
} from '../controllers/cvController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/upload', upload.single('cv'), uploadCV);
router.get('/my', getMyCV);
router.get('/user/:userId', getUserCV);
router.get('/:cvId/download', downloadCV);
router.put('/:cvId/visibility', updateCVVisibility);
router.delete('/:cvId', deleteCV);

export default router;
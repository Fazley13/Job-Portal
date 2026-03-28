import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEmployerEvents
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/', authorize('employer', 'admin'), createEvent);
router.put('/:id', authorize('employer', 'admin'), updateEvent);
router.delete('/:id', authorize('employer', 'admin'), deleteEvent);
router.get('/employer/my', authorize('employer', 'admin'), getEmployerEvents);

export default router;
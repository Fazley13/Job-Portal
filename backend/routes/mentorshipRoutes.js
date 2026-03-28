import express from 'express';
import multer from 'multer'; // ✅ NEW for file uploads
import path from 'path';
import {
  createMentorshipProgram,
  getAlumniPrograms,
  getAllPrograms,
  enrollInProgram,
  getProgramDetails,
  addProgramContent,
  getProgramContent,
  updateMentorshipProgram,
  getAdminMentorshipPrograms,
  getStudentEnrolledProgram
} from '../controllers/mentorshipController.js';
import {
  createSession,        // ✅ NEW
  getSessions,          // ✅ NEW
  updateSessionStatus   // ✅ NEW
} from '../controllers/mentorshipSessionController.js'; // ✅ NEW file
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ✅ NEW: Setup file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/mentorship/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// All routes require authentication
router.use(protect);

// Student routes
router.get('/programs', authorize('student', 'admin', 'alumni'), getAllPrograms);
router.get('/student/my-program', authorize('student'), getStudentEnrolledProgram);
router.post('/programs/:programId/enroll', authorize('student'), enrollInProgram);

// Alumni routes
router.post('/programs', authorize('alumni'), createMentorshipProgram);
router.get('/programs/alumni', authorize('alumni'), getAlumniPrograms);
router.put('/programs/:programId', authorize('alumni'), updateMentorshipProgram);

// Common routes for alumni and students (program participants)
router.get('/programs/:programId', authorize('student', 'alumni', 'admin'), getProgramDetails);

// ✅ NEW: File upload support for content
router.post(
  '/programs/:programId/content',
  authorize('student', 'alumni'),
  upload.single('file'), // File field name: 'file'
  addProgramContent
);

router.get('/programs/:programId/content', authorize('student', 'alumni'), getProgramContent);
router.post('/programs/:programId/content', authorize('student', 'alumni'), addProgramContent);
router.get('/programs/:programId/content', authorize('student', 'alumni'), getProgramContent);

// ✅ NEW: Mentorship sessions
router.post('/programs/:programId/sessions', authorize('alumni', 'student'), createSession);
router.get('/programs/:programId/sessions', authorize('alumni', 'student'), getSessions);
router.put('/sessions/:sessionId/status', authorize('alumni', 'student'), updateSessionStatus);


// Admin routes
router.get('/admin/programs', authorize('admin'), getAdminMentorshipPrograms);

export default router;
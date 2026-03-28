import express from 'express';
import {
  applyToCompany,
  getMyCompanyApplications,
  getCompanyApplications,
  updateCompanyApplicationStatus,
  withdrawCompanyApplication
} from '../controllers/companyApplicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', authorize('student', 'alumni'), applyToCompany);
router.get('/my', authorize('student', 'alumni'), getMyCompanyApplications);
router.get('/company/:companyId', authorize('employer', 'admin'), getCompanyApplications);
router.put('/:id/status', authorize('employer', 'admin'), updateCompanyApplicationStatus);
router.delete('/:id', authorize('student', 'alumni'), withdrawCompanyApplication);

export default router;
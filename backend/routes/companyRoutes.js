import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  getMyCompanies,
  getCompanyStats,
  searchCompanies,
  getFeaturedCompanies
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCompanies);
router.get('/search', searchCompanies);
router.get('/featured', getFeaturedCompanies);
router.get('/:id', getCompany);
router.get('/:id/stats', getCompanyStats);

// Protected routes
router.use(protect);

router.post('/', authorize('employer', 'admin'), createCompany);
router.get('/my/companies', authorize('employer', 'admin'), getMyCompanies);
router.put('/:id', authorize('employer', 'admin'), updateCompany);
router.delete('/:id', authorize('employer', 'admin'), deleteCompany);

export default router;
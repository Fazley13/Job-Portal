import Company from '../models/Company.js';
import Job from '../models/Job.js';
import User from '../models/user.js';

// @desc    Create new company profile
// @route   POST /api/companies
// @access  Private (Employer/Admin)
export const createCompany = async (req, res) => {
  console.log('\n--- DIAGNOSTIC LOG: createCompany function started ---');
  try {
    const {
      name,
      description,
      industry,
      size,
      founded,
      headquarters,
      website,
      logo,
      coverImage,
      socialLinks,
      benefits,
      culture,
      values,
      technologies,
      locations
    } = req.body;

    console.log('1. Received data from form. Company name:', name);

    // Check if company name already exists
    const existingCompany = await Company.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    // THIS IS THE MOST IMPORTANT LOG
    console.log('2. Result of database search for existing company:', existingCompany);

    if (existingCompany) {
      console.log('3. An existing company was found. Sending error to frontend.');
      return res.status(400).json({
        success: false,
        message: 'A company with this name already exists'
      });
    }

    console.log('3. No existing company found. Creating new company...');

    const company = await Company.create({
      name,
      description,
      industry,
      size,
      founded,
      headquarters,
      website,
      logo,
      coverImage,
      socialLinks: socialLinks || {},
      benefits: benefits || [],
      culture,
      values: values || [],
      technologies: technologies || [],
      locations: locations || [],
      createdBy: req.user.id
    });
    
    console.log('4. New company created successfully in the database.');

    await company.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      company,
      message: 'Company profile created successfully!'
    });
  } catch (error) {
    console.error('--- DIAGNOSTIC LOG: An error occurred ---', error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' 
        ? Object.values(error.errors).map(val => val.message).join(', ')
        : 'Server error during company creation',
      error: error.message
    });
  }
};

// @desc    Get all companies with filters
// @route   GET /api/companies
// @access  Public
export const getCompanies = async (req, res) => {
  try {
    const {
      search,
      industry,
      size,
      location,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const filter = { isActive: true };

    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filters
    if (industry) filter.industry = { $regex: industry, $options: 'i' };
    if (size) filter.size = size;
    if (location) filter.headquarters = { $regex: location, $options: 'i' };

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate('createdBy', 'firstName lastName')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit),
      Company.countDocuments(filter)
    ]);

    // Get job counts for each company
    const companiesWithJobCounts = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ 
          company: company.name, 
          isActive: true 
        });
        return {
          ...company.toObject(),
          openPositions: jobCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      companies: companiesWithJobCounts
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('createdBy', 'firstName lastName profile');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get company jobs
    const jobs = await Job.find({ 
      company: company.name, 
      isActive: true 
    }).sort({ createdAt: -1 });

    // Update open positions count
    company.openPositions = jobs.length;
    await company.save();

    res.status(200).json({
      success: true,
      company: {
        ...company.toObject(),
        jobs
      }
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Employer/Admin)
export const updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check authorization
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      company,
      message: 'Company updated successfully'
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' 
        ? Object.values(error.errors).map(val => val.message).join(', ')
        : 'Server error during company update',
      error: error.message
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Employer/Admin)
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check authorization
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this company'
      });
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during company deletion',
      error: error.message
    });
  }
};

// @desc    Get employer's companies
// @route   GET /api/companies/my
// @access  Private (Employer)
export const getMyCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    // Get job counts for each company
    const companiesWithJobCounts = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ 
          company: company.name, 
          isActive: true 
        });
        return {
          ...company.toObject(),
          openPositions: jobCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: companies.length,
      companies: companiesWithJobCounts
    });
  } catch (error) {
    console.error('Get my companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get company statistics
// @route   GET /api/companies/:id/stats
// @access  Public
export const getCompanyStats = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get job statistics
    const totalJobs = await Job.countDocuments({ company: company.name });
    const activeJobs = await Job.countDocuments({ company: company.name, isActive: true });
    
    // Get application statistics
    const jobs = await Job.find({ company: company.name }).select('_id');
    const jobIds = jobs.map(job => job._id);
    
    const Application = mongoose.model('Application');
    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });
    const recentApplications = await Application.countDocuments({
      jobId: { $in: jobIds },
      appliedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const stats = {
      totalJobs,
      activeJobs,
      totalApplications,
      recentApplications,
      employeesCount: company.employeesCount || 0,
      rating: company.rating || 0,
      reviewsCount: company.reviewsCount || 0
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search companies for autocomplete
// @route   GET /api/companies/search
// @access  Public
export const searchCompanies = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const companies = await Company.find({
      isActive: true,
      name: { $regex: q, $options: 'i' }
    })
    .select('name industry headquarters logo')
    .limit(parseInt(limit))
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Search companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get featured companies
// @route   GET /api/companies/featured
// @access  Public
export const getFeaturedCompanies = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const companies = await Company.find({ 
      isActive: true,
      isVerified: true 
    })
    .sort({ rating: -1, openPositions: -1 })
    .limit(parseInt(limit))
    .populate('createdBy', 'firstName lastName');

    // Get job counts for each company
    const companiesWithJobCounts = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ 
          company: company.name, 
          isActive: true 
        });
        return {
          ...company.toObject(),
          openPositions: jobCount
        };
      })
    );

    res.status(200).json({
      success: true,
      companies: companiesWithJobCounts
    });
  } catch (error) {
    console.error('Get featured companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
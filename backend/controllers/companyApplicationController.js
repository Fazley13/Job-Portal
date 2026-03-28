import CompanyApplication from '../models/CompanyApplication.js';
import Company from '../models/Company.js';
import User from '../models/user.js';

// @desc    Apply to a company
// @route   POST /api/company-applications
// @access  Private (Students/Alumni only)
export const applyToCompany = async (req, res) => {
  try {
    const { companyId, coverLetter, resume } = req.body;
    const applicantId = req.user.id;

    // Check if user is allowed to apply (only students and alumni)
    if (req.user.role === 'employer' || req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Employers and admins cannot apply to companies'
      });
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if company is active
    if (!company.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This company is not currently accepting applications'
      });
    }

    // Check if user already applied
    const existingApplication = await CompanyApplication.findOne({
      companyId,
      applicantId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this company'
      });
    }

    // Create application
    const application = await CompanyApplication.create({
      companyId,
      applicantId,
      coverLetter,
      resume,
      status: 'pending'
    });

    // Populate application data
    await application.populate([
      { path: 'companyId', select: 'name industry headquarters' },
      { path: 'applicantId', select: 'firstName lastName email' }
    ]);

    // Emit real-time notification to company owner
    if (req.io && req.connectedUsers) {
      const companyOwnerSocketId = req.connectedUsers[company.createdBy];
      if (companyOwnerSocketId) {
        req.io.to(companyOwnerSocketId).emit('newCompanyApplication', {
          applicationId: application._id,
          companyName: company.name,
          applicantName: `${req.user.firstName} ${req.user.lastName}`,
          appliedAt: application.appliedAt
        });
      }
    }

    res.status(201).json({
      success: true,
      application,
      message: 'Application submitted successfully!'
    });
  } catch (error) {
    console.error('Apply to company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during company application',
      error: error.message
    });
  }
};

// @desc    Get user's company applications
// @route   GET /api/company-applications/my
// @access  Private (Students/Alumni only)
export const getMyCompanyApplications = async (req, res) => {
  try {
    // Only students and alumni can view their applications
    if (req.user.role === 'employer' || req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Employers and admins do not have company applications'
      });
    }

    const applications = await CompanyApplication.find({ applicantId: req.user.id })
      .populate('companyId', 'name industry headquarters logo website isVerified')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get my company applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get applications for company
// @route   GET /api/company-applications/company/:companyId
// @access  Private (Company Owner/Admin only)
export const getCompanyApplications = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Check if company exists and user has permission
    const company = await Company.findById(companyId);
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
        message: 'Not authorized to view applications for this company'
      });
    }

    const applications = await CompanyApplication.find({ companyId })
      .populate('applicantId', 'firstName lastName email profile')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update company application status
// @route   PUT /api/company-applications/:id/status
// @access  Private (Company Owner/Admin only)
export const updateCompanyApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const applicationId = req.params.id;

    const application = await CompanyApplication.findById(applicationId)
      .populate('companyId', 'name createdBy')
      .populate('applicantId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isCompanyOwner = application.companyId.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isCompanyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application status
    application.status = status;
    application.modifiedBy = req.user.id;
    if (notes) application.notes = notes;
    
    await application.save();

    // Emit real-time notification to applicant
    if (req.io && req.connectedUsers) {
      const applicantSocketId = req.connectedUsers[application.applicantId._id];
      if (applicantSocketId) {
        req.io.to(applicantSocketId).emit('companyApplicationStatusUpdate', {
          _id: application._id,
          companyName: application.companyId.name,
          status: status,
          updatedAt: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      application,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Update company application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update',
      error: error.message
    });
  }
};

// @desc    Withdraw company application
// @route   DELETE /api/company-applications/:id
// @access  Private (Applicant only)
export const withdrawCompanyApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    
    const application = await CompanyApplication.findById(applicationId)
      .populate('companyId', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.applicantId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Can only withdraw pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending applications'
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw company application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during application withdrawal',
      error: error.message
    });
  }
};
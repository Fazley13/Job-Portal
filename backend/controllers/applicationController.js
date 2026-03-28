import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/user.js';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Students/Alumni only)
export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body;
    const applicantId = req.user.id;

    // Check if user is allowed to apply (only students and alumni)
    if (req.user.role === 'employer' || req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Employers and admins cannot apply for jobs'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is active
    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Prevent applying to own job (if somehow an employer tries)
    if (job.employerId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job posting'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      jobId,
      applicantId,
      employerId: job.employerId,
      coverLetter,
      resume,
      status: 'pending'
    });

    // Update job applications count
    await job.updateApplicationsCount();

    // Populate application data
    await application.populate([
      { path: 'jobId', select: 'title company' },
      { path: 'applicantId', select: 'firstName lastName email' },
      { path: 'employerId', select: 'firstName lastName email' }
    ]);

    // Emit real-time notification to employer
    if (req.io && req.connectedUsers) {
      const employerSocketId = req.connectedUsers[job.employerId];
      if (employerSocketId) {
        req.io.to(employerSocketId).emit('newApplication', {
          applicationId: application._id,
          jobTitle: job.title,
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
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during job application',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer/Admin/Applicant for offer response)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId)
      .populate('jobId', 'title company')
      .populate('applicantId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isEmployer = application.employerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isApplicant = application.applicantId._id.toString() === req.user.id;
    const isOfferResponse = ['accepted', 'declined'].includes(status);

    if (!isAdmin && !isEmployer && !(isApplicant && isOfferResponse)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Validate status transitions
    if (isApplicant && !isOfferResponse) {
      return res.status(400).json({
        success: false,
        message: 'Applicants can only accept or decline offers'
      });
    }

    if (isOfferResponse && application.status !== 'appointed') {
      return res.status(400).json({
        success: false,
        message: 'Can only accept/decline appointed applications'
      });
    }

    // Update application status
    application.status = status;
    application.modifiedBy = req.user.id;
    if (notes) application.notes = notes;
    
    await application.save();

    // Emit real-time notification to applicant (for employer actions)
    if (req.io && req.connectedUsers && (isEmployer || isAdmin)) {
      const applicantSocketId = req.connectedUsers[application.applicantId._id];
      if (applicantSocketId) {
        req.io.to(applicantSocketId).emit('applicationStatusUpdate', {
          _id: application._id,
          jobTitle: application.jobId.title,
          company: application.jobId.company,
          status: status,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Emit notification to employer (for applicant offer responses)
    if (req.io && req.connectedUsers && isApplicant && isOfferResponse) {
      const employerSocketId = req.connectedUsers[application.employerId];
      if (employerSocketId) {
        req.io.to(employerSocketId).emit('offerResponse', {
          applicationId: application._id,
          jobTitle: application.jobId.title,
          applicantName: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
          response: status,
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
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update',
      error: error.message
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my
// @access  Private (Students/Alumni only)
export const getMyApplications = async (req, res) => {
  try {
    // Only students and alumni can view their applications
    if (req.user.role === 'employer' || req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Employers and admins do not have job applications'
      });
    }

    const applications = await Application.find({ applicantId: req.user.id })
      .populate('jobId', 'title company location type salary isActive')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get applications for employer's jobs
// @route   GET /api/applications/employer
// @access  Private (Employer/Admin only)
export const getEmployerApplications = async (req, res) => {
  try {
    // Only employers and admins can view applications
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only employers and admins can view job applications'
      });
    }

    const applications = await Application.find({ employerId: req.user.id })
      .populate('jobId', 'title company')
      .populate('applicantId', 'firstName lastName email profile')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Applicant only)
export const withdrawApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    
    const application = await Application.findById(applicationId)
      .populate('jobId', 'title company');

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

    // Update job applications count
    const job = await Job.findById(application.jobId._id);
    if (job) {
      await job.updateApplicationsCount();
    }

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during application withdrawal',
      error: error.message
    });
  }
};
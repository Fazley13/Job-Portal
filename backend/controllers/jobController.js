import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      type,
      experience,
      salary,
      company,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build filter object - only show active jobs
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (experience) {
      filter.experience = { $regex: experience, $options: 'i' };
    }

    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    if (salary) {
      const [min, max] = salary.split('-');
      if (min && max) {
        filter['salary.min'] = { $gte: parseInt(min) };
        filter['salary.max'] = { $lte: parseInt(max) };
      }
    }

    // Execute query with pagination
    const jobs = await Job.find(filter)
      .populate('employerId', 'firstName lastName profile.company')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'firstName lastName profile.company profile.website');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer/Admin)
export const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employerId: req.user.id,
      isActive: true // All jobs are active by default now
    };

    const job = await Job.create(jobData);

    // Populate the job with employer info
    await job.populate('employerId', 'firstName lastName profile.company');

    // Emit real-time notification to all connected users about new job
    if (req.io) {
      req.io.emit('newJobPosted', {
        jobId: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary,
        postedAt: job.createdAt
      });
    }

    res.status(201).json({
      success: true,
      job,
      message: 'Job posted successfully!'
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during job creation',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer/Admin)
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during job update',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer/Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during job deletion',
      error: error.message
    });
  }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/my
// @access  Private (Employer)
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get job analytics for employer
// @route   GET /api/jobs/:id/analytics
// @access  Private (Employer/Admin)
export const getJobAnalytics = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this job'
      });
    }

    // Get application statistics
    const applications = await Application.find({ jobId: req.params.id });
    
    const analytics = {
      totalApplications: applications.length,
      statusBreakdown: {
        pending: applications.filter(app => app.status === 'pending').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        appointed: applications.filter(app => app.status === 'appointed').length,
        rejected: applications.filter(app => app.status === 'rejected').length
      },
      applicationTrend: [], // Could be implemented with daily/weekly counts
      topSkills: [], // Could be extracted from applications
      averageExperience: 0 // Could be calculated from applicant profiles
    };

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
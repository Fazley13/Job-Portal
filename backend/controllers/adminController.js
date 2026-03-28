import User from '../models/user.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Event from '../models/Event.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    // Get user counts by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const totalEvents=  await  Event.countDocuments();
   

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get application status breakdown
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate success rate (appointed / total applications)
    const appointedApplications = await Application.countDocuments({ status: 'appointed' });
    const successRate = totalApplications > 0 ? ((appointedApplications / totalApplications) * 100).toFixed(1) : 0;

    const stats = {
      users: {
        total: userStats.reduce((sum, stat) => sum + stat.count, 0),
        breakdown: userStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        recentRegistrations: recentUsers
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        inactive: totalJobs - activeJobs
      },
      events: {
        total: totalEvents // Simple count only
      },
      applications: {
        total: totalApplications,
        breakdown: applicationStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        successRate: parseFloat(successRate)
      },
      systemHealth: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isActive,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Execute query with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all jobs for admin review
// @route   GET /api/admin/jobs
// @access  Private (Admin)
export const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.isActive = status === 'active';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const jobs = await Job.find(filter)
      .populate('employerId', 'firstName lastName email profile.company')
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
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

//changes event fix 18 aug
export const getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type ,
      search,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    // Text search
    if (search) {
     filter.$or = [
       { title: { $regex: search, $options: 'i' } },
       { description: { $regex: search, $options: 'i' } },
       { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
       .sort('-createdAt')
         .limit(limit * 1)
         .skip((page - 1) * limit)
         .populate('postedBy', 'firstName lastName'),
      Event.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      events
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Update job status (approve/reject)
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin)
export const updateJobStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const jobId = req.params.id;

    const job = await Job.findByIdAndUpdate(
      jobId,
      { isActive },
      { new: true, runValidators: true }
    ).populate('employerId', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Emit real-time notification to employer
    const employerSocketId = req.connectedUsers[job.employerId._id];
    if (employerSocketId) {
      req.io.to(employerSocketId).emit('jobStatusUpdate', {
        jobId: job._id,
        title: job.title,
        status: isActive ? 'approved' : 'rejected',
        updatedAt: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: `Job ${isActive ? 'approved' : 'rejected'} successfully`,
      job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent activities for admin dashboard
// @route   GET /api/admin/activities
// @access  Private (Admin)
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent user registrations
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent job postings
    const recentJobs = await Job.find()
      .select('title company employerId createdAt')
      .populate('employerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent applications
    const recentApplications = await Application.find()
      .select('jobId applicantId status appliedAt')
      .populate('jobId', 'title company')
      .populate('applicantId', 'firstName lastName')
      .sort({ appliedAt: -1 })
      .limit(5);

    const activities = [
      ...recentUsers.map(user => ({
        type: 'user_registration',
        message: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt,
        data: user
      })),
      ...recentJobs.map(job => ({
        type: 'job_posting',
        message: `New job posted: ${job.title} by ${job.employerId.firstName} ${job.employerId.lastName}`,
        timestamp: job.createdAt,
        data: job
      })),
      ...recentApplications.map(app => ({
        type: 'job_application',
        message: `${app.applicantId.firstName} ${app.applicantId.lastName} applied for ${app.jobId.title}`,
        timestamp: app.appliedAt,
        data: app
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
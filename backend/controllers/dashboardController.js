import User from "../models/user.js"
import Job from "../models/Job.js"
import Application from "../models/Application.js"

// @desc    Get student dashboard stats
// @route   GET /api/dashboard/student/stats
// @access  Private (Student)
export const getStudentStats = async (req, res) => {
  try {
    const userId = req.user.id

    // Get applications count
    const applicationsCount = await Application.countDocuments({
      applicantId: userId,
    })

    // Get applications this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const recentApplications = await Application.countDocuments({
      applicantId: userId,
      appliedAt: { $gte: weekAgo },
    })

    // Get profile views (you'd implement this based on your analytics)
    const profileViews = await User.findById(userId).select("profileViews")

    // Get career progress from roadmaps
    const UserRoadmap = await import("../models/UserRoadmap.js").then((m) => m.default)
    const roadmaps = await UserRoadmap.find({ userId })

    const skillsCompleted = roadmaps.reduce((sum, roadmap) => {
      return sum + (roadmap.completedPhases?.length || 0)
    }, 0)

    const careerScore =
      roadmaps.length > 0
        ? Math.round(roadmaps.reduce((sum, roadmap) => sum + (roadmap.totalProgress || 0), 0) / roadmaps.length)
        : 0

    res.status(200).json({
      success: true,
      stats: {
        applicationsSent: applicationsCount,
        recentApplications,
        profileViews: profileViews?.profileViews || 0,
        skillsCompleted,
        careerScore,
      },
    })
  } catch (error) {
    console.error("Get student stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch student stats",
      error: error.message,
    })
  }
}

// @desc    Get employer dashboard stats
// @route   GET /api/dashboard/employer/stats
// @access  Private (Employer)
export const getEmployerStats = async (req, res) => {
  try {
    const userId = req.user.id

    // Get active job posts
    const activeJobs = await Job.countDocuments({
      createdBy: userId,
      isActive: true,
    })

    // Get total applications for employer's jobs
    const employerJobs = await Job.find({ createdBy: userId }).select("_id")
    const jobIds = employerJobs.map((job) => job._id)

    const totalApplications = await Application.countDocuments({
      jobId: { $in: jobIds },
    })

    // Get applications this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const recentApplications = await Application.countDocuments({
      jobId: { $in: jobIds },
      appliedAt: { $gte: weekAgo },
    })

    // Calculate hire success rate
    const appointedCount = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: "appointed",
    })

    const hireSuccessRate = totalApplications > 0 ? Math.round((appointedCount / totalApplications) * 100) : 0

    // Get profile views (implement based on your analytics)
    const profileViews = Math.floor(Math.random() * 1000) + 500 // Replace with real analytics

    res.status(200).json({
      success: true,
      stats: {
        activeJobPosts: activeJobs,
        totalApplications,
        recentApplications,
        hireSuccessRate,
        profileViews,
      },
    })
  } catch (error) {
    console.error("Get employer stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch employer stats",
      error: error.message,
    })
  }
}

// @desc    Get employer hiring pipeline
// @route   GET /api/dashboard/employer/pipeline
// @access  Private (Employer)
export const getEmployerPipeline = async (req, res) => {
  try {
    const userId = req.user.id

    // Get employer's jobs
    const employerJobs = await Job.find({ createdBy: userId }).select("_id")
    const jobIds = employerJobs.map((job) => job._id)

    // Get pipeline stats
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [newApplications, underReview, shortlisted, appointed] = await Promise.all([
      Application.countDocuments({
        jobId: { $in: jobIds },
        appliedAt: { $gte: weekAgo },
        status: "pending",
      }),
      Application.countDocuments({
        jobId: { $in: jobIds },
        status: "pending",
        appliedAt: { $lt: weekAgo },
      }),
      Application.countDocuments({
        jobId: { $in: jobIds },
        status: "shortlisted",
      }),
      Application.countDocuments({
        jobId: { $in: jobIds },
        status: "appointed",
      }),
    ])

    res.status(200).json({
      success: true,
      pipeline: {
        newApplications,
        underReview,
        interviewsScheduled: Math.floor(shortlisted * 0.7), // Estimate
        offersExtended: appointed,
      },
    })
  } catch (error) {
    console.error("Get employer pipeline error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch hiring pipeline",
      error: error.message,
    })
  }
}

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    // Get user counts by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])

    const userBreakdown = {
      student: 0,
      alumni: 0,
      employer: 0,
      admin: 0,
    }

    userStats.forEach((stat) => {
      userBreakdown[stat._id] = stat.count
    })

    const totalUsers = Object.values(userBreakdown).reduce((sum, count) => sum + count, 0)

    // Get recent registrations (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: weekAgo },
    })

    // Get job stats
    const [activeJobs, inactiveJobs] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: false }),
    ])

    // Get application stats
    const totalApplications = await Application.countDocuments()

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          breakdown: userBreakdown,
          recentRegistrations,
        },
        jobs: {
          active: activeJobs,
          inactive: inactiveJobs,
        },
        applications: {
          total: totalApplications,
        },
      },
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      error: error.message,
    })
  }
}

// @desc    Get recent activities
// @route   GET /api/admin/activities/recent
// @access  Private (Admin)
export const getRecentActivities = async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 10

    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("firstName lastName role createdAt")

    // Get recent job postings
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "firstName lastName")
      .select("title createdBy createdAt")

    // Get recent applications
    const recentApplications = await Application.find()
      .sort({ appliedAt: -1 })
      .limit(limit)
      .populate("applicantId", "firstName lastName")
      .populate("jobId", "title")
      .select("applicantId jobId appliedAt")

    // Combine and format activities
    const activities = []

    recentUsers.forEach((user) => {
      activities.push({
        type: "user_registration",
        message: `New ${user.role} registered`,
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        timestamp: user.createdAt,
      })
    })

    recentJobs.forEach((job) => {
      activities.push({
        type: "job_posting",
        message: `New job posted: ${job.title}`,
        data: {
          firstName: job.createdBy.firstName,
          lastName: job.createdBy.lastName,
          jobTitle: job.title,
        },
        timestamp: job.createdAt,
      })
    })

    recentApplications.forEach((app) => {
      activities.push({
        type: "job_application",
        message: `Application submitted for ${app.jobId.title}`,
        data: {
          firstName: app.applicantId.firstName,
          lastName: app.applicantId.lastName,
          jobTitle: app.jobId.title,
        },
        timestamp: app.appliedAt,
      })
    })

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    const limitedActivities = activities.slice(0, limit)

    res.status(200).json({
      success: true,
      activities: limitedActivities,
    })
  } catch (error) {
    console.error("Get recent activities error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
      error: error.message,
    })
  }
}

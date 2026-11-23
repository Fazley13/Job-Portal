import mongoose from 'mongoose';
import MentorshipProgram from '../models/Mentorship.js';
import MentorshipSession from '../models/MentorshipSession.js';

// @route GET /api/alumni/dashboard/:alumniId?  (kept for backward compatibility)
export const getAlumniDashboardData = async (req, res) => {
  try {
    const alumniId = req.params.alumniId || req.user.id;
    if (req.user.role !== 'admin' && String(alumniId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const id = new mongoose.Types.ObjectId(alumniId);
    const programs = await MentorshipProgram.find({ alumniId: id }).select('enrolledStudents').lean();
    const studentsMentored = new Set(
      programs.flatMap((p) => (p.enrolledStudents || []).map((s) => String(s.studentId)))
    ).size;
    const rating = await MentorshipSession.aggregate([
      { $match: { alumniId: id, 'feedback.fromStudent.rating': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$feedback.fromStudent.rating' } } },
    ]);
    const upcomingSessions = await MentorshipSession.find({
      alumniId: id,
      status: 'scheduled',
      scheduledDate: { $gte: new Date() },
    })
      .sort({ scheduledDate: 1 })
      .limit(3)
      .lean();
    res.json({
      success: true,
      studentsMentored,
      averageRating: rating[0] ? rating[0].avg.toFixed(1) : '0',
      upcomingSessions,
      successStories: [],
    });
  } catch (error) {
    console.error('Alumni dashboard error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
};

import mongoose from 'mongoose';
import User from '../models/user.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import CompanyApplication from '../models/CompanyApplication.js';
import Company from '../models/Company.js';
import Event from '../models/Event.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import MentorshipProgram from '../models/Mentorship.js';
import MentorshipSession from '../models/MentorshipSession.js';
import UserRoadmapProgress from '../models/UserRoadmapProgress.js';

const oid = (id) => new mongoose.Types.ObjectId(String(id));

const statusBreakdown = (rows) =>
  rows.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});

const upcomingEvents = (limit = 3) =>
  Event.find({ startDateTime: { $gte: new Date() } })
    .sort({ startDateTime: 1 })
    .limit(limit)
    .select('title type startDateTime isOnline location organizer')
    .lean();

const studentSummary = async (user) => {
  const id = oid(user._id);
  const [apps, companyApps, followers, following, posts, roadmaps, program, events, jobs] = await Promise.all([
    Application.aggregate([{ $match: { applicantId: id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    CompanyApplication.countDocuments({ applicantId: id }),
    Follow.countDocuments({ following: id }),
    Follow.countDocuments({ follower: id }),
    Post.countDocuments({ author: id, isActive: { $ne: false } }),
    UserRoadmapProgress.find({ userId: id }).populate('roadmapId', 'title').lean(),
    MentorshipProgram.findOne({ 'enrolledStudents.studentId': id, 'enrolledStudents.status': 'active' })
      .select('title enrolledStudents')
      .lean(),
    upcomingEvents(),
    Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).select('title company location type createdAt').lean(),
  ]);
  const breakdown = statusBreakdown(apps);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const enrollment = program?.enrolledStudents?.find((s) => String(s.studentId) === String(user._id));
  return {
    applications: { total, ...breakdown },
    companyApplications: companyApps,
    followers,
    following,
    posts,
    roadmaps: {
      started: roadmaps.length,
      completed: roadmaps.filter((r) => r.isCompleted).length,
      items: roadmaps.slice(0, 3).map((r) => ({
        id: r.roadmapId?._id,
        title: r.roadmapId?.title || 'Roadmap',
        skillsDone: r.completedSkills?.length || 0,
      })),
    },
    mentorship: program ? { title: program.title, progress: enrollment?.progress || 0 } : null,
    events,
    jobs,
    profileCompleteness: profileScore(user),
  };
};

const alumniSummary = async (user) => {
  const id = oid(user._id);
  const [programs, sessions, followers, following, posts, events, ratings] = await Promise.all([
    MentorshipProgram.find({ alumniId: id }).select('title isActive maxStudents enrolledStudents').lean(),
    MentorshipSession.find({ alumniId: id, status: 'scheduled', scheduledDate: { $gte: new Date() } })
      .sort({ scheduledDate: 1 })
      .limit(4)
      .populate('studentId', 'firstName lastName')
      .select('title scheduledDate duration meetingLink studentId')
      .lean(),
    Follow.countDocuments({ following: id }),
    Follow.countDocuments({ follower: id }),
    Post.countDocuments({ author: id, isActive: { $ne: false } }),
    upcomingEvents(),
    MentorshipSession.aggregate([
      { $match: { alumniId: id, 'feedback.fromStudent.rating': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$feedback.fromStudent.rating' }, count: { $sum: 1 } } },
    ]),
  ]);
  const activeMentees = programs.reduce(
    (sum, p) => sum + (p.enrolledStudents || []).filter((s) => s.status === 'active').length,
    0
  );
  return {
    programs: {
      total: programs.length,
      active: programs.filter((p) => p.isActive).length,
      items: programs.slice(0, 4).map((p) => ({
        _id: p._id,
        title: p.title,
        enrolled: (p.enrolledStudents || []).filter((s) => s.status === 'active').length,
        capacity: p.maxStudents,
      })),
    },
    activeMentees,
    upcomingSessions: sessions,
    averageRating: ratings[0] ? Number(ratings[0].avg.toFixed(1)) : null,
    ratingCount: ratings[0]?.count || 0,
    followers,
    following,
    posts,
    events,
    profileCompleteness: profileScore(user),
  };
};

const employerSummary = async (user) => {
  const id = oid(user._id);
  const [jobs, activeJobs, apps, companies, events, recent, topJobs] = await Promise.all([
    Job.countDocuments({ employerId: id }),
    Job.countDocuments({ employerId: id, isActive: true }),
    Application.aggregate([{ $match: { employerId: id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Company.countDocuments({ createdBy: id }),
    Event.countDocuments({ postedBy: id }),
    Application.find({ employerId: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('applicantId', 'firstName lastName')
      .populate('jobId', 'title')
      .select('status appliedAt applicantId jobId')
      .lean(),
    Job.find({ employerId: id }).sort({ applicationsCount: -1 }).limit(4).select('title applicationsCount isActive').lean(),
  ]);
  const breakdown = statusBreakdown(apps);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const hireRate = total ? Math.round(((breakdown.appointed || 0) / total) * 100) : 0;
  return {
    jobs: { total: jobs, active: activeJobs },
    applications: { total, ...breakdown },
    companies,
    events,
    hireRate,
    recentApplications: recent,
    topJobs,
  };
};

const adminSummary = async () => {
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const [roles, newUsers, jobs, activeJobs, apps, companies, events, programs, pendingUsers, recentUsers] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true }),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Company.countDocuments(),
    Event.countDocuments(),
    MentorshipProgram.countDocuments(),
    User.countDocuments({ isActive: false }),
    User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName role createdAt isActive').lean(),
  ]);
  const roleMap = statusBreakdown(roles);
  const appMap = statusBreakdown(apps);
  return {
    users: { total: Object.values(roleMap).reduce((a, b) => a + b, 0), byRole: roleMap, newThisWeek: newUsers, deactivated: pendingUsers },
    jobs: { total: jobs, active: activeJobs },
    applications: { total: Object.values(appMap).reduce((a, b) => a + b, 0), ...appMap },
    companies,
    events,
    mentorshipPrograms: programs,
    recentUsers,
  };
};

function profileScore(user) {
  const p = user.profile || {};
  const checks = [p.avatar, p.bio, p.skills?.length, p.location, p.linkedin || p.github || p.website];
  if (user.role === 'student' || user.role === 'alumni') checks.push(p.university, p.graduationYear);
  if (user.role === 'employer') checks.push(p.company, p.position);
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

// @route GET /api/dashboard/summary  (role-aware)
export const getDashboardSummary = async (req, res) => {
  try {
    const { role } = req.user;
    let data;
    if (role === 'student') data = await studentSummary(req.user);
    else if (role === 'alumni') data = await alumniSummary(req.user);
    else if (role === 'employer') data = await employerSummary(req.user);
    else if (role === 'admin') data = await adminSummary();
    else return res.status(403).json({ success: false, message: 'Unsupported role' });
    res.json({ success: true, role, summary: data });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
};

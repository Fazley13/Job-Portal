import Mentorship from '../models/Mentorship.js';
import Session from '../models/Session.js';
import SuccessStory from '../models/SuccessStory.js';

export const getAlumniDashboardData = async (req, res) => {
  const { alumniId } = req.params;
  try {
    const studentsMentored = await Mentorship.countDocuments({ mentor: alumniId });

    const ratingResult = await Mentorship.aggregate([
      { $match: { mentor: new mongoose.Types.ObjectId(alumniId), rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const averageRating = ratingResult[0]?.avg?.toFixed(1) || '0';

    const upcomingSessions = await Session.find({ mentor: alumniId }).sort({ date: 1 }).limit(3);
    const successStories = await SuccessStory.find({ mentor: alumniId }).sort({ createdAt: -1 }).limit(3);

    res.json({
      studentsMentored,
      averageRating,
      upcomingSessions,
      successStories,
    });
  } catch (error) {
    console.error('Alumni dashboard error:', error.message);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

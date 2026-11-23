import fs from 'fs';
import path from 'path';
import multer from 'multer';
import User from '../models/user.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import CV from '../models/CV.js';

const escapeRegex = (str = '') => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route GET /api/users/:userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!/^[a-f\d]{24}$/i.test(userId)) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = await User.findById(userId).select('-password').lean();

    if (!user || user.isActive === false) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [followersCount, followingCount, postsCount, isFollowing, cv] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
      Post.countDocuments({ author: userId, isActive: { $ne: false } }),
      Follow.exists({ follower: req.user.id, following: userId }),
      CV.findOne({ user: userId, isActive: true }).select('visibility').lean(),
    ]);

    res.status(200).json({
      success: true,
      user: { ...user, followersCount, followingCount, postsCount, isFollowing: !!isFollowing, hasCV: !!cv },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/users/search?q=&role=&university=&company=
export const searchUsers = async (req, res) => {
  try {
    const { q = '', keyword = '', role, university, company } = req.query;
    const term = String(q || keyword).trim();
    const filter = { isActive: { $ne: false }, _id: { $ne: req.user._id } };

    if (term) {
      const rx = new RegExp(escapeRegex(term), 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { 'profile.skills': rx }, { 'profile.company': rx }, { 'profile.position': rx }];
    }
    if (role && ['student', 'alumni', 'employer'].includes(role)) filter.role = role;
    if (university) filter['profile.university'] = new RegExp(escapeRegex(university), 'i');
    if (company) filter['profile.company'] = new RegExp(escapeRegex(company), 'i');

    const users = await User.find(filter).select('-password -email').limit(30).sort({ createdAt: -1 }).lean();
    const followed = await Follow.find({ follower: req.user.id, following: { $in: users.map((u) => u._id) } }).select('following').lean();
    const followedSet = new Set(followed.map((f) => String(f.following)));

    res.status(200).json({
      success: true,
      users: users.map((u) => ({ ...u, isFollowing: followedSet.has(String(u._id)) })),
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/users/stats
export const getUserStats = async (req, res) => {
  try {
    const [totalUsers, students, alumni, employers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'employer' }),
    ]);
    res.status(200).json({ success: true, totalUsers, students, alumni, employers });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---- Avatar upload ----------------------------------------------------------
const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });

export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${req.user.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, GIF and WEBP images are allowed'));
  },
});

const removeOldAvatar = (url) => {
  if (!url || !url.includes('/uploads/avatars/')) return;
  const file = path.join(avatarDir, path.basename(url));
  fs.promises.unlink(file).catch(() => {});
};

// @route POST /api/users/avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    removeOldAvatar(req.user.profile?.avatar);
    await User.findByIdAndUpdate(req.user.id, { $set: { 'profile.avatar': avatarUrl } });
    res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Could not upload profile picture' });
  }
};

// @route DELETE /api/users/avatar
export const deleteAvatar = async (req, res) => {
  try {
    removeOldAvatar(req.user.profile?.avatar);
    await User.findByIdAndUpdate(req.user.id, { $unset: { 'profile.avatar': 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ success: false, message: 'Could not remove profile picture' });
  }
};

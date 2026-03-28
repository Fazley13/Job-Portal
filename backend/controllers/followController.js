import Follow from '../models/Follow.js';
import User from '../models/user.js';

// @desc    Follow a user
// @route   POST /api/follow/:userId
// @access  Private
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Can't follow yourself
    if (userId === followerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Create follow relationship
    await Follow.create({
      follower: followerId,
      following: userId
    });

    // Emit real-time notification
    if (req.io && req.connectedUsers) {
      const userSocketId = req.connectedUsers[userId];
      if (userSocketId) {
        req.io.to(userSocketId).emit('newFollower', {
          followerId,
          followerName: `${req.user.firstName} ${req.user.lastName}`,
          followerRole: req.user.role,
          followedAt: new Date().toISOString()
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/follow/:userId
// @access  Private
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/follow/:userId/followers
// @access  Private
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'firstName lastName profile role')
      .sort({ followedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Follow.countDocuments({ following: userId });

    res.status(200).json({
      success: true,
      followers: followers.map(f => f.follower),
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get users that user is following
// @route   GET /api/follow/:userId/following
// @access  Private
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'firstName lastName profile role')
      .sort({ followedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Follow.countDocuments({ follower: userId });

    res.status(200).json({
      success: true,
      following: following.map(f => f.following),
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check if user is following another user
// @route   GET /api/follow/:userId/status
// @access  Private
export const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const isFollowing = await Follow.exists({
      follower: followerId,
      following: userId
    });

    res.status(200).json({
      success: true,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get suggested users to follow
// @route   GET /api/follow/suggestions
// @access  Private
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get users that current user is already following
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following.toString());
    followingIds.push(userId); // Exclude self

    // Find users with similar roles or from same university/company
    let suggestions = [];

    if (req.user.role === 'student') {
      // Suggest alumni from same university and other students
      suggestions = await User.find({
        _id: { $nin: followingIds },
        $or: [
          { 
            role: 'alumni',
            'profile.university': req.user.profile?.university 
          },
          { 
            role: 'student',
            'profile.university': req.user.profile?.university 
          },
          { role: 'employer' }
        ]
      }).select('firstName lastName profile role').limit(limit);
    } else if (req.user.role === 'alumni') {
      // Suggest students from same university and other alumni
      suggestions = await User.find({
        _id: { $nin: followingIds },
        $or: [
          { 
            role: 'student',
            'profile.university': req.user.profile?.university 
          },
          { 
            role: 'alumni',
            'profile.university': req.user.profile?.university 
          },
          { role: 'employer' }
        ]
      }).select('firstName lastName profile role').limit(limit);
    } else if (req.user.role === 'employer') {
      // Suggest students and alumni
      suggestions = await User.find({
        _id: { $nin: followingIds },
        role: { $in: ['student', 'alumni'] }
      }).select('firstName lastName profile role').limit(limit);
    }

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
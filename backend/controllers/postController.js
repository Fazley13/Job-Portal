import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import User from '../models/user.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (Students/Alumni/Employers)
export const createPost = async (req, res) => {
  try {
    const { content, type, tags, visibility, attachments } = req.body;

    const post = await Post.create({
      author: req.user.id,
      content,
      type: type || 'text',
      tags: tags || [],
      visibility: visibility || 'public',
      attachments: attachments || []
    });

    await post.populate('author', 'firstName lastName profile.avatar role');

    // Emit real-time notification to followers
    if (req.io && req.connectedUsers) {
      const followers = await Follow.find({ following: req.user.id }).populate('follower');
      
      followers.forEach(follow => {
        const followerSocketId = req.connectedUsers[follow.follower._id];
        if (followerSocketId) {
          req.io.to(followerSocketId).emit('newPost', {
            postId: post._id,
            authorName: `${req.user.firstName} ${req.user.lastName}`,
            content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            type: post.type,
            createdAt: post.createdAt
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      post,
      message: 'Post created successfully!'
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during post creation',
      error: error.message
    });
  }
};

// @desc    Get feed posts for user
// @route   GET /api/posts/feed
// @access  Private
export const getFeedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Get users that current user follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);
    
    // Include user's own posts
    followingIds.push(userId);

    // Build query based on user role
    let postQuery = {
      author: { $in: followingIds },
      isActive: true
    };

    // If user is employer, also show job-related posts from everyone
    if (req.user.role === 'employer') {
      postQuery = {
        $or: [
          { author: { $in: followingIds }, isActive: true },
          { type: 'job_update', visibility: 'public', isActive: true }
        ]
      };
    }

    const posts = await Post.find(postQuery)
      .populate('author', 'firstName lastName profile role')
      .populate('comments.user', 'firstName lastName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(postQuery);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Private
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ 
      author: userId, 
      isActive: true 
    })
      .populate('author', 'firstName lastName profile role')
      .populate('comments.user', 'firstName lastName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({ author: userId, isActive: true });

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(like => like.user.toString() === userId);

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      // Like
      post.likes.push({ user: userId });
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !existingLike,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: userId,
      content: content.trim()
    });

    await post.save();
    await post.populate('comments.user', 'firstName lastName profile.avatar');

    res.status(201).json({
      success: true,
      comment: post.comments[post.comments.length - 1],
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Private
export const searchPosts = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = {
      $and: [
        { isActive: true },
        { visibility: 'public' },
        {
          $or: [
            { content: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    };

    if (type) {
      searchQuery.$and.push({ type });
    }

    const posts = await Post.find(searchQuery)
      .populate('author', 'firstName lastName profile role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
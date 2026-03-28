import CV from '../models/CV.js';
import User from '../models/user.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/cvs';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cv-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Upload CV
// @route   POST /api/cv/upload
// @access  Private (Students/Alumni only)
export const uploadCV = async (req, res) => {
  try {
    // Check if user can upload CV
    if (req.user.role !== 'student' && req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only students and alumni can upload CVs'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { visibility = 'followers' } = req.body;

    // Deactivate previous CVs
    await CV.updateMany(
      { user: req.user.id },
      { isActive: false }
    );

    // Create new CV record
    const cv = await CV.create({
      user: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/cvs/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      visibility
    });

    res.status(201).json({
      success: true,
      cv,
      message: 'CV uploaded successfully!'
    });
  } catch (error) {
    console.error('Upload CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during CV upload',
      error: error.message
    });
  }
};

// @desc    Get user's CV
// @route   GET /api/cv/my
// @access  Private
export const getMyCV = async (req, res) => {
  try {
    const cv = await CV.findOne({
      user: req.user.id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      cv
    });
  } catch (error) {
    console.error('Get my CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's CV by user ID
// @route   GET /api/cv/user/:userId
// @access  Private
export const getUserCV = async (req, res) => {
  try {
    const { userId } = req.params;

    const cv = await CV.findOne({
      user: userId,
      isActive: true
    }).populate('user', 'firstName lastName role');

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Check visibility permissions
    if (cv.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'CV is private'
      });
    }

    // If visibility is 'followers', check if current user follows the CV owner
    if (cv.visibility === 'followers' && userId !== req.user.id) {
      const Follow = (await import('../models/Follow.js')).default;
      const isFollowing = await Follow.exists({
        follower: req.user.id,
        following: userId
      });

      if (!isFollowing) {
        return res.status(403).json({
          success: false,
          message: 'You must follow this user to view their CV'
        });
      }
    }

    res.status(200).json({
      success: true,
      cv
    });
  } catch (error) {
    console.error('Get user CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Download CV
// @route   GET /api/cv/:cvId/download
// @access  Private
export const downloadCV = async (req, res) => {
  try {
    const { cvId } = req.params;

    const cv = await CV.findById(cvId).populate('user', 'firstName lastName');

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Check permissions (same as getUserCV)
    if (cv.visibility === 'private' && cv.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'CV is private'
      });
    }

    if (cv.visibility === 'followers' && cv.user._id.toString() !== req.user.id) {
      const Follow = (await import('../models/Follow.js')).default;
      const isFollowing = await Follow.exists({
        follower: req.user.id,
        following: cv.user._id
      });

      if (!isFollowing) {
        return res.status(403).json({
          success: false,
          message: 'You must follow this user to download their CV'
        });
      }
    }

    // Increment download count
    cv.downloadCount += 1;
    await cv.save();

    const filePath = path.join(process.cwd(), 'uploads', 'cvs', cv.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath, cv.originalName);
  } catch (error) {
    console.error('Download CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update CV visibility
// @route   PUT /api/cv/:cvId/visibility
// @access  Private
export const updateCVVisibility = async (req, res) => {
  try {
    const { cvId } = req.params;
    const { visibility } = req.body;

    if (!['public', 'followers', 'private'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visibility option'
      });
    }

    const cv = await CV.findOne({
      _id: cvId,
      user: req.user.id
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    cv.visibility = visibility;
    await cv.save();

    res.status(200).json({
      success: true,
      cv,
      message: 'CV visibility updated successfully'
    });
  } catch (error) {
    console.error('Update CV visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete CV
// @route   DELETE /api/cv/:cvId
// @access  Private
export const deleteCV = async (req, res) => {
  try {
    const { cvId } = req.params;

    const cv = await CV.findOne({
      _id: cvId,
      user: req.user.id
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'uploads', 'cvs', cv.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await cv.deleteOne();

    res.status(200).json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
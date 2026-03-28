import Roadmap from '../models/Roadmap.js';
import UserRoadmapProgress from '../models/UserRoadmapProgress.js';
import User from '../models/user.js';

// @desc    Create a new roadmap
// @route   POST /api/roadmaps
// @access  Private (Admin only)
export const createRoadmap = async (req, res) => {
  try {
    const roadmapData = {
      ...req.body,
      createdBy: req.user.id
    };

    const roadmap = await Roadmap.create(roadmapData);
    
    res.status(201).json({
      success: true,
      roadmap,
      message: 'Roadmap created successfully!'
    });
  } catch (error) {
    console.error('Create roadmap error:', error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' 
        ? Object.values(error.errors).map(val => val.message).join(', ')
        : 'Server error during roadmap creation',
      error: error.message
    });
  }
};

// @desc    Get all roadmaps with filters
// @route   GET /api/roadmaps
// @access  Public
export const getRoadmaps = async (req, res) => {
  try {
    const {
      search,
      category,
      difficulty,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const filter = { isActive: true };

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filters
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const [roadmaps, total] = await Promise.all([
      Roadmap.find(filter)
        .populate('createdBy', 'firstName lastName')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit),
      Roadmap.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: roadmaps.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      roadmaps
    });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single roadmap
// @route   GET /api/roadmaps/:id
// @access  Public
export const getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Increment popularity counter
    roadmap.popularity += 1;
    await roadmap.save();

    res.status(200).json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update roadmap
// @route   PUT /api/roadmaps/:id
// @access  Private (Admin only)
export const updateRoadmap = async (req, res) => {
  try {
    let roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && roadmap.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this roadmap'
      });
    }

    roadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Update roadmap error:', error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' 
        ? Object.values(error.errors).map(val => val.message).join(', ')
        : 'Server error during roadmap update',
      error: error.message
    });
  }
};

// @desc    Delete roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private (Admin only)
export const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && roadmap.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this roadmap'
      });
    }

    await roadmap.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Roadmap deleted successfully'
    });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during roadmap deletion',
      error: error.message
    });
  }
};

// @desc    Start a roadmap (track progress)
// @route   POST /api/roadmaps/:id/start
// @access  Private
export const startRoadmap = async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;

    // Check if roadmap exists
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Check if user already started this roadmap
    let progress = await UserRoadmapProgress.findOne({ userId, roadmapId });
    
    if (progress) {
      return res.status(400).json({
        success: false,
        message: 'You have already started this roadmap',
        progress
      });
    }

    // Create new progress record
    progress = await UserRoadmapProgress.create({
      userId,
      roadmapId,
      completedPhases: [],
      completedSkills: [],
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
      isCompleted: false
    });

    // Update roadmap stats
    roadmap.totalStudents += 1;
    await roadmap.save();

    res.status(201).json({
      success: true,
      progress,
      message: 'Roadmap started successfully!'
    });
  } catch (error) {
    console.error('Start roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's progress on a roadmap
// @route   GET /api/roadmaps/:id/progress
// @access  Private
export const getRoadmapProgress = async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;

    const progress = await UserRoadmapProgress.findOne({ userId, roadmapId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this roadmap'
      });
    }

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get roadmap progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark a skill as completed
// @route   POST /api/roadmaps/:id/complete-skill
// @access  Private
export const completeSkill = async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;
    const { phaseIndex, skillIndex } = req.body;

    // Validate indices
    if (phaseIndex === undefined || skillIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Phase index and skill index are required'
      });
    }

    // Check if roadmap exists and get phase/skill info
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Validate phase and skill indices
    if (
      phaseIndex < 0 || 
      phaseIndex >= roadmap.phases.length || 
      skillIndex < 0 || 
      skillIndex >= roadmap.phases[phaseIndex].skills.length
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phase or skill index'
      });
    }

    // Get or create progress record
    let progress = await UserRoadmapProgress.findOne({ userId, roadmapId });
    
    if (!progress) {
      progress = await UserRoadmapProgress.create({
        userId,
        roadmapId,
        completedPhases: [],
        completedSkills: [],
        startedAt: new Date(),
        lastUpdatedAt: new Date(),
        isCompleted: false
      });

      // Update roadmap stats
      roadmap.totalStudents += 1;
      await roadmap.save();
    }

    // Mark skill as completed
    const skillId = `${phaseIndex}-${skillIndex}`;
    if (!progress.completedSkills.includes(skillId)) {
      progress.completedSkills.push(skillId);
    }

    // Check if all skills in the phase are completed
    const phaseSkills = roadmap.phases[phaseIndex].skills;
    const allPhaseSkillsCompleted = phaseSkills.every((_, idx) => 
      progress.completedSkills.includes(`${phaseIndex}-${idx}`)
    );

    // Mark phase as completed if all skills are done
    if (allPhaseSkillsCompleted && !progress.completedPhases.includes(phaseIndex.toString())) {
      progress.completedPhases.push(phaseIndex.toString());
    }

    // Check if all phases are completed
    const allPhasesCompleted = roadmap.phases.every((_, idx) => 
      progress.completedPhases.includes(idx.toString())
    );

    if (allPhasesCompleted) {
      progress.isCompleted = true;
    }

    progress.lastUpdatedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      progress,
      message: 'Skill marked as completed'
    });
  } catch (error) {
    console.error('Complete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Rate a roadmap
// @route   POST /api/roadmaps/:id/rate
// @access  Private
export const rateRoadmap = async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;
    const { rating, feedback } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user has started the roadmap
    const progress = await UserRoadmapProgress.findOne({ userId, roadmapId });
    
    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'You must start the roadmap before rating it'
      });
    }

    // Update progress with rating
    progress.rating = rating;
    if (feedback) progress.feedback = feedback;
    await progress.save();

    // Update roadmap average rating
    const roadmap = await Roadmap.findById(roadmapId);
    
    // Get all ratings for this roadmap
    const allRatings = await UserRoadmapProgress.find({ 
      roadmapId, 
      rating: { $exists: true } 
    });
    
    const totalRating = allRatings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / allRatings.length;
    
    roadmap.averageRating = parseFloat(averageRating.toFixed(1));
    await roadmap.save();

    res.status(200).json({
      success: true,
      message: 'Roadmap rated successfully',
      rating,
      averageRating: roadmap.averageRating
    });
  } catch (error) {
    console.error('Rate roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get popular roadmaps
// @route   GET /api/roadmaps/popular
// @access  Public
export const getPopularRoadmaps = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const roadmaps = await Roadmap.find({ isActive: true })
      .sort({ popularity: -1, totalStudents: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      count: roadmaps.length,
      roadmaps
    });
  } catch (error) {
    console.error('Get popular roadmaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's roadmaps (in progress or completed)
// @route   GET /api/roadmaps/my
// @access  Private
export const getUserRoadmaps = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userProgress = await UserRoadmapProgress.find({ userId })
      .populate({
        path: 'roadmapId',
        select: 'title description difficulty category phases',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName'
        }
      });

    res.status(200).json({
      success: true,
      count: userProgress.length,
      roadmaps: userProgress
    });
  } catch (error) {
    console.error('Get user roadmaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
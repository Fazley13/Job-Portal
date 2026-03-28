import UserRoadmapProgress from '../models/UserRoadmapProgress.js';
import Roadmap from '../models/Roadmap.js';

// @desc    Start a roadmap
// @route   POST /api/user-roadmaps/start/:roadmapId
// @access  Private (Students/Alumni only)
export const startRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;

    // Check if user is student or alumni
    if (req.user.role !== 'student' && req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only students and alumni can start roadmaps'
      });
    }

    // Check if roadmap exists
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap || !roadmap.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or inactive'
      });
    }

    // Check if user already started this roadmap
    let progress = await UserRoadmapProgress.findOne({ userId, roadmapId });
    
    if (progress) {
      return res.status(400).json({
        success: false,
        message: 'You have already started this roadmap'
      });
    }

    // Create new progress record
    progress = await UserRoadmapProgress.create({
      userId,
      roadmapId,
      isStarted: true,
      startedAt: new Date(),
      currentPhaseIndex: 0,
      completedPhases: []
    });

    await progress.populate('roadmapId', 'title description phases');

    res.status(201).json({
      success: true,
      message: 'Roadmap started successfully!',
      progress
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

// @desc    Get user's roadmap progress
// @route   GET /api/user-roadmaps/my
// @access  Private (Students/Alumni only)
export const getMyRoadmaps = async (req, res) => {
  try {
    const userId = req.user.id;

    const progressList = await UserRoadmapProgress.find({ userId })
      .populate('roadmapId', 'title description duration difficulty category tags phases')
      .sort({ lastAccessedAt: -1 });

    // Calculate progress for each roadmap
    const roadmapsWithProgress = progressList.map(progress => {
      const roadmap = progress.roadmapId;
      const totalSkills = roadmap.phases.reduce((sum, phase) => sum + (phase.skills?.length || 0), 0);
      const completedSkills = progress.completedPhases.reduce((sum, phase) => 
        sum + (phase.skills?.filter(skill => skill.completed).length || 0), 0
      );
      const calculatedProgress = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

      return {
        ...progress.toObject(),
        totalProgress: calculatedProgress
      };
    });

    res.status(200).json({
      success: true,
      count: roadmapsWithProgress.length,
      roadmaps: roadmapsWithProgress
    });
  } catch (error) {
    console.error('Get my roadmaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get specific roadmap progress
// @route   GET /api/user-roadmaps/:roadmapId
// @access  Private (Students/Alumni only)
export const getRoadmapProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;

    const progress = await UserRoadmapProgress.findOne({ userId, roadmapId })
      .populate('roadmapId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap progress not found'
      });
    }

    // Update last accessed
    progress.lastAccessedAt = new Date();
    await progress.save();

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

// @desc    Update skill completion
// @route   PUT /api/user-roadmaps/:roadmapId/skill
// @access  Private (Students/Alumni only)
export const updateSkillCompletion = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { phaseIndex, skillIndex, completed } = req.body;
    const userId = req.user.id;

    const progress = await UserRoadmapProgress.findOne({ userId, roadmapId })
      .populate('roadmapId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap progress not found'
      });
    }

    // Find or create phase progress
    let phaseProgress = progress.completedPhases.find(p => p.phaseIndex === phaseIndex);
    if (!phaseProgress) {
      phaseProgress = {
        phaseIndex,
        skills: []
      };
      progress.completedPhases.push(phaseProgress);
    }

    // Find or create skill progress
    let skillProgress = phaseProgress.skills.find(s => s.skillIndex === skillIndex);
    if (!skillProgress) {
      skillProgress = {
        skillIndex,
        completed: false
      };
      phaseProgress.skills.push(skillProgress);
    }

    // Update skill completion
    skillProgress.completed = completed;
    skillProgress.completedAt = completed ? new Date() : undefined;

    // Check if phase is completed
    const roadmapPhase = progress.roadmapId.phases[phaseIndex];
    const totalSkillsInPhase = roadmapPhase.skills.length;
    const completedSkillsInPhase = phaseProgress.skills.filter(s => s.completed).length;
    
    if (completedSkillsInPhase === totalSkillsInPhase && !phaseProgress.completedAt) {
      phaseProgress.completedAt = new Date();
      
      // Move to next phase
      if (phaseIndex + 1 < progress.roadmapId.phases.length) {
        progress.currentPhaseIndex = phaseIndex + 1;
      }
    }

    // Calculate total progress
    const totalSkills = progress.roadmapId.phases.reduce((sum, phase) => sum + phase.skills.length, 0);
    const completedSkills = progress.completedPhases.reduce((sum, phase) => 
      sum + phase.skills.filter(skill => skill.completed).length, 0
    );
    progress.totalProgress = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

    // Check if roadmap is completed
    if (progress.totalProgress === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      message: `Skill ${completed ? 'completed' : 'marked incomplete'}!`,
      progress
    });
  } catch (error) {
    console.error('Update skill completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get roadmap statistics for admin
// @route   GET /api/user-roadmaps/stats/:roadmapId
// @access  Private (Admin only)
export const getRoadmapStats = async (req, res) => {
  try {
    const { roadmapId } = req.params;

    const stats = await UserRoadmapProgress.aggregate([
      { $match: { roadmapId: mongoose.Types.ObjectId(roadmapId) } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          completedUsers: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          averageProgress: { $avg: '$totalProgress' },
          activeUsers: { $sum: { $cond: ['$isStarted', 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalUsers: 0,
      completedUsers: 0,
      averageProgress: 0,
      activeUsers: 0
    };

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Get roadmap stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
import MentorshipProgram from '../models/Mentorship.js';
import MentorshipSession from '../models/MentorshipSession.js';
import MentorshipContent from '../models/MentorshipContent.js';
import fs from 'fs';


// @desc    Create mentorship program (Alumni)
// @route   POST /api/mentorship/programs
// @access  Private (Alumni)
export const createMentorshipProgram = async (req, res) => {
  try {
    const {
      title,
      description,
      topics,
      duration,
      cost,
      maxStudents,
      requirements,
      learningOutcomes,
      schedule
    } = req.body;

    
    // ✅ NEW: Stronger validation
    if (!title || !description || !duration?.value) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and duration value are required.'
      });
    }

    // Check if user is alumni
    if (req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can create mentorship programs'
      });
    }

    const program = await MentorshipProgram.create({
      title,
      description,
      topics: Array.isArray(topics) ? topics : [topics],
      alumniId: req.user.id,
      duration,
      cost: cost || 0,
      maxStudents: maxStudents || 1,
      requirements: requirements || [],
      learningOutcomes: learningOutcomes || [],
      schedule: schedule || {}
    });

    const populatedProgram = await MentorshipProgram.findById(program._id)
      .populate('alumniId', 'firstName lastName profile');

    res.status(201).json({
      success: true,
      message: 'Mentorship program created successfully',
      program: populatedProgram
    });
  } catch (error) {
    console.error('Create mentorship program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get alumni's mentorship programs
// @route   GET /api/mentorship/programs/alumni
// @access  Private (Alumni)
export const getAlumniPrograms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { alumniId: req.user.id };
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const programs = await MentorshipProgram.find(filter)
      .populate('enrolledStudents.studentId', 'firstName lastName email profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipProgram.countDocuments(filter);

    // Calculate program statistics
    const programsWithStats = programs.map(program => {
      const activeEnrollments = program.enrolledStudents.filter(
        enrollment => enrollment.status === 'active'
      ).length;
      
      return {
        ...program.toObject(),
        activeEnrollments,
        isFull: activeEnrollments >= program.maxStudents
      };
    });

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      programs: programsWithStats
    });
  } catch (error) {
    console.error('Get alumni programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all mentorship programs for students (with search/filter)
// @route   GET /api/mentorship/programs
// @access  Private (Student)
export const getAllPrograms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      topic,
      maxCost,
      duration,
      sort = '-createdAt'
    } = req.query;

    const filter = { isActive: true };
    
    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by topic
    if (topic) {
      filter.topics = { $in: [new RegExp(topic, 'i')] };
    }

    // Filter by maximum cost
    if (maxCost) {
      filter.cost = { $lte: parseFloat(maxCost) };
    }

    // Filter by duration
    if (duration) {
      filter['duration.value'] = { $lte: parseInt(duration) };
    }

    const programs = await MentorshipProgram.find(filter)
      .populate('alumniId', 'firstName lastName profile')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipProgram.countDocuments(filter);

    // Add enrollment status for current student
    const programsWithEnrollmentStatus = programs.map(program => {
      const programObj = program.toObject();
      const isEnrolled = program.enrolledStudents.some(
        enrollment => enrollment.studentId.toString() === req.user.id && enrollment.status === 'active'
      );
      const activeEnrollments = program.enrolledStudents.filter(
        enrollment => enrollment.status === 'active'
      ).length;

      return {
        ...programObj,
        isEnrolled,
        activeEnrollments,
        availableSlots: program.maxStudents - activeEnrollments
      };
    });

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      programs: programsWithEnrollmentStatus
    });
  } catch (error) {
    console.error('Get all programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Enroll in mentorship program (Student)
// @route   POST /api/mentorship/programs/:programId/enroll
// @access  Private (Student)
export const enrollInProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can enroll in mentorship programs'
      });
    }

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if program is active
    if (!program.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This mentorship program is not active'
      });
    }

    // Check if student is already enrolled
    if (program.isStudentEnrolled(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this program'
      });
    }

    // Check if student is already enrolled in any active program
    const activeEnrollment = await MentorshipProgram.findOne({
      'enrolledStudents.studentId': req.user.id,
      'enrolledStudents.status': 'active'
    });

    if (activeEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You can only be enrolled in one mentorship program at a time'
      });
    }

    // Check if program has available slots
    if (program.isFull) {
      return res.status(400).json({
        success: false,
        message: 'This program is currently full'
      });
    }

    // Add student to enrolled students
    program.enrolledStudents.push({
      studentId: req.user.id,
      status: 'active'
    });

    await program.save();

    const updatedProgram = await MentorshipProgram.findById(programId)
      .populate('alumniId', 'firstName lastName email profile')
      .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in mentorship program',
      program: updatedProgram
    });
  } catch (error) {
    console.error('Enroll in program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get program details
// @route   GET /api/mentorship/programs/:programId
// @access  Private (Student, Alumni, Admin)
export const getProgramDetails = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await MentorshipProgram.findById(programId)
      .populate('alumniId', 'firstName lastName email profile')
      .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check access permissions
    const isAlumniOwner = program.alumniId._id.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAlumniOwner && !isStudentEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to program details'
      });
    }

    res.status(200).json({
      success: true,
      program
    });
  } catch (error) {
    console.error('Get program details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add content to mentorship program
// @route   POST /api/mentorship/programs/:programId/content
// @access  Private (Alumni, Student - for their programs)
export const addProgramContent = async (req, res) => {
  try {
    const { programId } = req.params;
    const { title, description, type, content, isPublic, accessLevel } = req.body;

     // ✅ NEW: Validation for required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and content type are required'
      });
    }

    // ✅ NEW: Check valid content type
    const validTypes = ['file', 'link', 'text', 'assignment'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid content type. Allowed: ${validTypes.join(', ')}`
      });
    }

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if user has access to add content
    const isAlumniOwner = program.alumniId.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);

    if (!isAlumniOwner && !isStudentEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to add content'
      });
    }

     let contentData = content || {};

    // ✅ NEW: Handle uploaded file
    if (req.file && type === 'file') {
      contentData = {
        fileUrl: `/uploads/mentorship/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size
      };
    }

    const mentorshipContent = await MentorshipContent.create({
      programId,
      title,
      description,
      type,
      content,
      isPublic: isPublic !== undefined ? isPublic : true,
      accessLevel: accessLevel || 'all',
      postedBy: req.user.id
    });

    const populatedContent = await MentorshipContent.findById(mentorshipContent._id)
      .populate('postedBy', 'firstName lastName role');

    res.status(201).json({
      success: true,
      message: 'Content added successfully',
      content: populatedContent
    });
  } catch (error) {
    console.error('Add program content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get program content
// @route   GET /api/mentorship/programs/:programId/content
// @access  Private (Alumni, Student - for their programs)
export const getProgramContent = async (req, res) => {
  try {
    const { programId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if user has access to view content
    const isAlumniOwner = program.alumniId.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);

    if (!isAlumniOwner && !isStudentEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to view content'
      });
    }

    const filter = { programId };
    if (type) {
      filter.type = type;
    }

    const content = await MentorshipContent.find(filter)
      .populate('postedBy', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipContent.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: content.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      content
    });
  } catch (error) {
    console.error('Get program content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update mentorship program
// @route   PUT /api/mentorship/programs/:programId
// @access  Private (Alumni - owner only)
export const updateMentorshipProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if user is the alumni owner
    if (program.alumniId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only program owner can update.'
      });
    }

    const updatedProgram = await MentorshipProgram.findByIdAndUpdate(
      programId,
      req.body,
      { new: true, runValidators: true }
    ).populate('alumniId', 'firstName lastName profile')
     .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    res.status(200).json({
      success: true,
      message: 'Program updated successfully',
      program: updatedProgram
    });
  } catch (error) {
    console.error('Update mentorship program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get admin mentorship programs
// @route   GET /api/mentorship/admin/programs
// @access  Private (Admin)
export const getAdminMentorshipPrograms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {};
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const programs = await MentorshipProgram.find(filter)
      .populate('alumniId', 'firstName lastName email profile')
      .populate('enrolledStudents.studentId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipProgram.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      programs
    });
  } catch (error) {
    console.error('Get admin mentorship programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's enrolled program
// @route   GET /api/mentorship/student/my-program
// @access  Private (Student)
export const getStudentEnrolledProgram = async (req, res) => {
  try {
    const program = await MentorshipProgram.findOne({
      'enrolledStudents.studentId': req.user.id,
      'enrolledStudents.status': 'active'
    })
    .populate('alumniId', 'firstName lastName email profile')
    .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'No active mentorship program found'
      });
    }

    res.status(200).json({
      success: true,
      program
    });
  } catch (error) {
    console.error('Get student enrolled program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
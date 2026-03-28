import MentorshipProgram from '../models/Mentorship.js';
import MentorshipSession from '../models/MentorshipSession.js';

// @desc    Create a mentorship session
// @route   POST /api/mentorship/programs/:programId/sessions
// @access  Private (Alumni or Student)
export const createSession = async (req, res) => {
  try {
    const { programId } = req.params;
    const { title, description, scheduledDate, duration, meetingLink } = req.body;

    // ✅ Validation
    if (!title || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and scheduled date are required.'
      });
    }

    const program = await MentorshipProgram.findById(programId);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    const isAlumniOwner = program.alumniId.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);

    if (!isAlumniOwner && !isStudentEnrolled) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Identify counterpart user
    let studentId, alumniId;
    if (isAlumniOwner) {
      // Alumni creates for enrolled student(s)
      if (program.enrolledStudents.length === 0)
        return res.status(400).json({ success: false, message: 'No students enrolled yet.' });
      studentId = program.enrolledStudents[0].studentId; // one-to-one assumption
      alumniId = req.user.id;
    } else {
      // Student creates for their mentor
      studentId = req.user.id;
      alumniId = program.alumniId;
    }

    const session = await MentorshipSession.create({
      programId,
      studentId,
      alumniId,
      title: title.trim(),
      description,
      scheduledDate,
      duration: duration || 60,
      meetingLink
    });

    res.status(201).json({ success: true, message: 'Session scheduled successfully', session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get mentorship sessions for a program
// @route   GET /api/mentorship/programs/:programId/sessions
// @access  Private (Alumni or Student)
export const getSessions = async (req, res) => {
  try {
    const { programId } = req.params;
    const program = await MentorshipProgram.findById(programId);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    const isAlumniOwner = program.alumniId.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);
    if (!isAlumniOwner && !isStudentEnrolled)
      return res.status(403).json({ success: false, message: 'Access denied' });

    const sessions = await MentorshipSession.find({ programId })
      .populate('studentId', 'firstName lastName email')
      .populate('alumniId', 'firstName lastName email')
      .sort({ scheduledDate: 1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session status (completed/cancelled/rescheduled)
// @route   PUT /api/mentorship/sessions/:sessionId/status
// @access  Private (Alumni or Student)
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const session = await MentorshipSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.alumniId.toString() !== req.user.id && session.studentId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Access denied' });

    session.status = status;
    await session.save();

    res.status(200).json({ success: true, message: 'Session status updated', session });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

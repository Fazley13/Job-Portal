import Event from '../models/Event.js';
import User from '../models/user.js';

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Employer/Admin)
export const createEvent = async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.body;
    
    // Validate dates
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const eventData = {
      ...req.body,
      postedBy: req.user.id,
      status: 'upcoming' // Will be updated by pre-save hook
    };

    const event = await Event.create(eventData);
    await event.populate('postedBy', 'firstName lastName profile.company');

    // Real-time notification
    if (req.io) {
      req.io.emit('newEventPosted', {
        eventId: event._id,
        title: event.title,
        organizer: event.organizer,
        startDateTime: event.startDateTime,
        isOnline: event.isOnline,
        status: event.status
      });
    }

    res.status(201).json({
      success: true,
      event,
      message: 'Event created successfully!'
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' 
        ? Object.values(error.errors).map(val => val.message).join(', ')
        : 'Server error during event creation',
      error: error.message
    });
  }
};

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const {
      search,
      type,
      status,
      isOnline,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const filter = {};

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (isOnline) filter.isOnline = isOnline === 'true';

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('postedBy', 'firstName lastName profile.company')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit),
      Event.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('postedBy', 'firstName lastName profile.company profile.website');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Employer/Admin)
export const updateEvent = async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.body;
    
    // Date validation
    if (startDateTime && endDateTime && new Date(startDateTime) >= new Date(endDateTime)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Authorization
    if (event.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' 
        ? Object.values(error.errors).map(val => val.message).join(', ')
        : 'Server error during event update',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Employer/Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during event deletion',
      error: error.message
    });
  }
};

// @desc    Get employer's events
// @route   GET /api/events/employer/my
// @access  Private (Employer)
export const getEmployerEvents = async (req, res) => {
  try {
    const events = await Event.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get employer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
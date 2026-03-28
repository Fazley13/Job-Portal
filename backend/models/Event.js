import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Event title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Event description cannot exceed 2000 characters']
  },
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['webinar', 'job-fair', 'seminar', 'workshop', 'hackathon', 'networking', 'other'],
    required: true
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time are required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time are required']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    required: function() { return !this.isOnline; }
  },
  onlineLink: {
    type: String,
    required: function() { return this.isOnline; }
  },
  registrationLink: {
    type: String,
    required: [true, 'Registration link is required'],
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please provide a valid URL']
  },
  tags: [String],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'closed'],
    default: 'upcoming'
  },
  registrationDeadline: Date,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



// Update status based on dates
eventSchema.pre('save', function(next) {
  const now = new Date();
  if (this.startDateTime <= now && this.endDateTime >= now) {
    this.status = 'ongoing';
  } else if (this.endDateTime < now) {
    this.status = 'closed';
  }
  next();
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
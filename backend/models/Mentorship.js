import mongoose from 'mongoose';

const mentorshipProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Program title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  topics: [{
    type: String,
    required: true,
    trim: true
  }],
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['weeks', 'months'],
      default: 'weeks'
    }
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  maxStudents: {
    type: Number,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: [String],
  learningOutcomes: [String],
  schedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'custom'],
      default: 'weekly'
    },
    sessionsPerWeek: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for searching by topics
mentorshipProgramSchema.index({ topics: 'text', title: 'text', description: 'text' });

// Virtual for checking if program is full
mentorshipProgramSchema.virtual('isFull').get(function() {
  return this.enrolledStudents.filter(student => student.status === 'active').length >= this.maxStudents;
});

// Method to check if student is enrolled
mentorshipProgramSchema.methods.isStudentEnrolled = function(studentId) {
  return this.enrolledStudents.some(
    enrollment => enrollment.studentId.toString() === studentId.toString() && enrollment.status === 'active'
  );
};

// Method to get active enrollments count
mentorshipProgramSchema.methods.getActiveEnrollmentsCount = function() {
  return this.enrolledStudents.filter(enrollment => enrollment.status === 'active').length;
};

export default mongoose.model('MentorshipProgram', mentorshipProgramSchema);
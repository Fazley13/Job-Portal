import mongoose from 'mongoose';

const mentorshipContentSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipProgram',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['file', 'link', 'text', 'assignment'],
    required: true
  },
  content: {
    // For files
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    // For links
    linkUrl: String,
    // For text content
    textContent: String
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  accessLevel: {
    type: String,
    enum: ['all', 'alumni-only', 'student-only'],
    default: 'all'
  }
}, {
  timestamps: true
});

export default mongoose.model('MentorshipContent', mentorshipContentSchema);
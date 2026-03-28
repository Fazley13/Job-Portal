import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'followers'
  }
}, {
  timestamps: true
});

// Index for user queries
cvSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('CV', cvSchema);
import mongoose from 'mongoose';

const userRoadmapProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true
  },
  completedPhases: [String], // Store phase indices
  completedSkills: [String], // Store as "phaseIndex-skillIndex"
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

// Compound index to ensure a user can only have one progress record per roadmap
userRoadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

export default mongoose.model('UserRoadmapProgress', userRoadmapProgressSchema);
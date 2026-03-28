import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Skill description is required']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours are required']
  },
  resources: [String]
});

const phaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Phase name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Phase description is required']
  },
  duration: {
    type: String,
    required: [true, 'Phase duration is required']
  },
  skills: [skillSchema],
  milestones: [String]
});

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Roadmap title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: [true, 'Difficulty level is required']
  },
  salary: {
    type: String,
    required: [true, 'Salary range is required']
  },
  growth: {
    type: String,
    required: [true, 'Growth projection is required']
  },
  category: {
    type: String,
    enum: ['Technology', 'Data Science', 'Design', 'Business', 'Security', 'AI/ML'],
    required: [true, 'Category is required']
  },
  tags: [String],
  phases: [phaseSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for searching
roadmapSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Roadmap', roadmapSchema);
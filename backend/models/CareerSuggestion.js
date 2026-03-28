import mongoose from 'mongoose';

const careerSuggestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole: {
    type: String,
    required: true,
    trim: true
  },
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  timeCommitment: {
    type: String,
    enum: ['part-time', 'full-time', 'flexible'],
    default: 'flexible'
  },
  currentSkills: [String],
  suggestedRoadmap: {
    phases: [{
      name: String,
      description: String,
      duration: String,
      skills: [{
        name: String,
        description: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium'
        },
        resources: [String],
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: Date
      }],
      projects: [{
        name: String,
        description: String,
        difficulty: String,
        estimatedHours: Number,
        technologies: [String],
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: Date
      }],
      certifications: [{
        name: String,
        provider: String,
        url: String,
        priority: String,
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: Date
      }],
      jobLevels: [String],
      milestones: [String],
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    totalProgress: {
      type: Number,
      default: 0
    },
    estimatedCompletion: String
  },
  preferences: {
    learningStyle: {
      type: String,
      enum: ['visual', 'hands-on', 'reading', 'mixed'],
      default: 'mixed'
    },
    budget: {
      type: String,
      enum: ['free', 'low', 'medium', 'high'],
      default: 'free'
    },
    focusAreas: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update progress when skills/projects are completed
careerSuggestionSchema.methods.updateProgress = function() {
  const totalItems = this.suggestedRoadmap.phases.reduce((total, phase) => {
    return total + phase.skills.length + phase.projects.length + phase.certifications.length;
  }, 0);
  
  const completedItems = this.suggestedRoadmap.phases.reduce((completed, phase) => {
    const completedSkills = phase.skills.filter(skill => skill.completed).length;
    const completedProjects = phase.projects.filter(project => project.completed).length;
    const completedCerts = phase.certifications.filter(cert => cert.completed).length;
    return completed + completedSkills + completedProjects + completedCerts;
  }, 0);
  
  this.suggestedRoadmap.totalProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  this.lastUpdated = new Date();
};

export default mongoose.model('CareerSuggestion', careerSuggestionSchema);
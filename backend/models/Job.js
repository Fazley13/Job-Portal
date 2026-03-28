import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  skills: [String],
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationDeadline: Date,
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update applications count when new application is created
jobSchema.methods.updateApplicationsCount = async function() {
  const Application = mongoose.model('Application');
  this.applicationsCount = await Application.countDocuments({ jobId: this._id });
  await this.save();
};

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;

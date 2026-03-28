import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MapPin, Briefcase, Clock, Users, DollarSign, Heart, Share2, Building, Star, CheckCircle, Eye } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  applicationsCount: number;
  createdAt: string;
  employerId: {
    firstName: string;
    lastName: string;
    profile?: {
      company?: string;
      website?: string;
    };
  };
}

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  // Check if user can apply for jobs (only students and alumni)
  const canApplyForJobs = user?.role === 'student' || user?.role === 'alumni';

  useEffect(() => {
    if (id) {
      fetchJob();
      if (canApplyForJobs) {
        checkApplicationStatus();
      }
    }
  }, [id, canApplyForJobs]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/jobs/${id}`);
      setJob(response.data.job);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await axios.get('/applications/my');
      const hasAppliedToJob = response.data.applications.some((app: any) => {
        const jobId = app.jobId?._id || app.jobId;
        return jobId === id;
      });
      setHasApplied(hasAppliedToJob);
    } catch (error) {
      // Silently handle error
    }
  };

  const handleApply = async () => {
    if (!job || !canApplyForJobs || hasApplied || applying) return;

    try {
      setApplying(true);
      
      await axios.post('/applications', {
        jobId: job._id,
        coverLetter: 'I am interested in this position and believe I would be a great fit.',
        resume: 'Resume content here'
      });
      
      setHasApplied(true);
      toast.success('Application submitted successfully!');
      
      // Update applications count and refresh job data
      if (job) {
        setJob(prev => prev ? { ...prev, applicationsCount: (prev.applicationsCount || 0) + 1 } : null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary: any) => {
    if (!salary || !salary.min || !salary.max) return 'Salary not specified';
    return `$${salary.min}k - $${salary.max}k`;
  };

  const getApplyButtonState = () => {
    if (!canApplyForJobs) {
      return {
        text: user?.role === 'employer' ? 'View Only (Employer)' : 'View Only',
        disabled: true,
        className: 'px-6 py-3 bg-gray-500 text-white rounded-lg cursor-not-allowed font-medium flex items-center space-x-2'
      };
    }

    if (applying) {
      return {
        text: 'Applying...',
        disabled: true,
        className: 'px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium'
      };
    }
    
    if (hasApplied) {
      return {
        text: 'Applied',
        disabled: true,
        className: 'px-6 py-3 bg-green-600 text-white rounded-lg cursor-not-allowed font-medium flex items-center space-x-2'
      };
    }
    
    return {
      text: 'Apply for this Job',
      disabled: false,
      className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
        </div>
      </DashboardLayout>
    );
  }

  const buttonState = getApplyButtonState();

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Role-based Notice */}
        {!canApplyForJobs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800">
                {user?.role === 'employer' 
                  ? 'You are viewing this job as an employer. Only students and alumni can apply for positions.'
                  : 'You are viewing this job in browse mode. Only students and alumni can apply for positions.'
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-lg p-6 shadow-sm border mb-8 ${
            canApplyForJobs && hasApplied ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                canApplyForJobs && hasApplied ? 'bg-green-100' : 
                !canApplyForJobs ? 'bg-gray-100' : 'bg-blue-100'
              }`}>
                {canApplyForJobs && hasApplied ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : !canApplyForJobs ? (
                  <Eye className="h-8 w-8 text-gray-600" />
                ) : (
                  <Briefcase className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  {canApplyForJobs && hasApplied && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Applied
                    </span>
                  )}
                  {!canApplyForJobs && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      View Only
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>4.5</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{job.type}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{job.experience}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 text-green-600 font-semibold">
                <DollarSign className="h-5 w-5" />
                <span>{formatSalary(job.salary)}</span>
              </div>
              <span className="text-gray-500">{job.applicationsCount || 0} applicants</span>
            </div>
            
            <button
              onClick={handleApply}
              disabled={buttonState.disabled}
              className={buttonState.className}
            >
              {canApplyForJobs && hasApplied && <CheckCircle className="h-5 w-5" />}
              {!canApplyForJobs && <Eye className="h-5 w-5" />}
              <span>{buttonState.text}</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.1}}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700">{job.description}</p>
              </div>
            </motion.div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.2}}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3}}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.4}}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.5}}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.6}}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About {job.company}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium">Technology</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Size:</span>
                  <span className="font-medium">1000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Founded:</span>
                  <span className="font-medium">2010</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">4.5/5</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                View Company Profile
              </button>
            </motion.div>

            {/* Apply Section */}
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.7}}
              className={`rounded-lg p-6 border ${
                !canApplyForJobs 
                  ? 'bg-gray-50 border-gray-200'
                  : canApplyForJobs && hasApplied 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {!canApplyForJobs 
                  ? 'View Only Mode'
                  : canApplyForJobs && hasApplied 
                    ? 'Application Submitted!' 
                    : 'Ready to Apply?'
                }
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {!canApplyForJobs 
                  ? 'Only students and alumni can apply for job positions. You can view job details for market insights.'
                  : canApplyForJobs && hasApplied 
                    ? 'Your application has been submitted successfully. The employer will review it and get back to you.'
                    : `Join ${job.applicationsCount || 0} other candidates who have already applied for this position.`
                }
              </p>
              <button
                onClick={handleApply}
                disabled={buttonState.disabled}
                className={`w-full ${buttonState.className}`}
              >
                {canApplyForJobs && hasApplied && <CheckCircle className="h-5 w-5" />}
                {!canApplyForJobs && <Eye className="h-5 w-5" />}
                <span>{buttonState.text}</span>
              </button>
              {canApplyForJobs && !hasApplied && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Application takes less than 5 minutes
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;
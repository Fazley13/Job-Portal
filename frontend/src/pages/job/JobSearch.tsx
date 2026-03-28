import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, Filter, MapPin, Briefcase, Clock, Users, Star, Heart, Share2, DollarSign, CheckCircle, Building } from 'lucide-react';

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
  skills: string[];
  applicationsCount: number;
  createdAt: string;
  employerId: {
    firstName: string;
    lastName: string;
    profile?: {
      company?: string;
    };
  };
  hasApplied?: boolean; // Track if current user has applied
}

const JobSearch: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    jobType: '',
    experience: '',
    salary: '',
    company: ''
  });
  const { socket } = useSocket();

  // Check if user can apply for jobs (only students and alumni)
  const canApplyForJobs = user?.role === 'student' || user?.role === 'alumni';

  useEffect(() => {
    fetchJobs();
    if (canApplyForJobs) {
      fetchMyApplications();
    }
  }, [canApplyForJobs]);

  useEffect(() => {
    if (socket) {
      socket.on('newJobPosted', (jobData) => {
        toast.success(`New job posted: ${jobData.title} at ${jobData.company}`);
        fetchJobs(); // Refresh job list
      });

      return () => {
        socket.off('newJobPosted');
      };
    }
  }, [socket]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(location && { location }),
        ...(filters.jobType && { type: filters.jobType }),
        ...(filters.experience && { experience: filters.experience }),
        ...(filters.salary && { salary: filters.salary }),
        ...(filters.company && { company: filters.company })
      });

      const response = await axios.get(`/jobs?${params}`);
      setJobs(response.data.jobs);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await axios.get('/applications/my');
      const appliedJobIds = new Set(response.data.applications.map((app: any) => app.jobId?._id || app.jobId));
      setAppliedJobs(appliedJobIds);
    } catch (error) {
      // Silently handle error - user might not have any applications yet
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async (jobId: string) => {
    if (!canApplyForJobs) {
      toast.error('Only students and alumni can apply for jobs');
      return;
    }

    if (appliedJobs.has(jobId) || applyingJobs.has(jobId)) {
      return; // Already applied or currently applying
    }

    try {
      setApplyingJobs(prev => new Set(prev).add(jobId));
      
      await axios.post('/applications', {
        jobId,
        coverLetter: 'I am interested in this position and believe I would be a great fit.',
        resume: 'Resume content here' // In real app, this would be file upload
      });
      
      // Update applied jobs state
      setAppliedJobs(prev => new Set(prev).add(jobId));
      
      toast.success('Application submitted successfully!');
      fetchJobs(); // Refresh to update application count
      
      // Update local applied jobs state immediately
      setAppliedJobs(prev => new Set(prev).add(jobId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const formatSalary = (salary: any) => {
    if (!salary || !salary.min || !salary.max) return 'Salary not specified';
    return `$${salary.min}k - $${salary.max}k`;
  };

  const getApplyButtonState = (jobId: string) => {
    if (!canApplyForJobs) {
      return {
        text: user?.role === 'employer' ? 'View Job' : 'View Details',
        disabled: false,
        className: 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors',
        isViewOnly: true
      };
    }

    if (applyingJobs.has(jobId)) {
      return {
        text: 'Applying...',
        disabled: true,
        className: 'px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed',
        isViewOnly: false
      };
    }
    
    if (appliedJobs.has(jobId)) {
      return {
        text: 'Applied',
        disabled: true,
        className: 'px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed flex items-center space-x-1',
        isViewOnly: false
      };
    }
    
    return {
      text: 'Apply Now',
      disabled: false,
      className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
      isViewOnly: false
    };
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {canApplyForJobs ? 'Find Your Dream Job' : 'Browse Job Opportunities'}
          </h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Job Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Location"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search Jobs
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 text-sm">
              <button type="button" className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.jobType}
                onChange={(e) => setFilters({...filters, jobType: e.target.value})}
              >
                <option value="">Job Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.experience}
                onChange={(e) => setFilters({...filters, experience: e.target.value})}
              >
                <option value="">Experience</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.salary}
                onChange={(e) => setFilters({...filters, salary: e.target.value})}
              >
                <option value="">Salary Range</option>
                <option value="0-50">$0 - $50k</option>
                <option value="50-100">$50k - $100k</option>
                <option value="100-150">$100k - $150k</option>
                <option value="150-999">$150k+</option>
              </select>
            </div>
          </form>
        </motion.div>

        {/* Role-based Notice */}
        {!canApplyForJobs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800">
                {user?.role === 'employer' 
                  ? 'As an employer, you can browse jobs for market insights but cannot apply. Use this to understand the job market and competition.'
                  : 'You are viewing jobs in browse mode. Only students and alumni can apply for positions.'
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-medium">{jobs.length}</span> jobs
            {canApplyForJobs && appliedJobs.size > 0 && (
              <span className="ml-2 text-green-600">
                • Applied to {appliedJobs.size} job{appliedJobs.size !== 1 ? 's' : ''}
              </span>
            )}
          </p>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Most Relevant</option>
            <option>Most Recent</option>
            <option>Salary: High to Low</option>
            <option>Salary: Low to High</option>
          </select>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, index) => {
              const buttonState = getApplyButtonState(job._id);
              
              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-lg p-6 shadow-sm border transition-all ${
                    canApplyForJobs && appliedJobs.has(job._id) 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        canApplyForJobs && appliedJobs.has(job._id) ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {canApplyForJobs && appliedJobs.has(job._id) ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Briefcase className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Link 
                            to={`/jobs/${job._id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {job.title}
                          </Link>
                          {canApplyForJobs && appliedJobs.has(job._id) && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Applied
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 font-medium mb-2">{job.company}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">{job.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{job.experience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                        <div className="flex items-center space-x-2 mb-4">
                          {job.skills.slice(0, 4).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="text-xs text-gray-500">+{job.skills.length - 4} more</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-semibold text-green-600 flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatSalary(job.salary)}
                            </span>
                            <span className="text-gray-500">{job.applicationsCount || 0} applicants</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Heart className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <Share2 className="h-4 w-4" />
                            </button>
                            
                            {buttonState.isViewOnly ? (
                              <Link
                                to={`/jobs/${job._id}`}
                                className={buttonState.className}
                              >
                                <span>{buttonState.text}</span>
                              </Link>
                            ) : (
                              <button 
                                onClick={() => handleApply(job._id)}
                                disabled={buttonState.disabled}
                                className={buttonState.className}
                              >
                                {canApplyForJobs && appliedJobs.has(job._id) && (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                <span>{buttonState.text}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {jobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobSearch;
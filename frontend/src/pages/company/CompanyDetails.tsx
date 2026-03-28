import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Building, 
  MapPin, 
  Users, 
  Star, 
  Briefcase,
  TrendingUp,
  Award,
  ExternalLink,
  Calendar,
  Globe,
  Heart,
  Share2,
  ArrowLeft,
  Eye,
  CheckCircle,
  Send,
  MessageSquare
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  type: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  createdAt: string;
  applicationsCount: number;
}

interface Company {
  _id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  founded: number;
  headquarters: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  benefits: string[];
  culture?: string;
  values: string[];
  technologies: string[];
  locations: string[];
  rating: number;
  reviewsCount: number;
  openPositions: number;
  isVerified: boolean;
  createdAt: string;
  jobs: Job[];
  hasApplied?: boolean;
}

const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'culture'>('overview');
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [hasAppliedToCompany, setHasAppliedToCompany] = useState(false);
  const [isApplyingToCompany, setIsApplyingToCompany] = useState(false);

  const canApplyForJobs = user?.role === 'student' || user?.role === 'alumni';
  const canApplyToCompany = user?.role === 'student' || user?.role === 'alumni';

  useEffect(() => {
    if (id) {
      fetchCompany();
      if (canApplyForJobs) {
        fetchMyApplications();
      }
      if (canApplyToCompany) {
        fetchMyCompanyApplications();
      }
    }
  }, [id, canApplyForJobs, canApplyToCompany]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/companies/${id}`);
      setCompany(response.data.company);
    } catch (error: any) {
      console.error('Error fetching company:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
  try {
    const response = await axios.get('/applications/my');

    const appliedJobIds = new Set<string>(
      response.data.applications
        .map((app: any) => app.jobId?._id || app.jobId)
        .filter((id: string | number | undefined): id is string | number => !!id)
        .map(String)
    );

    setAppliedJobs(appliedJobIds);
  } catch (error) {
    console.error('Error fetching applications:', error);
  }
};




  const fetchMyCompanyApplications = async () => {
  try {
    const response = await axios.get('/company-applications/my');
    const hasApplied = response.data.applications.some(
      (app: any) => String(app.companyId._id) === id
    );
    setHasAppliedToCompany(hasApplied);
  } catch (error) {
    // Silently handle error
  }
};


  const handleApplyToCompany = async () => {
    if (!canApplyToCompany || hasAppliedToCompany || isApplyingToCompany || !company) return;

    try {
      setIsApplyingToCompany(true);
      
      await axios.post('/company-applications', {
        companyId: company._id,
        coverLetter: `I am very interested in joining ${company.name} and believe my skills and experience would be a valuable addition to your team. I would love to discuss potential opportunities with your organization.`,
        resume: 'Resume content here'
      });
      
      setHasAppliedToCompany(true);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply to company');
    } finally {
      setIsApplyingToCompany(false);
    }
  };

  const handleApplyForJob = async (jobId: string) => {
  if (!canApplyForJobs || appliedJobs.has(jobId)) return;

  try {
    await axios.post('/applications', {
      jobId,
      coverLetter: 'I am interested in this position and believe I would be a great fit.',
      resume: 'Resume content here'
    });

    // TS-safe way to update the Set
    setAppliedJobs(prev => new Set([...prev, jobId]));

    toast.success('Application submitted successfully!');
    fetchCompany(); // Refresh to update application count
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to apply for job');
  }
};


  const getSizeLabel = (size: string) => {
    const labels = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '501-1000': '501-1000 employees',
      '1000+': '1000+ employees'
    };
    return labels[size as keyof typeof labels] || size;
  };

  const formatSalary = (salary: any) => {
    if (!salary || !salary.min || !salary.max) return 'Salary not specified';
    return `$${salary.min}k - $${salary.max}k`;
  };

  const getCompanyApplyButtonState = () => {
    if (!canApplyToCompany) {
      return {
        text: user?.role === 'employer' ? 'View Only (Employer)' : 'View Only',
        disabled: true,
        className: 'px-4 py-2 bg-gray-500 text-white rounded-lg cursor-not-allowed flex items-center space-x-2'
      };
    }

    if (isApplyingToCompany) {
      return {
        text: 'Applying...',
        disabled: true,
        className: 'px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed'
      };
    }
    
    if (hasAppliedToCompany) {
      return {
        text: 'Applied to Company',
        disabled: true,
        className: 'px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed flex items-center space-x-2'
      };
    }
    
    return {
      text: 'Apply to Company',
      disabled: false,
      className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
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

  if (!company) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <p className="text-gray-600">The company you're looking for doesn't exist or has been removed.</p>
          <Link to="/companies" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Companies
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/companies"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Companies</span>
          </Link>
        </div>

        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {company.coverImage ? (
              <img 
                src={company.coverImage} 
                alt={company.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            )}
            
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center -mt-10 relative z-10">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="h-16 w-16 object-contain"
                    />
                  ) : (
                    <Building className="h-10 w-10 text-gray-600" />
                  )}
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                    {company.isVerified && (
                      <Award className="h-6 w-6 text-blue-600" aria-label="Verified Company" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.headquarters}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{getSizeLabel(company.size)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Founded {company.founded}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{company.rating.toFixed(1)} ({company.reviewsCount} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {company.industry}
                    </span>
                    <span className="text-green-600 font-semibold">
                      {company.openPositions} open positions
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                {company.website && (
                  <button
                    onClick={() => window.open(company.website, '_blank')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Website</span>
                  </button>
                )}
                
                {canApplyToCompany ? (
                  <button
                    onClick={handleApplyToCompany}
                    disabled={getCompanyApplyButtonState().disabled}
                    className={getCompanyApplyButtonState().className}
                  >
                    {hasAppliedToCompany && <CheckCircle className="h-4 w-4" />}
                    {!hasAppliedToCompany && !isApplyingToCompany && <Send className="h-4 w-4" />}
                    <span>{getCompanyApplyButtonState().text}</span>
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg cursor-not-allowed flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View Only</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Application Status Notice */}
        {canApplyToCompany && hasAppliedToCompany && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Application Submitted!</p>
                <p className="text-green-700 text-sm">
                  Your application to {company?.name} has been submitted. The company will review it and get back to you.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'jobs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Jobs ({company.openPositions})
            </button>
            <button
              onClick={() => setActiveTab('culture')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'culture'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Culture
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.name}</h2>
                <p className="text-gray-700 leading-relaxed">{company.description}</p>
              </motion.div>

              {/* Technologies */}
              {company.technologies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Technologies We Use</h2>
                  <div className="flex flex-wrap gap-3">
                    {company.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Benefits */}
              {company.benefits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {company.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-medium">{company.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{getSizeLabel(company.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-medium">{company.founded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Open Jobs:</span>
                    <span className="font-medium text-green-600">{company.openPositions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{company.rating.toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social Links */}
              {Object.values(company.socialLinks).some(link => link) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                  <div className="space-y-3">
                    {company.socialLinks.linkedin && (
                      <a 
                        href={company.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {company.socialLinks.twitter && (
                      <a 
                        href={company.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Locations */}
              {company.locations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Locations</h3>
                  <div className="space-y-2">
                    {company.locations.map((location, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{location}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {company.jobs && company.jobs.length > 0 ? (
              company.jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`bg-white rounded-lg p-6 shadow-sm border transition-all ${
                    canApplyForJobs && appliedJobs.has(job._id) 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
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
                          <Calendar className="h-4 w-4" />
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-semibold text-green-600">
                            {formatSalary(job.salary)}
                          </span>
                          <span className="text-gray-500">{job.applicationsCount || 0} applicants</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                          
                          {canApplyForJobs && !appliedJobs.has(job._id) && (
                            <button 
                              onClick={() => handleApplyForJob(job._id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions</h3>
                <p className="text-gray-600">This company doesn't have any open positions at the moment.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'culture' && (
          <div className="space-y-6">
            {/* Company Culture */}
            {company.culture && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Culture</h2>
                <p className="text-gray-700 leading-relaxed">{company.culture}</p>
              </motion.div>
            )}

            {/* Company Values */}
            {company.values.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.values.map((value, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!company.culture && company.values.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Culture information not available</h3>
                <p className="text-gray-600">This company hasn't shared their culture and values yet.</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyDetails;
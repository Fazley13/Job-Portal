import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  Building, 
  MapPin, 
  Users, 
  Star, 
  Briefcase,
  TrendingUp,
  Award,
  ExternalLink,
  Eye,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle
} from 'lucide-react';

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
  rating: number;
  reviewsCount: number;
  openPositions: number;
  technologies: string[];
  isVerified: boolean;
  createdAt: string;
  hasApplied?: boolean;
}

const CompanySearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    size: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [appliedCompanies, setAppliedCompanies] = useState<Set<string>>(new Set());
  const [applyingCompanies, setApplyingCompanies] = useState<Set<string>>(new Set());

  const canApplyToCompanies = user?.role === 'student' || user?.role === 'alumni';
  useEffect(() => {
    fetchCompanies();
    if (canApplyToCompanies) {
      fetchMyCompanyApplications();
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(filters.industry && { industry: filters.industry }),
        ...(filters.size && { size: filters.size }),
        ...(filters.location && { location: filters.location })
      });

      const response = await axios.get(`/companies?${params}`);
      setCompanies(response.data.companies || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCompanyApplications = async () => {
  try {
    const response = await axios.get('/company-applications/my');
    const appliedCompanyIds = new Set<string>(
      response.data.applications
        .map((app: any) => app.companyId?._id)
        .filter((id: any): id is string => !!id)
    );
    setAppliedCompanies(appliedCompanyIds);
  } catch (error) {
    // Silently handle error
  }
};


  const handleApplyToCompany = async (companyId: string) => {
    if (!canApplyToCompanies || appliedCompanies.has(companyId) || applyingCompanies.has(companyId)) {
      return;
    }

    try {
      setApplyingCompanies(prev => new Set(prev).add(companyId));
      
      await axios.post('/company-applications', {
        companyId,
        coverLetter: 'I am interested in joining your company and believe I would be a valuable addition to your team.',
        resume: 'Resume content here'
      });
      
      setAppliedCompanies(prev => new Set(prev).add(companyId));
      toast.success('Application submitted successfully!');
      fetchCompanies(); // Refresh to update any counts
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply to company');
    } finally {
      setApplyingCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  };

  const getApplyButtonState = (companyId: string) => {
    if (!canApplyToCompanies) {
      return {
        text: 'View Profile',
        disabled: false,
        className: 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center space-x-1',
        isViewOnly: true
      };
    }

    if (applyingCompanies.has(companyId)) {
      return {
        text: 'Applying...',
        disabled: true,
        className: 'px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm',
        isViewOnly: false
      };
    }
    
    if (appliedCompanies.has(companyId)) {
      return {
        text: 'Applied',
        disabled: true,
        className: 'px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed text-sm flex items-center space-x-1',
        isViewOnly: false
      };
    }
    
    return {
      text: 'Apply',
      disabled: false,
      className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1',
      isViewOnly: false
    };
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
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

  const getIndustryColor = (industry: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Finance': 'bg-purple-100 text-purple-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Retail': 'bg-pink-100 text-pink-800',
      'Manufacturing': 'bg-orange-100 text-orange-800'
    };
    return colors[industry as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Companies</h1>
              <p className="text-gray-600">
                {canApplyToCompanies 
                  ? 'Explore companies and apply directly to organizations you\'re interested in'
                  : 'Explore companies and discover potential partners or competitors'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Role-based Notice */}
        {!canApplyToCompanies && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800">
                {user?.role === 'employer' 
                  ? 'As an employer, you can browse companies for insights but cannot apply. Use this to understand the market and potential partnerships.'
                  : 'You are viewing companies in browse mode. Only students and alumni can apply to companies.'
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Applied Companies Notice */}
        {canApplyToCompanies && appliedCompanies.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800">
                You have applied to {appliedCompanies.size} compan{appliedCompanies.size !== 1 ? 'ies' : 'y'}. 
                <Link to="/company-applications" className="ml-1 underline hover:no-underline">
                  View your applications
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search companies by name, industry, or technology..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search Companies
              </button>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.size}
                    onChange={(e) => setFilters({...filters, size: e.target.value})}
                  >
                    <option value="">All Sizes</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {companies.length} companies</span>
          </div>
        </motion.div>

        {/* Companies Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : companies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all companies
            </p>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {companies.map((company, index) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer ${
                  viewMode === 'list' ? 'p-6' : 'overflow-hidden'
                }`}
                onClick={() => navigate(`/companies/${company._id}`)}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Company Header */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      {company.logo ? (
                        <img 
                          src={company.logo} 
                          alt={company.name} 
                          className="h-16 w-16 object-contain bg-white rounded-lg p-2"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center">
                          <Building className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 flex space-x-2">
                        {company.isVerified && (
                          <div className="bg-white/90 rounded-full p-1">
                            <Award className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div className="bg-white/90 rounded-full px-2 py-1">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-medium">{company.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {company.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndustryColor(company.industry)}`}>
                          {company.industry}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {company.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{company.headquarters}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{getSizeLabel(company.size)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Briefcase className="h-4 w-4" />
                          <span>{company.openPositions} open positions</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {company.technologies.slice(0, 2).map((tech, techIndex) => (
                            <span key={techIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {tech}
                            </span>
                          ))}
                          {company.technologies.length > 2 && (
                            <span className="text-xs text-gray-500">+{company.technologies.length - 2}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/companies/${company._id}`);
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                        
                      {canApplyToCompanies && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!getApplyButtonState(company._id).isViewOnly) {
                              handleApplyToCompany(company._id);
                            }
                          }}
                          disabled={getApplyButtonState(company._id).disabled}
                          className={getApplyButtonState(company._id).className}
                        >
                          {appliedCompanies.has(company._id) && <CheckCircle className="h-4 w-4" />}
                          {!appliedCompanies.has(company._id) && !applyingCompanies.has(company._id) && <Send className="h-4 w-4" />}
                          <span>{getApplyButtonState(company._id).text}</span>
                        </button>
                      )}
                      
                        {canApplyToCompanies && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!getApplyButtonState(company._id).isViewOnly) {
                                handleApplyToCompany(company._id);
                              }
                            }}
                            disabled={getApplyButtonState(company._id).disabled}
                            className={getApplyButtonState(company._id).className}
                          >
                            {appliedCompanies.has(company._id) && <CheckCircle className="h-3 w-3" />}
                            {!appliedCompanies.has(company._id) && !applyingCompanies.has(company._id) && <Send className="h-3 w-3" />}
                            <span>{getApplyButtonState(company._id).text}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.name} 
                            className="h-12 w-12 object-contain bg-white rounded p-1"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-white" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                        {company.isVerified && (
                          <Award className="h-5 w-5 text-blue-600" aria-label="Verified Company" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndustryColor(company.industry)}`}>
                          {company.industry}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{company.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({company.reviewsCount})</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{company.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{company.headquarters}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{getSizeLabel(company.size)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{company.openPositions} open jobs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Founded {company.founded}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {company.technologies.slice(0, 4).map((tech, techIndex) => (
                          <span key={techIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                        {company.technologies.length > 4 && (
                          <span className="text-xs text-gray-500">+{company.technologies.length - 4} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/companies/${company._id}`);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Profile</span>
                      </button>
                      
                      {company.website && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(company.website, '_blank');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Website</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanySearch;
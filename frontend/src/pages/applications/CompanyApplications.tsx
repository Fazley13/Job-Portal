import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Filter, 
  Search, 
  Calendar, 
  Award, 
  Building,
  MapPin,
  Users,
  Star,
  ExternalLink,
  Eye,
  Trash2
} from 'lucide-react';

interface CompanyApplication {
  _id: string;
  companyId: {
    _id: string;
    name: string;
    industry: string;
    headquarters: string;
    logo?: string;
    website?: string;
    isVerified: boolean;
    size: string;
    rating: number;
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
  appliedAt: string;
  coverLetter: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    notes?: string;
  }>;
}

const CompanyApplications: React.FC = () => {
  const { user } = useAuth();
  const { applicationUpdates } = useSocket();
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/company-applications/my');
      setApplications(response.data.applications || []);
    } catch (error: any) {
      console.error('Error fetching company applications:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await axios.delete(`/company-applications/${applicationId}`);
      toast.success('Application withdrawn successfully');
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to withdraw application');
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      reviewed: AlertCircle,
      shortlisted: Award,
      accepted: CheckCircle,
      rejected: XCircle
    };
    return icons[status as keyof typeof icons];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Under Review',
      reviewed: 'Reviewed',
      shortlisted: 'Shortlisted',
      accepted: 'Accepted',
      rejected: 'Not Selected'
    };
    return texts[status as keyof typeof texts];
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

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.companyId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.companyId.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Company Applications</h1>
          <p className="text-gray-600">Track your applications to companies and their current status</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count], index) => (
            <motion.button
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setFilter(status)}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === status
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {status === 'all' ? 'Total' : status.replace('_', ' ')}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search company applications..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => {
              const StatusIcon = getStatusIcon(application.status);
              
              return (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`bg-white rounded-lg p-6 shadow-sm border transition-all ${
                    application.status === 'accepted' 
                      ? 'border-green-200 bg-green-50/30' 
                      : application.status === 'rejected'
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {application.companyId.logo ? (
                          <img 
                            src={application.companyId.logo} 
                            alt={application.companyId.name} 
                            className="h-12 w-12 object-contain bg-white rounded p-1"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {application.companyId.name}
                          </h3>
                          {application.companyId.isVerified && (
                            <Award className="h-5 w-5 text-blue-600" aria-label="Verified Company" />
                          )}
                        </div>
                        <p className="text-gray-600 font-medium mb-2">{application.companyId.industry}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.companyId.headquarters}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{getSizeLabel(application.companyId.size)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{application.companyId.rating.toFixed(1)}</span>
                          </div>
                          <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${getStatusColor(application.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{getStatusText(application.status)}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Last update: {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  {application.coverLetter && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{application.coverLetter}</p>
                    </div>
                  )}

                  {/* Special Messages */}
                  {application.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-900">🎉 Congratulations!</span>
                      </div>
                      <p className="text-green-800 text-sm">
                        {application.companyId.name} has accepted your application! They will be in touch with next steps.
                      </p>
                    </div>
                  )}

                  {application.status === 'shortlisted' && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">You've been shortlisted!</span>
                      </div>
                      <p className="text-purple-800 text-sm">
                        Great news! {application.companyId.name} has shortlisted your application for further review.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Link
                        to={`/companies/${application.companyId._id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Company</span>
                      </Link>
                      {application.companyId.website && (
                        <button
                          onClick={() => window.open(application.companyId.website, '_blank')}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Website</span>
                        </button>
                      )}
                    </div>
                    
                    {application.status === 'pending' && (
                      <button
                        onClick={() => handleWithdrawApplication(application._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredApplications.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Building className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No company applications found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start applying to companies to see them here'
              }
            </p>
            {!searchQuery && filter === 'all' && (
              <Link
                to="/companies"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Building className="h-4 w-4" />
                <span>Explore Companies</span>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyApplications;
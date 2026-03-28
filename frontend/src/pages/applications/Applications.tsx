import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, Calendar, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  status: 'pending' | 'shortlisted' | 'appointed' | 'accepted' | 'declined' | 'rejected';
  appliedAt: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    notes?: string;
  }>;
}

const Applications: React.FC = () => {
  const { user } = useAuth();
  const { applicationUpdates } = useSocket();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [respondingToOffer, setRespondingToOffer] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/applications/my');
      setApplications(response.data.applications || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleOfferResponse = async (applicationId: string, response: 'accepted' | 'declined') => {
    try {
      setRespondingToOffer(applicationId);
      
      await axios.put(`/applications/${applicationId}/status`, {
        status: response
      });
      
      toast.success(`Offer ${response} successfully!`);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application');
    } finally {
      setRespondingToOffer(null);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      shortlisted: AlertCircle,
      appointed: Award,
      accepted: ThumbsUp,
      declined: ThumbsDown,
      rejected: XCircle
    };
    return icons[status as keyof typeof icons];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      shortlisted: 'bg-blue-100 text-blue-800 border-blue-200',
      appointed: 'bg-purple-100 text-purple-800 border-purple-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-orange-100 text-orange-800 border-orange-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Under Review',
      shortlisted: 'Shortlisted',
      appointed: 'Offer Received',
      accepted: 'Offer Accepted',
      declined: 'Offer Declined',
      rejected: 'Not Selected'
    };
    return texts[status as keyof typeof texts];
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.jobId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.jobId.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    appointed: applications.filter(app => app.status === 'appointed').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    declined: applications.filter(app => app.status === 'declined').length,
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track your job applications and their current status</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusCounts).slice(0, 4).map(([status, count], index) => (
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
                placeholder="Search applications..."
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
                <option value="shortlisted">Shortlisted</option>
                <option value="appointed">Appointed</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
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
              const isRespondingToThisOffer = respondingToOffer === application._id;
              
              return (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">💼</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {application.jobId.title}
                        </h3>
                        <p className="text-gray-600 font-medium mb-2">{application.jobId.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{application.jobId.location}</span>
                          <span>•</span>
                          {application.jobId.salary && (
                            <>
                              <span className="text-green-600 font-medium">
                                ${application.jobId.salary.min}k-${application.jobId.salary.max}k
                              </span>
                              <span>•</span>
                            </>
                          )}
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

                  {/* Special Messages */}
                  {application.status === 'appointed' && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">🎉 Congratulations!</span>
                      </div>
                      <p className="text-purple-800 text-sm mb-3">
                        You have been selected for this position! Please respond to the job offer.
                      </p>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleOfferResponse(application._id, 'accepted')}
                          disabled={isRespondingToThisOffer}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {isRespondingToThisOffer ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="h-4 w-4" />
                              <span>Accept Offer</span>
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleOfferResponse(application._id, 'declined')}
                          disabled={isRespondingToThisOffer}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {isRespondingToThisOffer ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="h-4 w-4" />
                              <span>Decline Offer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {application.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-900">Offer Accepted!</span>
                      </div>
                      <p className="text-green-800 text-sm">
                        You have accepted this job offer. The employer will be in touch with onboarding details.
                      </p>
                    </div>
                  )}

                  {application.status === 'declined' && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ThumbsDown className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold text-orange-900">Offer Declined</span>
                      </div>
                      <p className="text-orange-800 text-sm">
                        You have declined this job offer. Thank you for considering the opportunity.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Job Details
                      </button>
                      {application.status === 'pending' && (
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Withdraw Application
                        </button>
                      )}
                    </div>
                    
                    {application.status === 'shortlisted' && (
                      <div className="flex items-center space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Schedule Interview
                        </button>
                      </div>
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
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start applying to jobs to see them here'
              }
            </p>
          </motion.div>
        )}

        {/* Real-time Updates Section */}
        {applicationUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
            <div className="space-y-3">
              {applicationUpdates.slice(0, 3).map((update, index) => (
                <div key={update.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{update.jobTitle}</p>
                    <p className="text-sm text-gray-600">{update.company}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status || 'pending')}`}>
                    {getStatusText(update.status || 'pending')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Applications;
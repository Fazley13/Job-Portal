import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Users,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
  };
  applicantId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      bio?: string;
      skills?: string[];
      university?: string;
      graduationYear?: number;
    };
  };
  status: 'pending' | 'shortlisted' | 'appointed' | 'rejected';
  appliedAt: string;
  coverLetter?: string;
  resume?: string;
  notes?: string;
}

const ManageApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/applications/employer');
      setApplications(response.data.applications);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await axios.put(`/applications/${applicationId}/status`, {
        status,
        notes
      });
      
      toast.success(`Application ${status} successfully`);
      fetchApplications();
      setSelectedApplication(null);
      setNotes('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      appointed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      shortlisted: AlertCircle,
      appointed: CheckCircle,
      rejected: XCircle
    };
    return icons[status as keyof typeof icons];
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicantId.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantId.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobId.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    appointed: applications.filter(app => app.status === 'appointed').length,
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Applications</h1>
          <p className="text-gray-600">Review and manage job applications from candidates</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count], index) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {status === 'all' ? 'Total' : status}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="appointed">Appointed</option>
              <option value="rejected">Rejected</option>
            </select>
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
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {application.applicantId.firstName[0]}{application.applicantId.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.applicantId.firstName} {application.applicantId.lastName}
                        </h3>
                        <p className="text-gray-600">{application.applicantId.email}</p>
                        <p className="text-sm text-gray-500">Applied for: {application.jobId.title}</p>
                        {application.applicantId.profile?.university && (
                          <p className="text-sm text-gray-500">
                            {application.applicantId.profile.university} 
                            {application.applicantId.profile.graduationYear && 
                              ` • Class of ${application.applicantId.profile.graduationYear}`
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${getStatusColor(application.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">{application.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {application.applicantId.profile?.skills && application.applicantId.profile.skills.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {application.applicantId.profile.skills.slice(0, 5).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.applicantId.profile.skills.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{application.applicantId.profile.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {application.coverLetter && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-600">{application.coverLetter}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>

                    {application.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Shortlist
                        </button>
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {application.status === 'shortlisted' && (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'appointed')}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Hire
                        </button>
                        <button 
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
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
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter 
                ? 'Try adjusting your search or filters'
                : 'No applications received yet'
              }
            </p>
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Candidate Information</h3>
                  <p className="text-gray-600">
                    {selectedApplication.applicantId.firstName} {selectedApplication.applicantId.lastName}
                  </p>
                  <p className="text-gray-600">{selectedApplication.applicantId.email}</p>
                </div>

                {selectedApplication.applicantId.profile?.bio && (
                  <div>
                    <h3 className="font-medium text-gray-900">Bio</h3>
                    <p className="text-gray-600">{selectedApplication.applicantId.profile.bio}</p>
                  </div>
                )}

                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-medium text-gray-900">Cover Letter</h3>
                    <p className="text-gray-600">{selectedApplication.coverLetter}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Add Notes</h3>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this candidate..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <button 
                    onClick={() => setSelectedApplication(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedApplication.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'shortlisted', notes)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Shortlist
                      </button>
                      <button 
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected', notes)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedApplication.status === 'shortlisted' && (
                    <>
                      <button 
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'appointed', notes)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Hire
                      </button>
                      <button 
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected', notes)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageApplications;
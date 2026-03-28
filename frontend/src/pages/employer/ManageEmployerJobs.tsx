import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
  createdAt: string;
  applicationsCount: number;
  description: string;
  skills: string[];
}

const ManageEmployerJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/jobs/employer/my');
      setJobs(response.data.jobs);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const formatSalary = (salary: any) => {
    if (!salary || !salary.min || !salary.max) return 'Not specified';
    return `$${salary.min}k - $${salary.max}k`;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-yellow-100 text-yellow-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-emerald-100 text-emerald-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && job.isActive) ||
                         (statusFilter === 'inactive' && !job.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(job => job.isActive).length,
    inactive: jobs.filter(job => !job.isActive).length,
    totalApplications: jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0)
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Job Listings</h1>
              <p className="text-gray-600">Manage your posted jobs and track applications</p>
            </div>
            <Link
              to="/jobs/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Job</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round(stats.totalApplications / stats.total) : 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </motion.div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                        {job.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applicationsCount || 0} applications</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
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
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Job"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/jobs/${job._id}/analytics`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View Analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit Job"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter 
                ? 'Try adjusting your search or filters'
                : 'You haven\'t posted any jobs yet'
              }
            </p>
            {!searchQuery && !statusFilter && (
              <Link
                to="/jobs/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Post Your First Job</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageEmployerJobs;
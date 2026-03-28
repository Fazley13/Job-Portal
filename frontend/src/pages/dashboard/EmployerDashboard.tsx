import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostCard from '../../components/social/PostCard';
import axios from 'axios';

import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp,
  Plus,
  ArrowRight,
  MessageSquare,
  Loader2,
  Building
} from 'lucide-react';

interface Post {
  _id: string;
  content: string;
  type: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    profile?: {
      avatar?: string;
    }
  };
  createdAt: string;
  tags: string[];
  likes: Array<{ user: string }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      profile?: {
        avatar?: string;
      }
    };
    content: string;
    createdAt: string;
  }>;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  applicationsCount: number;
  createdAt: string;
}

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts
      try {
        const postsResponse = await axios.get('/posts/feed');
        setPosts(postsResponse.data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
      
      // Fetch employer jobs
      try {
        const jobsResponse = await axios.get('/jobs/employer/my');
        setJobs(jobsResponse.data.jobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
      
      // Fetch applications
      try {
        const applicationsResponse = await axios.get('/applications/employer');
        setApplications(applicationsResponse.data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchDashboardData();
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const stats = [
    { label: 'Active Job Posts', value: jobs.filter(job => job.isActive).length.toString(), change: '', icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Total Applications', value: applications.length.toString(), change: '', icon: Users, color: 'bg-emerald-500' },
    { label: 'Profile Views', value: '0', change: '', icon: Eye, color: 'bg-purple-500' },
    { label: 'Hire Success Rate', value: '0%', change: '', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! 💼
              </h1>
              <p className="text-gray-600">
                Share updates and connect with potential candidates
              </p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    {stat.change && <p className="text-sm text-green-600 mt-1">{stat.change} this week</p>}
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Create Post Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CreatePostForm onPostCreated={handlePostCreated} />
            </motion.div>

            {/* Feed Posts */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <PostCard post={post} onDelete={handlePostDeleted} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center"
                >
                  <div className="text-gray-400 mb-4">
                    <MessageSquare className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your feed is empty</h3>
                  <p className="text-gray-600 mb-4">
                    Follow more people or create your first post to see updates here
                  </p>
                  <button
                    onClick={() => navigate('/users/search')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find People to Follow
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link 
                  to="/jobs/create"
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Create Job Post</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </Link>
                
                <Link 
                  to="/applications/manage"
                  className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">Browse Applications</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                </Link>
                
                <Link
                  to="/jobs/manage"
                  className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Manage Job Listings</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                </Link>
                
                <Link
                  to="/companies/manage"
                  className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">My Companies</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                </Link>
              </div>
            </motion.div>

            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <Link 
                  to="/applications/manage"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app: any, index: number) => (
                    <div key={app._id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {app.applicantId?.firstName} {app.applicantId?.lastName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Applied for: {app.jobId?.title}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'appointed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                        <button className="text-blue-600 text-sm">Review</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No applications received yet</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
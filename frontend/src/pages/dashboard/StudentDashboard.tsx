import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostCard from '../../components/social/PostCard';
import axios from 'axios';

import { 
  Briefcase, 
  ArrowRight,
  Loader2,
  MessageSquare,
  Building
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  createdAt: string;
}

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

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for real data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts for feed
      try {
        const postsResponse = await axios.get('/posts/feed');
        setPosts(postsResponse.data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
      
      // Fetch jobs from your backend
      try {
        const jobsResponse = await axios.get('/jobs?limit=3');
        setJobs(jobsResponse.data.jobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Share updates and see what's happening in your network
          </p>
        </motion.div>

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
            {/* Latest Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Latest Jobs</h2>
                <button 
                  onClick={() => navigate('/jobs/search')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div 
                      key={job._id} 
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No jobs available</p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/roadmap')}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-blue-900">Career Roadmaps</span>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/jobs/search')}
                  className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-emerald-900">Search Jobs</span>
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/users/search')}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-purple-900">Find People</span>
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/companies')}
                  className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-orange-900">Explore Companies</span>
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
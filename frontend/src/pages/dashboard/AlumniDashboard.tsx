import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostCard from '../../components/social/PostCard';
import axios from 'axios';

import { 
  Users, 
  MessageSquare, 
  Award, 
  TrendingUp,
  Calendar,
  Briefcase,
  Star,
  ArrowRight,
  UserPlus,
  BookOpen,
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

interface AlumniStats {
  studentsMentored: number;
  networkConnections: number;
  successStories: number;
  mentorshipRating: number;
}

const AlumniDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<AlumniStats>({
    studentsMentored: 0,
    networkConnections: 0,
    successStories: 0,
    mentorshipRating: 0
  });
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
      
      // Fetch alumni stats if API is available
      try {
        const statsResponse = await axios.get(`/alumni/dashboard/${user?._id}`);
        if (statsResponse.data) {
          setStats({
            studentsMentored: statsResponse.data.studentsMentored || 0,
            networkConnections: 0, // Not provided by API
            successStories: statsResponse.data.successStories?.length || 0,
            mentorshipRating: parseFloat(statsResponse.data.averageRating) || 0
          });
        }
      } catch (error) {
        console.error('Error fetching alumni stats:', error);
        // Set default stats
        setStats({
          studentsMentored: 0,
          networkConnections: 0,
          successStories: 0,
          mentorshipRating: 0
        });
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

  const statItems = [
    { label: 'Students Mentored', value: stats.studentsMentored.toString(), change: '', icon: Users, color: 'bg-emerald-500' },
    { label: 'Network Connections', value: stats.networkConnections.toString(), change: '', icon: UserPlus, color: 'bg-blue-500' },
    { label: 'Success Stories', value: stats.successStories.toString(), change: '', icon: Award, color: 'bg-purple-500' },
    { label: 'Mentorship Rating', value: stats.mentorshipRating.toString(), change: '', icon: Star, color: 'bg-yellow-500' },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 🎓
          </h1>
          <p className="text-gray-600">
            Share your insights and connect with your network
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statItems.map((stat, index) => {
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
                    {stat.change && <p className="text-sm text-green-600 mt-1">{stat.change} this month</p>}
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
              transition={{ delay: 0.9 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/users/search')}
                  className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">Find Students</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/events')}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Events & Meetups</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/network')}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">My Network</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/companies')}
                  className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Explore Companies</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                </button>
              </div>
            </motion.div>

            {/* Mentorship Impact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Mentorship</h2>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="text-center py-6">
                <p className="text-gray-600">Start mentoring students to see your impact here</p>
                <button 
                  onClick={() => navigate('/mentorship-panel')}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Become a Mentor
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniDashboard;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserCard from '../../components/social/UserCard';
import { Users, UserPlus, UserCheck, Search } from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  profile?: {
    avatar?: string;
    bio?: string;
    skills?: string[];
    university?: string;
    graduationYear?: number;
    company?: string;
    position?: string;
    location?: string;
  };
  isFollowing?: boolean;
}

const Network: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const [followingRes, followersRes] = await Promise.all([
        axios.get(`/follow/${user?._id}/following`),
        axios.get(`/follow/${user?._id}/followers`)
      ]);
      
      setFollowing(followingRes.data.following);
      setFollowers(followersRes.data.followers);
    } catch (error) {
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = () => {
    fetchNetworkData();
  };

  const filteredUsers = () => {
    const users = activeTab === 'following' ? following : followers;
    
    if (!searchQuery.trim()) return users;
    
    return users.filter(user => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.profile?.bio && user.profile.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.profile?.skills && user.profile.skills.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-gray-600">Manage your connections</p>
        </motion.div>

        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Following</p>
                <p className="text-2xl font-bold text-gray-900">{following.length}</p>
                <p className="text-sm text-gray-500">People you follow</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Followers</p>
                <p className="text-2xl font-bold text-gray-900">{followers.length}</p>
                <p className="text-sm text-gray-500">People following you</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('following')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'following'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Following
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'followers'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Followers
              </button>
            </div>
            
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search connections..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* User List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers().length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery
                ? 'No results found'
                : activeTab === 'following'
                  ? "You're not following anyone yet"
                  : "You don't have any followers yet"
              }
            </h3>
            {!searchQuery && activeTab === 'following' && (
              <>
                <p className="text-gray-600 mb-4">Find people to follow and grow your network</p>
                <button
                  onClick={() => navigate('/users/search')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find People
                </button>
              </>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUsers().map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <UserCard 
                  user={{
                    ...user,
                    isFollowing: activeTab === 'following' ? true : !!user.isFollowing
                  }} 
                  onFollowChange={handleFollowChange} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Network;
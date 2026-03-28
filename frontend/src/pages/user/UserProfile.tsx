import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PostCard from '../../components/social/PostCard';
import FollowButton from '../../components/social/FollowButton';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Users, 
  MessageSquare, 
  FileText,
  Download,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
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
    linkedin?: string;
    github?: string;
    website?: string;
  };
  followersCount: number;
  followingCount: number;
  postsCount: number;
  hasCV: boolean;
  isFollowing: boolean;
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

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/${userId}`);
      setUserProfile(response.data.user);
      setIsFollowing(response.data.user.isFollowing);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/posts/user/${userId}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to load user posts:', error);
    }
  };

  const handleFollowChange = async () => {
    fetchUserProfile(); // Refresh counts
  };

  const handleDownloadCV = async () => {
    if (!userProfile?.hasCV) return;
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      toast.loading('Preparing CV download...');
      
      // Make a direct request to download the CV
      const response = await axios.get(`/cv/user/${userId}/download`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.dismiss();
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${userProfile.firstName}_${userProfile.lastName}_CV.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CV downloaded successfully');
    } catch (error: any) {
      toast.dismiss();
      console.error('Failed to download CV:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to download this CV');
      } else if (error.response?.status === 404) {
        toast.error('CV not found');
      } else {
        toast.error('Failed to download CV');
      }
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      student: 'bg-blue-500',
      alumni: 'bg-emerald-500',
      employer: 'bg-purple-500',
      admin: 'bg-red-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
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

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist or has been removed.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="flex justify-center mb-4 md:mb-0">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {userProfile.profile?.avatar ? (
                      <img 
                        src={userProfile.profile.avatar} 
                        alt={`${userProfile.firstName} ${userProfile.lastName}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getRoleColor(userProfile.role)}`}></div>
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left">
                  {userProfile.firstName} {userProfile.lastName}
                </h1>
                <p className="text-gray-600 capitalize text-center md:text-left">{userProfile.role}</p>
                
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 text-sm text-gray-500">
                  {userProfile.profile?.location && (
                    <div className="flex items-center justify-center md:justify-start space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{userProfile.profile.location}</span>
                    </div>
                  )}
                  
                  {userProfile.role === 'student' || userProfile.role === 'alumni' ? (
                    userProfile.profile?.university && (
                      <div className="flex items-center justify-center md:justify-start space-x-1 mt-1 md:mt-0">
                        <GraduationCap className="h-4 w-4" />
                        <span>{userProfile.profile.university}</span>
                      </div>
                    )
                  ) : userProfile.role === 'employer' && userProfile.profile?.company ? (
                    <div className="flex items-center justify-center md:justify-start space-x-1 mt-1 md:mt-0">
                      <Briefcase className="h-4 w-4" />
                      <span>{userProfile.profile.company}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center justify-center md:justify-end space-x-3">
              {userId !== currentUser?._id && (
                <>
                  <FollowButton 
                    userId={userId || ''} 
                    isFollowing={isFollowing} 
                    onFollowChange={handleFollowChange}
                    size="md"
                  />
                  
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex space-x-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userProfile.postsCount}</p>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userProfile.followersCount}</p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userProfile.followingCount}</p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
            </div>
            
            {userProfile.hasCV && (userProfile.role === 'student' || userProfile.role === 'alumni') && (
              <button
                onClick={handleDownloadCV}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download CV</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'about'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              About
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'posts' ? (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">
                  {userProfile._id === currentUser?._id
                    ? 'Share your thoughts, achievements, or career updates'
                    : `${userProfile.firstName} hasn't posted anything yet`
                  }
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <PostCard post={post} onDelete={() => fetchUserPosts()} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
              <p className="text-gray-700">
                {userProfile.profile?.bio || 'No bio provided'}
              </p>
            </div>
            
            {/* Education/Experience */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {userProfile.role === 'student' || userProfile.role === 'alumni' ? 'Education' : 'Experience'}
              </h3>
              
              {userProfile.role === 'student' || userProfile.role === 'alumni' ? (
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {userProfile.profile?.university || 'University not specified'}
                    </p>
                    {userProfile.profile?.graduationYear && (
                      <p className="text-sm text-gray-600">
                        Class of {userProfile.profile.graduationYear}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {userProfile.profile?.position || 'Position not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {userProfile.profile?.company || 'Company not specified'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Skills */}
            {userProfile.profile?.skills && userProfile.profile.skills.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect</h3>
              <div className="space-y-3">
                {userProfile.profile?.linkedin && (
                  <a 
                    href={userProfile.profile.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                {userProfile.profile?.github && (
                  <a 
                    href={userProfile.profile.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>GitHub Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                {userProfile.profile?.website && (
                  <a 
                    href={userProfile.profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Personal Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                {!userProfile.profile?.linkedin && !userProfile.profile?.github && !userProfile.profile?.website && (
                  <p className="text-gray-500">No social links provided</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostCard from '../../components/social/PostCard';
import CVUploader from '../../components/social/CVUploader';
import ProfilePictureUpload from '../../components/user/ProfilePictureUpload';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Edit, 
  Save, 
  X, 
  Plus,
  MessageSquare
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

interface CV {
  _id: string;
  originalName: string;
  fileSize: number;
  fileUrl: string;
  visibility: string;
  downloadCount: number;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [cv, setCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    profile: {
      avatar: user?.profile?.avatar || '',
      bio: user?.profile?.bio || '',
      skills: user?.profile?.skills || [],
      university: user?.profile?.university || '',
      graduationYear: user?.profile?.graduationYear || '',
      company: user?.profile?.company || '',
      position: user?.profile?.position || '',
      location: user?.profile?.location || '',
      linkedin: user?.profile?.linkedin || '',
      github: user?.profile?.github || '',
      website: user?.profile?.website || ''
    }
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user posts
      try {
        const postsRes = await axios.get(`/posts/user/${user?._id}`);
        setPosts(postsRes.data.posts || []);
      } catch (error) {
        console.error('Failed to load posts data:', error);
      }
      
      // Fetch CV
      try {
        const cvRes = await axios.get('/cv/my');
        setCV(cvRes.data.cv || null);
      } catch (error) {
        console.error('Failed to load CV data:', error);
      }
      
    } catch (error) {
      console.error('Failed to load profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Error handled in context
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      profile: {
        avatar: user?.profile?.avatar || '',
        bio: user?.profile?.bio || '',
        skills: user?.profile?.skills || [],
        university: user?.profile?.university || '',
        graduationYear: user?.profile?.graduationYear || '',
        company: user?.profile?.company || '',
        position: user?.profile?.position || '',
        location: user?.profile?.location || '',
        linkedin: user?.profile?.linkedin || '',
        github: user?.profile?.github || '',
        website: user?.profile?.website || ''
      }
    });
    setIsEditing(false);
  };

  const handleAvatarUpdated = (avatarUrl: string) => {
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        avatar: avatarUrl
      }
    });
    
    // If not in edit mode, save immediately
    if (!isEditing) {
      updateProfile({
        ...formData,
        profile: {
          ...formData.profile,
          avatar: avatarUrl
        }
      }).then(() => {
        refreshUser();
      }).catch(error => {
        console.error('Error updating avatar:', error);
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.profile.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          skills: [...formData.profile.skills, newSkill.trim()]
        }
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        skills: formData.profile.skills.filter(skill => skill !== skillToRemove)
      }
    });
  };

  const handlePostCreated = async () => {
    try {
      // Fetch the updated posts
      const response = await axios.get(`/posts/user/${user?._id}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error refreshing posts after creation:', error);
    }
  };

  const handlePostDeleted = async (postId: string) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handleCVUpdated = () => {
    fetchUserData();
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
                {isEditing ? (
                  <ProfilePictureUpload 
                    currentAvatar={user?.profile?.avatar} 
                    onAvatarUpdated={handleAvatarUpdated} 
                  />
                ) : (
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profile?.avatar ? (
                        <img 
                          src={user.profile.avatar} 
                          alt={`${user.firstName} ${user.lastName}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getRoleColor(user?.role || '')}`}></div>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 capitalize text-center md:text-left">{user?.role}</p>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center md:justify-start space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-1 mt-1 md:mt-0">
                    <Calendar className="h-4 w-4" />
                    <span>Joined January 2024</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-end space-x-2 mt-4 md:mt-0">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
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
                {/* Create Post Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <CreatePostForm onPostCreated={handlePostCreated} />
                </motion.div>
                
                {/* Posts */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Share your thoughts, achievements, or career updates</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <PostCard post={post} onDelete={handlePostDeleted} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell us about yourself..."
                          value={formData.profile.bio}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile: {...formData.profile, bio: e.target.value}
                          })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City, Country"
                          value={formData.profile.location}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile: {...formData.profile, location: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <p className="text-gray-900">{user?.firstName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <p className="text-gray-900">{user?.lastName}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <p className="text-gray-900">
                          {user?.profile?.bio || 'No bio added yet.'}
                        </p>
                      </div>

                      {user?.profile?.location && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{user.profile.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Education & Experience */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {user?.role === 'student' || user?.role === 'alumni' ? 'Education' : 'Experience'}
                  </h2>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      {(user?.role === 'student' || user?.role === 'alumni') ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              University
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Your university"
                              value={formData.profile.university}
                              onChange={(e) => setFormData({
                                ...formData,
                                profile: {...formData.profile, university: e.target.value}
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Graduation Year
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="2024"
                              value={formData.profile.graduationYear}
                              onChange={(e) => setFormData({
                                ...formData,
                                profile: {...formData.profile, graduationYear: parseInt(e.target.value)}
                              })}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Your company"
                              value={formData.profile.company}
                              onChange={(e) => setFormData({
                                ...formData,
                                profile: {...formData.profile, company: e.target.value}
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Position
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Your position"
                              value={formData.profile.position}
                              onChange={(e) => setFormData({
                                ...formData,
                                profile: {...formData.profile, position: e.target.value}
                              })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(user?.role === 'student' || user?.role === 'alumni') ? (
                        <>
                          <div className="flex items-center space-x-3">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {user?.profile?.university || 'University not specified'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Class of {user?.profile?.graduationYear || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3">
                            <Briefcase className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {user?.profile?.position || 'Position not specified'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {user?.profile?.company || 'Company not specified'}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {user?.profile?.skills && user.profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No skills added yet.</p>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.profile.linkedin}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile: {...formData.profile, linkedin: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/yourusername"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.profile.github}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile: {...formData.profile, github: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Personal Website
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.profile.website}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile: {...formData.profile, website: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {user?.profile?.linkedin && (
                        <a href={user.profile.linkedin} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700">
                          LinkedIn Profile
                        </a>
                      )}
                      {user?.profile?.github && (
                        <a href={user.profile.github} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700">
                          GitHub Profile
                        </a>
                      )}
                      {user?.profile?.website && (
                        <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700">
                          Personal Website
                        </a>
                      )}
                      {!user?.profile?.linkedin && !user?.profile?.github && !user?.profile?.website && (
                        <p className="text-gray-500 text-sm">No social links added yet.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CV Uploader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CVUploader cv={cv} onCVUpdated={handleCVUpdated} />
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
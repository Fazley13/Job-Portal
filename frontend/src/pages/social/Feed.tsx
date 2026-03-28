import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostCard from '../../components/social/PostCard';
import { Users, MessageSquare, Filter, Search, Loader2 } from 'lucide-react';

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

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/posts/feed');
      console.log('Feed response:', response.data);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const filteredPosts = () => {
    if (filter === 'all' && !searchQuery) return posts;
    
    return posts.filter(post => {
      const matchesFilter = filter === 'all' || post.type === filter;
      const matchesSearch = !searchQuery || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesFilter && matchesSearch;
    });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed</h1>
          <p className="text-gray-600">See updates from your network</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CreatePostForm onPostCreated={handlePostCreated} />
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex space-x-4 overflow-x-auto pb-2 md:pb-0">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md whitespace-nowrap ${
                      filter === 'all'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Posts
                  </button>
                  <button
                    onClick={() => setFilter('text')}
                    className={`px-4 py-2 rounded-md whitespace-nowrap ${
                      filter === 'text'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setFilter('achievement')}
                    className={`px-4 py-2 rounded-md whitespace-nowrap ${
                      filter === 'achievement'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Achievements
                  </button>
                  <button
                    onClick={() => setFilter('job_update')}
                    className={`px-4 py-2 rounded-md whitespace-nowrap ${
                      filter === 'job_update'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Job Updates
                  </button>
                  <button
                    onClick={() => setFilter('article')}
                    className={`px-4 py-2 rounded-md whitespace-nowrap ${
                      filter === 'article'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Articles
                  </button>
                </div>
                
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Posts */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredPosts().length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Follow more people to see posts in your feed'
                  }
                </p>
                {!searchQuery && filter === 'all' && (
                  <button
                    onClick={() => window.location.href = '/users/search'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find People to Follow
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-6">
                {filteredPosts().map((post, index) => (
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Who to Follow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Who to Follow</h2>
              
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Find people to follow and grow your network</p>
                <button
                  onClick={() => window.location.href = '/users/search'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find People
                </button>
              </div>
            </motion.div>

            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h2>
              
              <div className="text-center py-6">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No trending topics yet</p>
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              
              <div className="text-center py-6">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming events</p>
                <button
                  onClick={() => window.location.href = '/events'}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Events
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Feed;
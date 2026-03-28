import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserCard from '../../components/social/UserCard';
import { Search, Filter, Users } from 'lucide-react';

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
  isFollowing: boolean;
}

const UserSearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    university: '',
    company: ''
  });

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        q: searchQuery
      });
      
      if (filters.role) params.append('role', filters.role);
      if (filters.university) params.append('university', filters.university);
      if (filters.company) params.append('company', filters.company);
      
      const response = await axios.get(`/users/search?${params}`);
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = () => {
    // Refresh the search results to update follow status
    handleSearch();
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find People</h1>
          <p className="text-gray-600">Search for students, alumni, and employers</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, skills, or bio..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="alumni">Alumni</option>
                  <option value="employer">Employers</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University
                </label>
                <input
                  type="text"
                  placeholder="Filter by university"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.university}
                  onChange={(e) => setFilters({...filters, university: e.target.value})}
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Filter by company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.company}
                  onChange={(e) => setFilters({...filters, company: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <UserCard user={user} onFollowChange={handleFollowChange} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </motion.div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default UserSearch;
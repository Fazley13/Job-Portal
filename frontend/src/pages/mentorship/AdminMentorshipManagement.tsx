import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  Eye,
  Filter,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Program {
  _id: string;
  title: string;
  description: string;
  topics: string[];
  duration: {
    value: number;
    unit: string;
  };
  cost: number;
  maxStudents: number;
  isActive: boolean;
  alumniId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  enrolledStudents: Array<{
    studentId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    status: string;
  }>;
  createdAt: string;
}

const AdminMentorshipManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchPrograms();
  }, [statusFilter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`/mentorship/admin/programs?${params.toString()}`);
      setPrograms(response.data.programs || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error(error.response?.data?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPrograms();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.isActive).length;
  const totalEnrollments = programs.reduce(
    (sum, p) => sum + p.enrolledStudents.filter(e => e.status === 'active').length,
    0
  );

  if (loading && !programs.length) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading mentorship programs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mentorship Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage all mentorship programs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalPrograms}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activePrograms}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <ToggleRight className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalEnrollments}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Programs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by title or description"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Programs</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600">
              No mentorship programs match your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => {
              const activeEnrollments = program.enrolledStudents.filter(
                e => e.status === 'active'
              ).length;

              return (
                <motion.div
                  key={program._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                        {program.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{program.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {program.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Alumni</p>
                          <p className="font-medium text-gray-900">
                            {program.alumniId.firstName} {program.alumniId.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">
                            {program.duration.value} {program.duration.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Enrollments</p>
                          <p className="font-medium text-gray-900">
                            {activeEnrollments}/{program.maxStudents} students
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cost</p>
                          <p className="font-medium text-gray-900">
                            {program.cost === 0 ? 'Free' : `$${program.cost}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/mentorship/programs/${program._id}`)}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>

                  {program.enrolledStudents.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Enrolled Students ({activeEnrollments})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {program.enrolledStudents
                          .filter(e => e.status === 'active')
                          .slice(0, 4)
                          .map((enrollment) => (
                            <div
                              key={enrollment.studentId._id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {enrollment.studentId.firstName} {enrollment.studentId.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{enrollment.studentId.email}</p>
                              </div>
                            </div>
                          ))}
                        {activeEnrollments > 4 && (
                          <div className="p-2 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
                            +{activeEnrollments - 4} more students
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminMentorshipManagement;
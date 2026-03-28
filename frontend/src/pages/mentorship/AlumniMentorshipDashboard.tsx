import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Plus,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  Eye,
  Edit,
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
  activeEnrollments: number;
  isFull: boolean;
  enrolledStudents: Array<{
    studentId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    enrolledAt: string;
    status: string;
    progress: number;
  }>;
  createdAt: string;
}

const AlumniMentorshipDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchPrograms();
  }, [filter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const response = await axios.get(`/mentorship/programs/alumni${statusParam}`);
      setPrograms(response.data.programs || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error(error.response?.data?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const toggleProgramStatus = async (programId: string, currentStatus: boolean) => {
    try {
      await axios.put(`/mentorship/programs/${programId}`, {
        isActive: !currentStatus
      });
      toast.success(`Program ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchPrograms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update program');
    }
  };

  const totalActiveEnrollments = programs.reduce((sum, p) => sum + (p.activeEnrollments || 0), 0);
  const activePrograms = programs.filter(p => p.isActive).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your programs...</p>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Mentorship Programs
              </h1>
              <p className="text-gray-600">
                Create and manage your mentorship programs
              </p>
            </div>
            <button
              onClick={() => navigate('/mentorship/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Program</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Programs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{programs.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalActiveEnrollments}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'inactive'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Inactive
            </button>
          </div>
        </motion.div>

        {programs.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first mentorship program to start guiding students
            </p>
            <button
              onClick={() => navigate('/mentorship/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {programs.map((program) => (
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
                      {program.isFull && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Full
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
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{program.duration.value} {program.duration.unit}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{program.activeEnrollments}/{program.maxStudents} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${program.cost}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleProgramStatus(program._id, program.isActive)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={program.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {program.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/mentorship/programs/${program._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {program.enrolledStudents && program.enrolledStudents.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Enrolled Students</h4>
                    <div className="space-y-2">
                      {program.enrolledStudents
                        .filter(e => e.status === 'active')
                        .map((enrollment) => (
                          <div
                            key={enrollment.studentId._id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {enrollment.studentId.firstName} {enrollment.studentId.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{enrollment.studentId.email}</p>
                            </div>
                            <button
                              onClick={() => navigate(`/mentorship/programs/${program._id}/content`)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              View Content
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AlumniMentorshipDashboard;

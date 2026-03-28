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
  BookOpen,
  Filter
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
  isEnrolled: boolean;
  activeEnrollments: number;
  availableSlots: number;
  alumniId: {
    _id: string;
    firstName: string;
    lastName: string;
    profile?: {
      avatar?: string;
    };
  };
  rating?: {
    average: number;
    count: number;
  };
}

const StudentMentorshipDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledProgram, setEnrolledProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [maxCost, setMaxCost] = useState('');

  useEffect(() => {
    fetchEnrolledProgram();
    fetchPrograms();
  }, []);

  const fetchEnrolledProgram = async () => {
    try {
      const response = await axios.get('/mentorship/student/my-program');
      setEnrolledProgram(response.data.program);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching enrolled program:', error);
      }
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (topicFilter) params.append('topic', topicFilter);
      if (maxCost) params.append('maxCost', maxCost);

      const response = await axios.get(`/mentorship/programs?${params.toString()}`);
      setPrograms(response.data.programs || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error(error.response?.data?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (programId: string) => {
    try {
      await axios.post(`/mentorship/programs/${programId}/enroll`);
      toast.success('Successfully enrolled in program!');
      fetchEnrolledProgram();
      fetchPrograms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll in program');
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
            Mentorship Programs
          </h1>
          <p className="text-gray-600">
            Find and join mentorship programs to accelerate your career growth
          </p>
        </motion.div>

        {enrolledProgram && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-2">Your Active Mentorship</h3>
                <p className="text-lg mb-1">{enrolledProgram.title}</p>
                <p className="text-blue-100 text-sm mb-4">
                  Mentor: {enrolledProgram.alumniId?.firstName} {enrolledProgram.alumniId?.lastName}
                </p>
                <button
                  onClick={() => navigate(`/mentorship/programs/${enrolledProgram._id}/content`)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Go to Program Content
                </button>
              </div>
              <BookOpen className="h-12 w-12 text-blue-200" />
            </div>
          </motion.div>
        )}

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
                Topic
              </label>
              <input
                type="text"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., React, Python"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Cost ($)
              </label>
              <input
                type="number"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Any"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters or check back later for new programs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs.map((program) => (
              <motion.div
                key={program._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium">
                            {program.alumniId?.firstName?.[0]}{program.alumniId?.lastName?.[0]}
                          </span>
                        </div>
                        <span>
                          {program.alumniId?.firstName} {program.alumniId?.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                  {program.availableSlots === 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Full
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{program.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {program.topics.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                  {program.topics.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{program.topics.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{program.duration.value} {program.duration.unit}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{program.availableSlots} slots left</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{program.cost === 0 ? 'Free' : `$${program.cost}`}</span>
                  </div>
                </div>

                {program.isEnrolled ? (
                  <button
                    onClick={() => navigate(`/mentorship/programs/${program._id}/content`)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Program Content
                  </button>
                ) : enrolledProgram ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                  >
                    Already Enrolled in Another Program
                  </button>
                ) : program.availableSlots === 0 ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                  >
                    Program Full
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(program._id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentMentorshipDashboard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { 
  Users, 
  Briefcase, 
  Target,
  Loader2,
  CalendarDays
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  roadmaps: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeJobs: 0,
    roadmaps: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // Fetch admin stats
      try {
        const response = await axios.get('/admin/stats');
        if (response.data && response.data.stats) {
          setStats({
            totalUsers: response.data.stats.users?.total || 0,
            activeJobs: response.data.stats.jobs?.active || 0,
            roadmaps: 0 // Not provided by API
          });
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Set default stats
        setStats({
          totalUsers: 0,
          activeJobs: 0,
          roadmaps: 0
        });
      }
      
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const systemStats = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-blue-500' },
    { label: 'Active Jobs', value: stats.activeJobs.toString(), icon: Briefcase, color: 'bg-emerald-500' },
    { label: 'Career Roadmaps', value: stats.roadmaps.toString(), icon: Target, color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading admin dashboard...</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                System Administration 🛡️
              </h1>
              <p className="text-gray-600">
                Monitor and manage the job portal platform
              </p>
            </div>
            <div>
              <Link
                to="/admin/roadmaps"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Target className="h-4 w-4" />
                <span>Manage Roadmaps</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {systemStats.map((stat, index) => {
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
            {/* Quick Admin Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Admin Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/admin/users"
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Manage Users</p>
                    <p className="text-sm text-blue-700">View and manage all users</p>
                  </div>
                </Link>
                
                <Link
                  to="/admin/jobs"
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Briefcase className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Manage Jobs</p>
                    <p className="text-sm text-green-700">Review and approve job listings</p>
                  </div>
                </Link>
                <Link
                  to="/admin/events"
                  className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <CalendarDays className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Manage Events</p>
                    <p className="text-sm text-yellow-700">Review and moderate events</p>
                   </div>
               </Link>
                
                <Link
                  to="/admin/roadmaps"
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Target className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Career Roadmaps</p>
                    <p className="text-sm text-purple-700">Create and edit career paths</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Intentionally left empty */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
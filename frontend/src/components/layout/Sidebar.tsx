import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Briefcase,
  FileText,
  Brain,
  BookOpen,
  Mic,
  Users,
  Wrench,
  Bell,
  HelpCircle,
  PlusCircle,
  List,
  Search,
  BarChart3,
  Calendar,
  MessageSquare,
  Share2,
  Settings,
  Shield,
  UserCheck,
  Target,
  MapPin,
  Rocket,
  Lightbulb,
  CalendarDays,
  Heart,
  Upload,
  UserPlus,
  Home,
  Radio,
  Building,
  GraduationCap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          { icon: User, label: 'My Profile', path: '/profile' },
          { icon: UserPlus, label: 'Network', path: '/network' },
          { icon: Briefcase, label: 'Job Search', path: '/jobs/search' },
          { icon: Building, label: 'Companies', path: '/companies' },
          { icon: FileText, label: 'Applications', path: '/applications' },
          { icon: CalendarDays, label: 'Events', path: '/events' },
          { icon: GraduationCap, label: 'Mentorship', path: '/mentorship/student' },
          { icon: Target, label: 'Career Roadmaps', path: '/roadmaps' }
        ];
      case 'alumni':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          { icon: User, label: 'My Profile', path: '/profile' },
          { icon: UserPlus, label: 'Network', path: '/network' },
          { icon: Briefcase, label: 'Job Search', path: '/jobs/search' },
          { icon: GraduationCap, label: 'Mentorship Panel', path: '/mentorship/alumni' }
        ];
      case 'employer':
        return [
            { icon: Home, label: 'Dashboard', path: '/dashboard' },
            { icon: PlusCircle, label: 'Post a Job', path: '/jobs/create' },
            { icon: List, label: 'Manage Jobs', path: '/jobs/manage' },
            { icon: Users, label: 'Applications', path: '/applications/manage' },
            { icon: Building, label: 'My Companies', path: '/companies/manage' },
            { icon: Calendar, label: 'Manage Events', path: '/events/manage' },
            // { icon: Bell, label: 'Notifications', path: '/notifications' }, // THIS LINE HAS BEEN REMOVED
            { icon: User, label: 'My Profile', path: '/profile' }
        ];
      case 'admin':
        return [
          { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
          { icon: Users, label: 'Manage Users', path: '/admin/users' },
          { icon: Briefcase, label: 'Manage Jobs', path: '/admin/jobs' },
          { icon: Building, label: 'Manage Companies', path: '/admin/companies' },
          { icon: CalendarDays, label: 'Manage Events', path: '/admin/events' },
          { icon: GraduationCap, label: 'Mentorships', path: '/admin/mentorships' },
          { icon: Target, label: 'Manage Roadmaps', path: '/admin/roadmaps' }
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <nav className="space-y-1 mt-8"> {/* Added margin-top to compensate for removed logo */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
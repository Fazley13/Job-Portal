import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  Briefcase, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  MapPin,
  Users,
  MessageSquare,
  Menu,
  X,
  Heart,
  UserPlus,
  Building
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { applicationUpdates, companyApplicationUpdates, postUpdates, followUpdates } = useSocket();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const getRoleColor = (role: string) => {
    const colors = {
      student: 'bg-blue-500',
      alumni: 'bg-emerald-500',
      employer: 'bg-purple-500',
      admin: 'bg-red-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  const totalNotifications = applicationUpdates.length + companyApplicationUpdates.length + postUpdates.length + followUpdates.length;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JobPortal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/jobs/search"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search Jobs</span>
            </Link>
            
            <Link
              to="/users/search"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Find People</span>
            </Link>
            
            <Link
              to="/companies"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Building className="h-4 w-4" />
              <span>Companies</span>
            </Link>
            
            {user.role !== 'admin' && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Feed</span>
              </Link>
            )}

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  
                  {totalNotifications === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {/* Follow Updates */}
                      {followUpdates.map((update) => (
                        <div key={update.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <UserPlus className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{update.message}</p>
                              <p className="text-xs text-gray-500">{update.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Company Application Updates */}
                      {companyApplicationUpdates.map((update) => (
                        <div key={update.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-orange-500" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{update.message}</p>
                              {update.companyName && (
                                <p className="text-xs text-gray-600 mt-1">{update.companyName}</p>
                              )}
                              <p className="text-xs text-gray-500">{update.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Post Updates */}
                      {postUpdates.map((update) => (
                        <div key={update.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{update.message}</p>
                              {update.content && (
                                <p className="text-xs text-gray-600 mt-1">{update.content}</p>
                              )}
                              <p className="text-xs text-gray-500">{update.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      
                      ))}

                      {/* Application Updates */}
                      {applicationUpdates.map((update) => (
                        <div key={update.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-purple-500" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{update.message}</p>
                              {update.jobTitle && (
                                <p className="text-xs text-gray-600 mt-1">{update.jobTitle}</p>
                              )}
                              <p className="text-xs text-gray-500">{update.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getRoleColor(user.role)}`}></div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 py-3 space-y-1">
              <Link
                to="/jobs/search"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                <span>Search Jobs</span>
              </Link>
              <Link
                to="/users/search"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                <span>Find People</span>
              </Link>
              <Link
                to="/companies"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building className="h-4 w-4" />
                <span>Companies</span>
              </Link>
              {user.role !== 'admin' && (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Feed</span>
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
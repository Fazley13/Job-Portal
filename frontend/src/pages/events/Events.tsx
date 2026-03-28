import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  CalendarDays,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  Ticket,
  Star,
  Heart,
  Share2,
  CalendarPlus,
  Briefcase,
  Brain,
  Network,
  Trophy,
  GraduationCap,
  Building,
  Presentation,
  Video,
  Coffee,
  Globe,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  organizer: string;
  type: string;
  startDateTime: string;
  endDateTime: string;
  isOnline: boolean;
  location?: string;
  onlineLink?: string;
  registrationLink: string;
  tags: string[];
  status: string;
  registrationDeadline?: string;
  postedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    profile?: {
      company?: string;
    };
  };
  createdAt: string;
}

const Events: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newEventPosted', (eventData) => {
        toast.success(`New event posted: ${eventData.title}`);
        fetchEvents(); // Refresh event list
      });

      return () => {
        socket.off('newEventPosted');
      };
    }
  }, [socket]);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, selectedType, selectedStatus, locationFilter, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(selectedType && { type: selectedType }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(locationFilter && { isOnline: locationFilter })
      });

      const response = await axios.get(`/events?${params}`);
      setEvents(response.data.events);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = !selectedType || event.type === selectedType;
      const matchesStatus = !selectedStatus || event.status === selectedStatus;
      const matchesLocation = !locationFilter || 
                             (locationFilter === 'true' && event.isOnline) ||
                             (locationFilter === 'false' && !event.isOnline);
      
      return matchesSearch && matchesType && matchesStatus && matchesLocation;
    });

    setFilteredEvents(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const getEventIcon = (type: string) => {
    const icons = {
      'job-fair': Briefcase,
      'workshop': Brain,
      'networking': Network,
      'hackathon': Trophy,
      'seminar': GraduationCap,
      'webinar': Video,
      'other': CalendarDays
    };
    return icons[type as keyof typeof icons] || CalendarDays;
  };

  const getEventColor = (type: string) => {
    const colors = {
      'job-fair': 'bg-blue-500',
      'workshop': 'bg-purple-500',
      'networking': 'bg-emerald-500',
      'hackathon': 'bg-yellow-500',
      'seminar': 'bg-red-500',
      'webinar': 'bg-teal-500',
      'other': 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'upcoming': 'bg-blue-100 text-blue-800',
      'ongoing': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = (registrationLink: string) => {
    window.open(registrationLink, '_blank');
  };

  // Check if current user is the event creator
  const isEventCreator = (event: Event) => {
    return user?._id === event.postedBy._id;
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

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Opportunities</h1>
              <p className="text-gray-600">
                Discover career events, workshops, and networking opportunities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
              {(user?.role === 'employer' || user?.role === 'admin') && (
                <button 
                  onClick={() => navigate('/events/create')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Create Event</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events, topics, or organizers..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search Events
              </button>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
              >
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="job-fair">Job Fair</option>
                  <option value="workshop">Workshop</option>
                  <option value="networking">Networking</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="seminar">Seminar</option>
                  <option value="webinar">Webinar</option>
                  <option value="other">Other</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">All Locations</option>
                  <option value="true">Online Events</option>
                  <option value="false">In-Person Events</option>
                </select>

                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sort by Date</option>
                  <option>Sort by Popularity</option>
                  <option>Sort by Type</option>
                </select>
              </motion.div>
            )}
          </form>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredEvents.length} of {events.length} events</span>
          </div>
        </motion.div>

        {/* Events Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredEvents.map((event, index) => {
            const EventIcon = getEventIcon(event.type);
            const eventColor = getEventColor(event.type);
            const isCreator = isEventCreator(event);
            
            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer ${
                  viewMode === 'list' ? 'p-6' : 'overflow-hidden'
                }`}
                onClick={() => navigate(`/events/${event._id}`)}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Event Header */}
                    <div className={`relative h-32 ${eventColor} flex items-center justify-center`}>
                      <EventIcon className="h-12 w-12 text-white" />
                      <div className="absolute top-4 left-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        {isCreator && (
                          <span className="px-2 py-1 bg-white/90 text-gray-800 text-xs font-medium rounded-full">
                            Your Event
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                        >
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                        >
                          <Share2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600 capitalize">{event.type.replace('-', ' ')}</span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(event.startDateTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {event.isOnline ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                          <span>{event.isOnline ? 'Online Event' : event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>By {event.organizer}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{event.tags.length - 2}</span>
                          )}
                        </div>
                        {!isCreator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegister(event.registrationLink);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Register</span>
                          </button>
                        )}
                        {isCreator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/events/manage');
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Manage</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className={`w-24 h-24 ${eventColor} rounded-lg flex items-center justify-center`}>
                        <EventIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className="text-sm text-gray-500 capitalize">{event.type.replace('-', ' ')}</span>
                        {isCreator && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Your Event
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{event.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(event.startDateTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {event.isOnline ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                          <span>{event.isOnline ? 'Online' : event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{event.organizer}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {event.tags.slice(0, 4).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 4 && (
                          <span className="text-xs text-gray-500">+{event.tags.length - 4} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      {!isCreator && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(event.registrationLink);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Register</span>
                        </button>
                      )}
                      {isCreator && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(user?.role === 'admin' ? '/admin/events' : '/events/manage');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Manage</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <CalendarDays className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all available events
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
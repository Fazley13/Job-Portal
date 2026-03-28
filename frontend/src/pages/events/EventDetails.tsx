import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  Building, 
  Star, 
  ExternalLink,
  Calendar,
  Globe,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  CalendarDays,
  Brain,
  Network,
  Trophy,
  GraduationCap,
  Briefcase,
  Video,
  Edit,
  Eye
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
      website?: string;
    };
  };
  createdAt: string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/events/${id}`);
      setEvent(response.data.event);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = () => {
    if (event?.registrationLink) {
      window.open(event.registrationLink, '_blank');
    }
  };

  const handleJoinEvent = () => {
    if (event?.onlineLink) {
      window.open(event.onlineLink, '_blank');
    }
  };

  // Check if current user is the event creator
  const isEventCreator = event && user?._id === event.postedBy._id;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </DashboardLayout>
    );
  }

  const EventIcon = getEventIcon(event.type);
  const eventColor = getEventColor(event.type);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Event Creator Notice */}
        {isEventCreator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <p className="text-blue-800">
                  You are the creator of this event. You can manage it from your events dashboard.
                </p>
              </div>
              <button
                onClick={() => navigate('/events/manage')}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Edit className="h-3 w-3" />
                <span>Manage</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-lg p-6 shadow-sm border mb-8 ${
            isEventCreator ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`w-16 h-16 rounded-lg ${eventColor} flex items-center justify-center`}>
                <EventIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  {isEventCreator && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Your Event
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{event.organizer}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span className="capitalize">{event.type.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatDateTime(event.startDateTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    {event.isOnline ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    <span>{event.isOnline ? 'Online Event' : event.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {new Date(event.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>By {event.postedBy.firstName} {event.postedBy.lastName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 text-blue-600 font-semibold">
                <Calendar className="h-5 w-5" />
                <span>
                  {formatDateTime(event.startDateTime)} - {formatDateTime(event.endDateTime)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {event.status === 'ongoing' && event.isOnline && event.onlineLink && !isEventCreator && (
                <button
                  onClick={handleJoinEvent}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Join Event</span>
                </button>
              )}
              {!isEventCreator && (
                <button
                  onClick={handleRegister}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Register Now</span>
                </button>
              )}
              {isEventCreator && (
                <button
                  onClick={() => navigate('/events/manage')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Manage Event</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            </motion.div>

            {/* Event Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Schedule</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Start Time</p>
                    <p className="text-sm text-gray-600">{formatDateTime(event.startDateTime)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">End Time</p>
                    <p className="text-sm text-gray-600">{formatDateTime(event.endDateTime)}</p>
                  </div>
                </div>
                {event.registrationDeadline && (
                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">Registration Deadline</p>
                      <p className="text-sm text-gray-600">{formatDateTime(event.registrationDeadline)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Location/Access Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {event.isOnline ? 'Access Information' : 'Location'}
              </h2>
              <div className="space-y-3">
                {event.isOnline ? (
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Online Event</p>
                      <p className="text-sm text-gray-600 mb-2">
                        This is a virtual event. Access details will be provided after registration.
                      </p>
                      {event.onlineLink && event.status === 'ongoing' && !isEventCreator && (
                        <button
                          onClick={handleJoinEvent}
                          className="inline-flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Join Event</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Venue</p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center space-x-1"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium">{event.organizer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted by:</span>
                  <span className="font-medium">{event.postedBy.firstName} {event.postedBy.lastName}</span>
                </div>
                {event.postedBy.profile?.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{event.postedBy.profile.company}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Type:</span>
                  <span className="font-medium capitalize">{event.type.replace('-', ' ')}</span>
                </div>
              </div>
              
              {event.postedBy.profile?.website && (
                <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Visit Website
                </button>
              )}
            </motion.div>

            {/* Registration Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-lg p-6 border ${
                isEventCreator
                  ? 'bg-blue-50 border-blue-200'
                  : event.status === 'closed' 
                    ? 'bg-gray-50 border-gray-200'
                    : event.status === 'ongoing' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-blue-50 border-blue-200'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isEventCreator
                  ? 'Event Management'
                  : event.status === 'closed' 
                    ? 'Event Ended' 
                    : event.status === 'ongoing' 
                      ? 'Event in Progress' 
                      : 'Ready to Join?'
                }
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isEventCreator
                  ? 'You are the creator of this event. Manage it from your events dashboard.'
                  : event.status === 'closed' 
                    ? 'This event has ended. Check out other upcoming events.'
                    : event.status === 'ongoing' 
                      ? 'This event is currently in progress. You can still register or join if it\'s online.'
                      : 'Register now to secure your spot at this event.'
                }
              </p>
              
              <div className="space-y-3">
                {isEventCreator ? (
                  <button
                    onClick={() => navigate('/events/manage')}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Edit className="h-5 w-5" />
                      <span>Manage Event</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      event.status === 'closed'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={event.status === 'closed'}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ExternalLink className="h-5 w-5" />
                      <span>
                        {event.status === 'closed' ? 'Registration Closed' : 'Register Now'}
                     </span>
                </div>
        </button>
    )}

    {!isEventCreator && event.status === 'ongoing' && event.isOnline && event.onlineLink && (
      <button
        onClick={handleJoinEvent}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        <div className="flex items-center justify-center space-x-2">
          <ExternalLink className="h-5 w-5" />
          <span>Join Event Now</span>
        </div>
      </button>
    )}
  </div>
  
    {!isEventCreator && event.status !== 'closed' && (
    <p className="text-xs text-gray-500 mt-2 text-center">
      Registration is handled externally
    </p>
  )}
    </motion.div>
    </div>
   </div>
    </div>
    </DashboardLayout>
  );
};

export default EventDetails;
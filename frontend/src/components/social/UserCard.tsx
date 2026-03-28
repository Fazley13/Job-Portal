import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Briefcase, GraduationCap, MapPin, ExternalLink } from 'lucide-react';
import FollowButton from './FollowButton';

interface UserCardProps {
  user: {
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
    isFollowing?: boolean;
  };
  onFollowChange?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollowChange }) => {
  const { user: currentUser } = useAuth();

  const getRoleIcon = () => {
    switch (user.role) {
      case 'student':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'alumni':
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case 'employer':
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case 'admin':
        return <User className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <Link to={`/users/${user._id}`}>
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {user.profile?.avatar ? (
              <img 
                src={user.profile.avatar} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="w-16 h-16 object-cover"
              />
            ) : (
              <span className="text-xl font-medium text-gray-700">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </div>
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link to={`/users/${user._id}`} className="text-lg font-medium text-gray-900 hover:underline">
              {user.firstName} {user.lastName}
            </Link>
            
            {user._id !== currentUser?._id && (
              <FollowButton 
                userId={user._id} 
                isFollowing={!!user.isFollowing} 
                onFollowChange={onFollowChange}
                size="sm"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            {getRoleIcon()}
            <span className="capitalize">{user.role}</span>
            
            {user.role === 'student' || user.role === 'alumni' ? (
              user.profile?.university && (
                <>
                  <span>•</span>
                  <span>{user.profile.university}</span>
                </>
              )
            ) : user.role === 'employer' && user.profile?.company ? (
              <>
                <span>•</span>
                <span>{user.profile.company}</span>
              </>
            ) : null}
          </div>
          
          {user.profile?.location && (
            <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
              <MapPin className="h-3 w-3" />
              <span>{user.profile.location}</span>
            </div>
          )}
          
          {user.profile?.bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{user.profile.bio}</p>
          )}
          
          {user.profile?.skills && user.profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.profile.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {user.profile.skills.length > 3 && (
                <span className="text-xs text-gray-500">+{user.profile.skills.length - 3} more</span>
              )}
            </div>
          )}
          
          <div className="mt-3">
            <Link 
              to={`/users/${user._id}`}
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
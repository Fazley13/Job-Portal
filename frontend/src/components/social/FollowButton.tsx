import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  userId, 
  isFollowing, 
  onFollowChange,
  size = 'md',
  className = ''
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setIsLoading(true);
      
      if (following) {
        await axios.delete(`/follow/${userId}`);
        toast.success('Unfollowed successfully');
      } else {
        await axios.post(`/follow/${userId}`);
        toast.success('Now following');
      }
      
      setFollowing(!following);
      if (onFollowChange) onFollowChange();
    } catch (error: any) {
      console.error('Follow toggle error:', error);
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`flex items-center space-x-1 rounded-md ${getSizeClasses()} ${
        following
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } transition-colors ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : following ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
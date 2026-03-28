import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, X, Camera, User } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  onAvatarUpdated: (avatarUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  currentAvatar, 
  onAvatarUpdated 
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF and WEBP images are allowed');
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      setIsUploading(true);
      
      // In a real implementation, you would upload to your server
      // For now, we'll simulate a successful upload with a placeholder URL
      // const response = await axios.post('/api/users/avatar', formData);
      // const avatarUrl = response.data.avatarUrl;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const avatarUrl = URL.createObjectURL(file);
      
      onAvatarUpdated(avatarUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
      setPreviewUrl(currentAvatar || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!previewUrl) return;
    
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    
    try {
      setIsUploading(true);
      
      // In a real implementation, you would call your API
      // await axios.delete('/api/users/avatar');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreviewUrl(null);
      onAvatarUpdated('');
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Remove avatar error:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt={`${user?.firstName} ${user?.lastName}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-16 w-16 text-gray-400" />
          )}
        </div>
        
        <div className="absolute bottom-0 right-0 flex space-x-2">
          <label 
            htmlFor="avatar-upload" 
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <Camera className="h-4 w-4 text-white" />
          </label>
          
          {previewUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        id="avatar-upload"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {isUploading && (
        <div className="text-sm text-gray-600 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span>Uploading...</span>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Click the camera icon to upload a profile picture
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
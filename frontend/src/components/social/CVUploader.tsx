import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, X, FileText, Download, Eye, EyeOff, Trash2, UserPlus } from 'lucide-react';

interface CVUploaderProps {
  cv?: {
    _id: string;
    originalName: string;
    fileSize: number;
    fileUrl: string;
    visibility: string;
    downloadCount: number;
    createdAt: string;
  } | null;
  onCVUpdated: () => void;
}

const CVUploader: React.FC<CVUploaderProps> = ({ cv, onCVUpdated }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [visibility, setVisibility] = useState(cv?.visibility || 'followers');
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUploadCV = user?.role === 'student' || user?.role === 'alumni';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('visibility', visibility);
    
    try {
      setIsUploading(true);
      await axios.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('CV uploaded successfully');
      onCVUpdated();
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error('Failed to upload CV');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleVisibilityChange = async (newVisibility: string) => {
    if (!cv) return;
    
    try {
      setIsUpdatingVisibility(true);
      await axios.put(`/cv/${cv._id}/visibility`, {
        visibility: newVisibility
      });
      
      setVisibility(newVisibility);
      toast.success('CV visibility updated');
      onCVUpdated();
    } catch (error) {
      console.error('Update visibility error:', error);
      toast.error('Failed to update visibility');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleDelete = async () => {
    if (!cv) return;
    
    if (!window.confirm('Are you sure you want to delete your CV?')) {
      return;
    }
    
    try {
      await axios.delete(`/cv/${cv._id}`);
      toast.success('CV deleted successfully');
      onCVUpdated();
    } catch (error) {
      console.error('Delete CV error:', error);
      toast.error('Failed to delete CV');
    }
  };

  const handleDownloadCV = async () => {
    if (!cv) return;
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      toast.loading('Preparing download...');
      
      // Make a direct request to download the CV
      const response = await axios.get(`/cv/${cv._id}/download`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.dismiss();
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', cv.originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CV downloaded successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Download CV error:', error);
      toast.error('Failed to download CV');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!canUploadCV) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">CV Upload</h3>
          <p className="text-sm text-gray-500">
            CV upload is only available for students and alumni.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume/CV</h3>
      
      {!cv ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">Upload your resume or CV</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
            id="cv-upload"
          />
          <label
            htmlFor="cv-upload"
            className={`inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </label>
          <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 5MB</p>
        </div>
      ) : (
        <div>
          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{cv.originalName}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{formatFileSize(cv.fileSize)}</span>
                  <span>•</span>
                  <span>Uploaded {formatDate(cv.createdAt)}</span>
                  <span>•</span>
                  <span>{cv.downloadCount} downloads</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleDownloadCV}
                className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50"
                title="Download CV"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                title="Delete CV"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => handleVisibilityChange('public')}
                  disabled={isUpdatingVisibility}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="visibility"
                  value="followers"
                  checked={visibility === 'followers'}
                  onChange={() => handleVisibilityChange('followers')}
                  disabled={isUpdatingVisibility}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Followers Only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => handleVisibilityChange('private')}
                  disabled={isUpdatingVisibility}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Private</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              {visibility === 'public' ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Everyone can view and download your CV
                </>
              ) : visibility === 'followers' ? (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Only your followers can view and download your CV
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Only you can view and download your CV
                </>
              )}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
              id="cv-update"
            />
            <label
              htmlFor="cv-update"
              className={`inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload New Version'}
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVUploader;
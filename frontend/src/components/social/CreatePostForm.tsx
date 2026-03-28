import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MessageSquare, Briefcase, Award, FileText, Tag, Plus, X, Globe, Users, Lock } from 'lucide-react';
import Send from './Send';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await axios.post('/posts', {
        content: content.trim(),
        type: postType,
        tags,
        visibility
      });
      
      // Reset form
      setContent('');
      setPostType('text');
      setTags([]);
      setNewTag('');
      setVisibility('public');
      
      toast.success('Post created successfully!');
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          {user?.profile?.avatar ? (
            <img 
              src={user.profile.avatar} 
              alt={`${user.firstName} ${user.lastName}`} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-gray-700">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder={`What's on your mind, ${user?.firstName}?`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <button
                  type="button"
                  onClick={() => setPostType('text')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                    postType === 'text' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Text</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPostType('achievement')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                    postType === 'achievement' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Award className="h-3 w-3" />
                  <span>Achievement</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPostType('job_update')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                    postType === 'job_update' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Briefcase className="h-3 w-3" />
                  <span>Job Update</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPostType('article')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                    postType === 'article' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>Article</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="relative">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="followers">Followers</option>
                      <option value="connections">Connections</option>
                    </select>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {visibility === 'public' ? (
                        <Globe className="h-3 w-3 text-gray-500" />
                      ) : visibility === 'followers' ? (
                        <Users className="h-3 w-3 text-gray-500" />
                      ) : (
                        <Lock className="h-3 w-3 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Add tag"
                    className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Tag className="h-3 w-3 text-gray-500" />
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className={`px-4 py-1 rounded-md text-sm font-medium flex items-center space-x-1 ${
                    !content.trim() || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Tip: Press Ctrl+Enter to post
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
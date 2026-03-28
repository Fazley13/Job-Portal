import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2, Calendar, Tag, Briefcase, Award, FileText, Target } from 'lucide-react';
import Send from './Send';

interface PostCardProps {
  post: {
    _id: string;
    content: string;
    type: string;
    author: {
      _id: string;
      firstName: string;
      lastName: string;
      role: string;
      profile?: {
        avatar?: string;
      }
    };
    createdAt: string;
    tags: string[];
    likes: Array<{ user: string }>;
    comments: Array<{
      _id: string;
      user: {
        _id: string;
        firstName: string;
        lastName: string;
        profile?: {
          avatar?: string;
        }
      };
      content: string;
      createdAt: string;
    }>;
  };
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like.user === user?._id));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleLike = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/like`);
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      const response = await axios.post(`/posts/${post._id}/comment`, {
        content: commentText.trim()
      });
      
      setComments([...comments, response.data.comment]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`/posts/${post._id}`);
      toast.success('Post deleted successfully');
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPostTypeIcon = () => {
    switch (post.type) {
      case 'achievement':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'job_update':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'career_milestone':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'article':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPostTypeLabel = () => {
    switch (post.type) {
      case 'achievement':
        return 'Achievement';
      case 'job_update':
        return 'Job Update';
      case 'career_milestone':
        return 'Career Milestone';
      case 'article':
        return 'Article';
      default:
        return 'Post';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Link to={`/users/${post.author._id}`}>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {post.author.profile?.avatar ? (
                <img 
                  src={post.author.profile.avatar} 
                  alt={`${post.author.firstName} ${post.author.lastName}`} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {post.author.firstName[0]}{post.author.lastName[0]}
                </span>
              )}
            </div>
          </Link>
          <div>
            <Link to={`/users/${post.author._id}`} className="font-medium text-gray-900 hover:underline">
              {post.author.firstName} {post.author.lastName}
            </Link>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="capitalize">{post.author.role}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                {getPostTypeIcon()}
                <span>{getPostTypeLabel()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {(post.author._id === user?._id || user?.role === 'admin') && (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  onClick={handleDeletePost}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Post Content */}
      <div className="mb-3">
        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
      </div>
      
      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{comments.length}</span>
          </button>
          
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
          
          {/* Comment List */}
          <div className="space-y-3 mb-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2">
                  <Link to={`/users/${comment.user._id}`}>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.user.profile?.avatar ? (
                        <img 
                          src={comment.user.profile.avatar} 
                          alt={`${comment.user.firstName} ${comment.user.lastName}`} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-700">
                          {comment.user.firstName[0]}{comment.user.lastName[0]}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Link to={`/users/${comment.user._id}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {comment.user.firstName} {comment.user.lastName}
                      </Link>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.profile?.avatar ? (
                <img 
                  src={user.profile.avatar} 
                  alt={`${user.firstName} ${user.lastName}`} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-gray-700">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1 relative">
              <textarea
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className={`absolute right-2 top-2 p-1 rounded-full ${
                  !commentText.trim() || isSubmittingComment
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  FileText,
  Link as LinkIcon,
  Upload,
  Download,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Content {
  _id: string;
  title: string;
  description?: string;
  type: 'file' | 'link' | 'text' | 'assignment';
  content: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    linkUrl?: string;
    textContent?: string;
  };
  postedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt: string;
}

interface Program {
  _id: string;
  title: string;
  description: string;
  alumniId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const ProgramContent: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contentType, setContentType] = useState<'file' | 'link' | 'text'>('text');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    linkUrl: '',
    textContent: '',
    file: null as File | null
  });

  useEffect(() => {
    if (programId) {
      fetchProgram();
      fetchContents();
    }
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const response = await axios.get(`/mentorship/programs/${programId}`);
      setProgram(response.data.program);
    } catch (error: any) {
      console.error('Error fetching program:', error);
      toast.error('Failed to load program details');
    }
  };

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/mentorship/programs/${programId}/content`);
      setContents(response.data.content || []);
    } catch (error: any) {
      console.error('Error fetching contents:', error);
      toast.error('Failed to load program content');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', contentType);

      if (formData.description) {
        data.append('description', formData.description);
      }

      if (contentType === 'file' && formData.file) {
        data.append('file', formData.file);
      } else if (contentType === 'link' && formData.linkUrl) {
        data.append('content', JSON.stringify({ linkUrl: formData.linkUrl }));
      } else if (contentType === 'text' && formData.textContent) {
        data.append('content', JSON.stringify({ textContent: formData.textContent }));
      }

      await axios.post(`/mentorship/programs/${programId}/content`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Content added successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        linkUrl: '',
        textContent: '',
        file: null
      });
      fetchContents();
    } catch (error: any) {
      console.error('Error adding content:', error);
      toast.error(error.response?.data?.message || 'Failed to add content');
    } finally {
      setUploading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8080${fileUrl}`;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading program content...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          {program && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {program.title}
              </h1>
              <p className="text-gray-600">
                Mentor: {program.alumniId?.firstName} {program.alumniId?.lastName}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Program Materials</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Content</span>
            </button>
          </div>

          {contents.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-600 mb-6">
                Start sharing materials, links, and resources with your {user?.role === 'alumni' ? 'student' : 'mentor'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Content
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {contents.map((content) => (
                <motion.div
                  key={content._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        {getContentIcon(content.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {content.title}
                        </h3>
                        {content.description && (
                          <p className="text-gray-600 text-sm mb-2">{content.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Posted by {content.postedBy.firstName} {content.postedBy.lastName}
                          </span>
                          <span>•</span>
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{content.type}</span>
                        </div>

                        {content.type === 'file' && content.content.fileName && (
                          <div className="mt-3 flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{content.content.fileName}</span>
                            {content.content.fileSize && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-500">
                                  {formatFileSize(content.content.fileSize)}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {content.type === 'link' && content.content.linkUrl && (
                          <a
                            href={content.content.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="text-sm">{content.content.linkUrl}</span>
                          </a>
                        )}

                        {content.type === 'text' && content.content.textContent && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {content.content.textContent}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {content.type === 'file' && content.content.fileUrl && (
                      <button
                        onClick={() => handleDownload(content.content.fileUrl!, content.content.fileName!)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Content</h2>

              <form onSubmit={handleAddContent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setContentType('text')}
                      className={`flex-1 px-4 py-2 rounded-lg ${
                        contentType === 'text'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType('link')}
                      className={`flex-1 px-4 py-2 rounded-lg ${
                        contentType === 'link'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType('file')}
                      className={`flex-1 px-4 py-2 rounded-lg ${
                        contentType === 'file'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      File
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description"
                  />
                </div>

                {contentType === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={formData.textContent}
                      onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your content here"
                      required
                    />
                  </div>
                )}

                {contentType === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                )}

                {contentType === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                      />
                      {formData.file && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected: {formData.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        title: '',
                        description: '',
                        linkUrl: '',
                        textContent: '',
                        file: null
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>Add Content</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProgramContent;
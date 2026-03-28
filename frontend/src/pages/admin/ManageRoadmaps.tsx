import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Target, 
  Clock, 
  TrendingUp,
  Award,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap
} from 'lucide-react';

interface Skill {
  name: string;
  description: string;
  estimatedHours: number;
  resources: string[];
}

interface Phase {
  name: string;
  description: string;
  duration: string;
  skills: Skill[];
  milestones: string[];
}

interface CareerPath {
  _id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  salary: string;
  growth: string;
  category: string;
  tags: string[];
  phases: Phase[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  popularity: number;
  totalStudents: number;
  averageRating: number;
  completionRate: number;
}

const ManageRoadmaps: React.FC = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<CareerPath | null>(null);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<Partial<CareerPath>>({
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    salary: '',
    growth: '',
    category: 'Technology',
    tags: [],
    phases: [],
    isActive: true
  });

  const [newPhase, setNewPhase] = useState<Partial<Phase>>({
    name: '',
    description: '',
    duration: '',
    skills: [],
    milestones: []
  });

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    description: '',
    estimatedHours: 0,
    resources: []
  });

  const [newResource, setNewResource] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  const [newTag, setNewTag] = useState('');

  const categories = ['Technology', 'Data Science', 'Design', 'Business', 'Security', 'AI/ML'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/roadmaps?limit=100');
      setRoadmaps(response.data.roadmaps || []);
    } catch (error: any) {
      console.error('Fetch roadmaps error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch roadmaps');
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoadmap = async () => {
    try {
      if (!formData.title || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.phases || formData.phases.length === 0) {
        toast.error('Please add at least one phase');
        return;
      }

      const response = await axios.post('/roadmaps', formData);
      
      setRoadmaps(prev => [response.data.roadmap, ...prev]);
      setIsCreating(false);
      resetForm();
      toast.success('Career roadmap created successfully!');
    } catch (error: any) {
      console.error('Create roadmap error:', error);
      toast.error(error.response?.data?.message || 'Failed to create roadmap');
    }
  };

  const handleUpdateRoadmap = async () => {
    try {
      if (!editingRoadmap) return;

      const response = await axios.put(`/roadmaps/${editingRoadmap._id}`, editingRoadmap);
      
      setRoadmaps(prev => prev.map(roadmap => 
        roadmap._id === editingRoadmap._id ? response.data.roadmap : roadmap
      ));
      
      setEditingRoadmap(null);
      toast.success('Roadmap updated successfully!');
    } catch (error: any) {
      console.error('Update roadmap error:', error);
      toast.error(error.response?.data?.message || 'Failed to update roadmap');
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (!window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/roadmaps/${roadmapId}`);
      setRoadmaps(prev => prev.filter(roadmap => roadmap._id !== roadmapId));
      toast.success('Roadmap deleted successfully');
    } catch (error: any) {
      console.error('Delete roadmap error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete roadmap');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      difficulty: 'Beginner',
      salary: '',
      growth: '',
      category: 'Technology',
      tags: [],
      phases: [],
      isActive: true
    });
    setNewPhase({
      name: '',
      description: '',
      duration: '',
      skills: [],
      milestones: []
    });
    setNewSkill({
      name: '',
      description: '',
      estimatedHours: 0,
      resources: []
    });
    setNewResource('');
    setNewMilestone('');
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const addResource = () => {
    if (newResource.trim()) {
      setNewSkill({
        ...newSkill,
        resources: [...(newSkill.resources || []), newResource.trim()]
      });
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    setNewSkill({
      ...newSkill,
      resources: newSkill.resources?.filter((_, i) => i !== index) || []
    });
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setNewPhase({
        ...newPhase,
        milestones: [...(newPhase.milestones || []), newMilestone.trim()]
      });
      setNewMilestone('');
    }
  };

  const removeMilestone = (index: number) => {
    setNewPhase({
      ...newPhase,
      milestones: newPhase.milestones?.filter((_, i) => i !== index) || []
    });
  };

  const addSkillToPhase = () => {
    if (!newSkill.name || !newSkill.description || !newSkill.estimatedHours) {
      toast.error('Please fill in all skill fields');
      return;
    }

    const skill: Skill = {
      name: newSkill.name,
      description: newSkill.description,
      estimatedHours: newSkill.estimatedHours,
      resources: newSkill.resources || []
    };

    setNewPhase({
      ...newPhase,
      skills: [...(newPhase.skills || []), skill]
    });

    setNewSkill({
      name: '',
      description: '',
      estimatedHours: 0,
      resources: []
    });
  };

  const removeSkillFromPhase = (index: number) => {
    setNewPhase({
      ...newPhase,
      skills: newPhase.skills?.filter((_, i) => i !== index) || []
    });
  };

  const addPhaseToRoadmap = () => {
    if (!newPhase.name || !newPhase.description) {
      toast.error('Please fill in phase name and description');
      return;
    }

    if (!newPhase.skills || newPhase.skills.length === 0) {
      toast.error('Please add at least one skill to the phase');
      return;
    }

    const phase: Phase = {
      name: newPhase.name,
      description: newPhase.description,
      duration: newPhase.duration || '',
      skills: newPhase.skills,
      milestones: newPhase.milestones || []
    };

    setFormData({
      ...formData,
      phases: [...(formData.phases || []), phase]
    });

    setNewPhase({
      name: '',
      description: '',
      duration: '',
      skills: [],
      milestones: []
    });

    toast.success('Phase added successfully!');
  };

  const removePhaseFromRoadmap = (index: number) => {
    setFormData({
      ...formData,
      phases: formData.phases?.filter((_, i) => i !== index) || []
    });
  };

  const toggleRoadmapExpansion = (roadmapId: string) => {
    setExpandedRoadmaps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roadmapId)) {
        newSet.delete(roadmapId);
      } else {
        newSet.add(roadmapId);
      }
      return newSet;
    });
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Career Roadmaps</h1>
              <p className="text-gray-600">Create and manage career learning paths for students</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Roadmap</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roadmaps</p>
                <p className="text-2xl font-bold text-gray-900">{roadmaps.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Roadmaps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roadmaps.filter(r => r.isActive).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Phases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roadmaps.reduce((sum, r) => sum + (r.phases?.length || 0), 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roadmaps.reduce((sum, r) => 
                    sum + (r.phases?.reduce((phaseSum, p) => phaseSum + (p.skills?.length || 0), 0) || 0), 0
                  )}
                </p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Roadmaps List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {roadmaps.map((roadmap, index) => {
              const isExpanded = expandedRoadmaps.has(roadmap._id);
              return (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{roadmap.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            roadmap.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {roadmap.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {roadmap.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {roadmap.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{roadmap.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{roadmap.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>{roadmap.salary}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span>{roadmap.growth} growth</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span>{roadmap.phases?.length || 0} phases</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {roadmap.tags?.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleRoadmapExpansion(roadmap._id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => setEditingRoadmap(roadmap)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoadmap(roadmap._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-gray-200 pt-4"
                      >
                        <h4 className="font-medium text-gray-900 mb-3">Phases</h4>
                        <div className="space-y-3">
                          {roadmap.phases?.map((phase, phaseIndex) => (
                            <div key={phaseIndex} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{phase.name}</h5>
                                <span className="text-xs text-gray-500">{phase.duration}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                              <div className="text-xs text-gray-500">
                                {phase.skills?.length || 0} skills • {phase.milestones?.length || 0} milestones
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {roadmaps.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmaps created yet</h3>
                <p className="text-gray-600 mb-4">Create your first career roadmap to help students learn</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Roadmap
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreating || editingRoadmap) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isCreating ? 'Create New Roadmap' : 'Edit Roadmap'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingRoadmap(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Basic Information */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g. 12-18 months"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the career path and what students will learn"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      >
                        {difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g. $80k - $150k"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Growth
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.growth}
                        onChange={(e) => setFormData({ ...formData, growth: e.target.value })}
                        placeholder="e.g. +22%"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phase Creation */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Learning Phase</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Phase name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPhase.name}
                        onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 3-4 months)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPhase.duration}
                        onChange={(e) => setNewPhase({ ...newPhase, duration: e.target.value })}
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Phase description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                      value={newPhase.description}
                      onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                    />

                    {/* Add Skills to Phase */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Add Skills</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <input
                          type="text"
                          placeholder="Skill name"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newSkill.description}
                          onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                        />
                        <input
                          type="number"
                          placeholder="Hours"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newSkill.estimatedHours}
                          onChange={(e) => setNewSkill({ ...newSkill, estimatedHours: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      {/* Resources */}
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add resource"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newResource}
                          onChange={(e) => setNewResource(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                        />
                        <button
                          type="button"
                          onClick={addResource}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Add Resource
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newSkill.resources?.map((resource, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full flex items-center">
                            {resource}
                            <button
                              type="button"
                              onClick={() => removeResource(idx)}
                              className="ml-1 text-gray-600 hover:text-gray-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addSkillToPhase}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add Skill
                      </button>

                      {/* Display added skills */}
                      {newPhase.skills && newPhase.skills.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-2">Added Skills:</h5>
                          <div className="space-y-2">
                            {newPhase.skills.map((skill, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                                <span className="text-sm">{skill.name} ({skill.estimatedHours}h)</span>
                                <button
                                  type="button"
                                  onClick={() => removeSkillFromPhase(idx)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add Milestones */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Milestones</h4>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add milestone"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newMilestone}
                          onChange={(e) => setNewMilestone(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                        />
                        <button
                          type="button"
                          onClick={addMilestone}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newPhase.milestones?.map((milestone, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                            {milestone}
                            <button
                              type="button"
                              onClick={() => removeMilestone(idx)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addPhaseToRoadmap}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add Phase to Roadmap
                    </button>
                  </div>

                  {/* Display added phases */}
                  {formData.phases && formData.phases.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Added Phases:</h4>
                      <div className="space-y-2">
                        {formData.phases.map((phase, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                            <div>
                              <h5 className="font-medium text-gray-900">{phase.name}</h5>
                              <p className="text-sm text-gray-600">{phase.description}</p>
                              <p className="text-xs text-gray-500">{phase.skills?.length || 0} skills • {phase.milestones?.length || 0} milestones</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhaseFromRoadmap(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingRoadmap(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={isCreating ? handleCreateRoadmap : handleUpdateRoadmap}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isCreating ? 'Create Roadmap' : 'Update Roadmap'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageRoadmaps;
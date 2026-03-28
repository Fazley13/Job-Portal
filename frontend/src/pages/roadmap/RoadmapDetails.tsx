import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Target, 
  Clock, 
  TrendingUp, 
  Award,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  CheckCircle,
  Brain,
  ArrowLeft
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

interface Roadmap {
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

interface UserProgress {
  roadmapId: string;
  userId: string;
  completedPhases: string[];
  completedSkills: string[];
  startedAt: string;
  lastUpdatedAt: string;
  isCompleted: boolean;
}

const RoadmapDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      fetchRoadmap();
      fetchUserProgress();
    }
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/roadmaps/${id}`);
      setRoadmap(response.data.roadmap);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      toast.error('Failed to load roadmap details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`/roadmaps/${id}/progress`);
      setUserProgress(response.data.progress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      // Don't show error toast as the user might not have started this roadmap yet
    }
  };

  const togglePhase = (index: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSkill = (skillId: string) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const handleStartRoadmap = async () => {
    try {
      await axios.post(`/roadmaps/${id}/start`);
      toast.success('You have started this roadmap!');
      fetchUserProgress();
    } catch (error) {
      console.error('Error starting roadmap:', error);
      toast.error('Failed to start roadmap');
    }
  };

  const handleCompleteSkill = async (phaseIndex: number, skillIndex: number) => {
    try {
      await axios.post(`/roadmaps/${id}/complete-skill`, {
        phaseIndex,
        skillIndex
      });
      toast.success('Skill marked as completed!');
      fetchUserProgress();
    } catch (error) {
      console.error('Error completing skill:', error);
      toast.error('Failed to update progress');
    }
  };

  const isSkillCompleted = (phaseIndex: number, skillIndex: number) => {
    if (!userProgress) return false;
    return userProgress.completedSkills.includes(`${phaseIndex}-${skillIndex}`);
  };

  const isPhaseCompleted = (phaseIndex: number) => {
    if (!userProgress || !roadmap) return false;
    const phase = roadmap.phases[phaseIndex];
    return phase.skills.every((_, skillIndex) => 
      isSkillCompleted(phaseIndex, skillIndex)
    );
  };

  const calculateProgress = () => {
    if (!roadmap || !userProgress) return 0;
    
    let totalSkills = 0;
    let completedSkills = 0;
    
    roadmap.phases.forEach((phase, phaseIndex) => {
      totalSkills += phase.skills.length;
      phase.skills.forEach((_, skillIndex) => {
        if (isSkillCompleted(phaseIndex, skillIndex)) {
          completedSkills++;
        }
      });
    });
    
    return totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Data Science': 'bg-purple-100 text-purple-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Business': 'bg-orange-100 text-orange-800',
      'Security': 'bg-red-100 text-red-800',
      'AI/ML': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (!roadmap) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Roadmap Not Found</h1>
          <p className="text-gray-600">The roadmap you're looking for doesn't exist or has been removed.</p>
          <Link to="/roadmap" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Roadmaps
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/roadmap"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Roadmaps</span>
          </Link>
        </div>
        
        {/* Roadmap Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{roadmap.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(roadmap.difficulty)}`}>
                  {roadmap.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{roadmap.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{roadmap.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{roadmap.salary}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-700">{roadmap.growth} growth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">{roadmap.phases?.length || 0} phases</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {roadmap.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{roadmap.totalStudents || 0} learners</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{roadmap.averageRating || 4.5}/5 rating</span>
                </div>
                <div>
                  <span>Created by {roadmap.createdBy?.firstName} {roadmap.createdBy?.lastName}</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-64 flex flex-col">
              {userProgress ? (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-blue-700">{progress}%</div>
                    <div className="text-sm text-blue-600">Completed</div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Started: {new Date(userProgress.startedAt).toLocaleDateString()}</p>
                    <p>Last updated: {new Date(userProgress.lastUpdatedAt).toLocaleDateString()}</p>
                  </div>
                  
                  <button
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => window.scrollTo({ top: document.getElementById('phases')?.offsetTop || 0, behavior: 'smooth' })}
                  >
                    Continue Learning
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Journey</h3>
                  <p className="text-sm text-gray-600 mb-4">Track your progress and access resources</p>
                  <button
                    onClick={handleStartRoadmap}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start This Roadmap
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Phases Section */}
        <div id="phases" className="space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Learning Phases
          </motion.h2>
          
          {roadmap.phases.map((phase, phaseIndex) => {
            const isExpanded = expandedPhases.has(phaseIndex);
            const isCompleted = isPhaseCompleted(phaseIndex);
            
            return (
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + phaseIndex * 0.1 }}
                className={`bg-white rounded-lg shadow-sm border ${
                  isCompleted ? 'border-green-200' : 'border-gray-200'
                } overflow-hidden`}
              >
                <div 
                  className={`p-6 cursor-pointer ${
                    isCompleted ? 'bg-green-50' : ''
                  }`}
                  onClick={() => togglePhase(phaseIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="font-semibold">{phaseIndex + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                        <p className="text-sm text-gray-600">{phase.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {isCompleted && (
                        <span className="text-sm font-medium text-green-600">Completed</span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-700 mb-4">{phase.description}</p>
                      
                      {/* Milestones */}
                      {phase.milestones && phase.milestones.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Milestones</h4>
                          <ul className="space-y-2">
                            {phase.milestones.map((milestone, milestoneIndex) => (
                              <li key={milestoneIndex} className="flex items-start space-x-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-medium text-blue-600">{milestoneIndex + 1}</span>
                                </div>
                                <span className="text-gray-700">{milestone}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Skills */}
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Skills to Learn</h4>
                      <div className="space-y-4">
                        {phase.skills.map((skill, skillIndex) => {
                          const skillId = `${phaseIndex}-${skillIndex}`;
                          const isSkillExpanded = expandedSkills.has(skillId);
                          const completed = isSkillCompleted(phaseIndex, skillIndex);
                          
                          return (
                            <div 
                              key={skillIndex} 
                              className={`border rounded-lg ${
                                completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                              }`}
                            >
                              <div 
                                className="p-4 cursor-pointer"
                                onClick={() => toggleSkill(skillId)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                    }`}>
                                      {completed ? (
                                        <CheckCircle className="h-5 w-5" />
                                      ) : (
                                        <Brain className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-900">{skill.name}</h5>
                                      <p className="text-sm text-gray-600">~{skill.estimatedHours} hours</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    {!completed && userProgress && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCompleteSkill(phaseIndex, skillIndex);
                                        }}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                      >
                                        Mark Complete
                                      </button>
                                    )}
                                    {isSkillExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {isSkillExpanded && (
                                <div className="px-4 pb-4">
                                  <div className="pt-2 border-t border-gray-200">
                                    <p className="text-gray-700 mb-4">{skill.description}</p>
                                    
                                    {skill.resources && skill.resources.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Learning Resources</h6>
                                        <ul className="space-y-2">
                                          {skill.resources.map((resource, resourceIndex) => (
                                            <li key={resourceIndex} className="flex items-center space-x-2">
                                              <ExternalLink className="h-4 w-4 text-blue-600" />
                                              <a 
                                                href={resource.startsWith('http') ? resource : '#'} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                              >
                                                {resource}
                                              </a>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoadmapDetails;
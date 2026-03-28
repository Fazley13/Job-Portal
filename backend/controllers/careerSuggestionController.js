import CareerSuggestion from '../models/CareerSuggestion.js';
import User from '../models/user.js';

// Career roadmap templates for different roles
const CAREER_TEMPLATES = {
  'Frontend Developer': {
    phases: [
      {
        name: 'Foundation Phase',
        description: 'Learn the basics of web development',
        duration: '2-3 months',
        skills: [
          {
            name: 'HTML5',
            description: 'Structure and semantic markup',
            priority: 'high',
            resources: ['MDN Web Docs', 'freeCodeCamp', 'W3Schools']
          },
          {
            name: 'CSS3',
            description: 'Styling, layouts, and responsive design',
            priority: 'high',
            resources: ['CSS Tricks', 'Flexbox Froggy', 'Grid Garden']
          },
          {
            name: 'JavaScript Fundamentals',
            description: 'Variables, functions, DOM manipulation',
            priority: 'high',
            resources: ['JavaScript.info', 'Eloquent JavaScript', 'MDN JavaScript Guide']
          }
        ],
        projects: [
          {
            name: 'Personal Portfolio Website',
            description: 'Create a responsive portfolio showcasing your work',
            difficulty: 'Beginner',
            estimatedHours: 20,
            technologies: ['HTML', 'CSS', 'JavaScript']
          },
          {
            name: 'Landing Page Clone',
            description: 'Recreate a popular website\'s landing page',
            difficulty: 'Beginner',
            estimatedHours: 15,
            technologies: ['HTML', 'CSS', 'Responsive Design']
          }
        ],
        certifications: [
          {
            name: 'Responsive Web Design',
            provider: 'freeCodeCamp',
            url: 'https://freecodecamp.org',
            priority: 'high'
          }
        ],
        jobLevels: ['Intern', 'Junior Frontend Developer'],
        milestones: ['Build first website', 'Understand responsive design', 'Basic JavaScript proficiency']
      },
      {
        name: 'Framework Mastery',
        description: 'Learn modern frontend frameworks',
        duration: '3-4 months',
        skills: [
          {
            name: 'React.js',
            description: 'Component-based UI development',
            priority: 'high',
            resources: ['React Official Docs', 'React Tutorial', 'Scrimba React Course']
          },
          {
            name: 'State Management',
            description: 'Redux, Context API, Zustand',
            priority: 'medium',
            resources: ['Redux Toolkit', 'React Context', 'Zustand Documentation']
          },
          {
            name: 'Version Control (Git)',
            description: 'Code versioning and collaboration',
            priority: 'high',
            resources: ['Git Handbook', 'GitHub Learning Lab', 'Atlassian Git Tutorials']
          }
        ],
        projects: [
          {
            name: 'Todo App with React',
            description: 'Build a full-featured todo application',
            difficulty: 'Intermediate',
            estimatedHours: 25,
            technologies: ['React', 'State Management', 'Local Storage']
          },
          {
            name: 'Weather Dashboard',
            description: 'Create a weather app using external APIs',
            difficulty: 'Intermediate',
            estimatedHours: 30,
            technologies: ['React', 'API Integration', 'Responsive Design']
          }
        ],
        certifications: [
          {
            name: 'React Developer Certification',
            provider: 'Meta',
            url: 'https://coursera.org',
            priority: 'high'
          }
        ],
        jobLevels: ['Frontend Developer', 'React Developer'],
        milestones: ['Build React applications', 'Understand component lifecycle', 'API integration']
      },
      {
        name: 'Professional Development',
        description: 'Advanced skills and professional practices',
        duration: '4-6 months',
        skills: [
          {
            name: 'TypeScript',
            description: 'Type-safe JavaScript development',
            priority: 'high',
            resources: ['TypeScript Handbook', 'TypeScript Deep Dive', 'Total TypeScript']
          },
          {
            name: 'Testing',
            description: 'Unit testing, integration testing',
            priority: 'medium',
            resources: ['Jest Documentation', 'React Testing Library', 'Cypress']
          },
          {
            name: 'Build Tools',
            description: 'Webpack, Vite, bundling optimization',
            priority: 'medium',
            resources: ['Webpack Docs', 'Vite Guide', 'Rollup Documentation']
          },
          {
            name: 'Performance Optimization',
            description: 'Code splitting, lazy loading, optimization',
            priority: 'medium',
            resources: ['Web.dev Performance', 'React Performance', 'Lighthouse']
          }
        ],
        projects: [
          {
            name: 'E-commerce Platform',
            description: 'Full-featured online store with cart and checkout',
            difficulty: 'Advanced',
            estimatedHours: 60,
            technologies: ['React', 'TypeScript', 'State Management', 'Payment Integration']
          },
          {
            name: 'Real-time Chat Application',
            description: 'Build a chat app with real-time messaging',
            difficulty: 'Advanced',
            estimatedHours: 45,
            technologies: ['React', 'WebSockets', 'Real-time Updates']
          }
        ],
        certifications: [
          {
            name: 'Advanced React Patterns',
            provider: 'Epic React',
            url: 'https://epicreact.dev',
            priority: 'medium'
          }
        ],
        jobLevels: ['Senior Frontend Developer', 'Frontend Lead', 'Full Stack Developer'],
        milestones: ['TypeScript proficiency', 'Testing expertise', 'Performance optimization']
      }
    ],
    estimatedCompletion: '9-13 months'
  },
  'Data Scientist': {
    phases: [
      {
        name: 'Mathematics & Statistics Foundation',
        description: 'Build strong mathematical foundation',
        duration: '3-4 months',
        skills: [
          {
            name: 'Statistics',
            description: 'Descriptive and inferential statistics',
            priority: 'high',
            resources: ['Khan Academy Statistics', 'Think Stats', 'Statistics for Data Science']
          },
          {
            name: 'Linear Algebra',
            description: 'Vectors, matrices, eigenvalues',
            priority: 'high',
            resources: ['3Blue1Brown Linear Algebra', 'Khan Academy', 'MIT OpenCourseWare']
          },
          {
            name: 'Python Programming',
            description: 'Programming fundamentals with Python',
            priority: 'high',
            resources: ['Python.org Tutorial', 'Automate the Boring Stuff', 'Python Crash Course']
          }
        ],
        projects: [
          {
            name: 'Statistical Analysis Project',
            description: 'Analyze a dataset using statistical methods',
            difficulty: 'Beginner',
            estimatedHours: 20,
            technologies: ['Python', 'Pandas', 'Statistics']
          }
        ],
        certifications: [
          {
            name: 'Python for Data Science',
            provider: 'IBM',
            url: 'https://coursera.org',
            priority: 'high'
          }
        ],
        jobLevels: ['Data Analyst Intern'],
        milestones: ['Python proficiency', 'Statistical thinking', 'Data manipulation basics']
      }
    ],
    estimatedCompletion: '12-18 months'
  },
  'UI/UX Designer': {
    phases: [
      {
        name: 'Design Fundamentals',
        description: 'Learn core design principles',
        duration: '2-3 months',
        skills: [
          {
            name: 'Design Principles',
            description: 'Color theory, typography, layout',
            priority: 'high',
            resources: ['Design Better', 'Refactoring UI', 'The Design of Everyday Things']
          },
          {
            name: 'Figma',
            description: 'Industry-standard design tool',
            priority: 'high',
            resources: ['Figma Academy', 'Figma Community', 'Design+Code Figma Course']
          },
          {
            name: 'User Research',
            description: 'Understanding user needs and behaviors',
            priority: 'high',
            resources: ['Nielsen Norman Group', 'UX Research Methods', 'Observing the User Experience']
          }
        ],
        projects: [
          {
            name: 'Mobile App Redesign',
            description: 'Redesign an existing mobile app interface',
            difficulty: 'Beginner',
            estimatedHours: 25,
            technologies: ['Figma', 'User Research', 'Prototyping']
          }
        ],
        certifications: [
          {
            name: 'Google UX Design Certificate',
            provider: 'Google',
            url: 'https://coursera.org',
            priority: 'high'
          }
        ],
        jobLevels: ['UI/UX Design Intern', 'Junior Designer'],
        milestones: ['Design tool proficiency', 'Understanding of UX principles', 'First design portfolio']
      }
    ],
    estimatedCompletion: '8-12 months'
  }
};

// @desc    Generate career roadmap suggestion
// @route   POST /api/career-suggestions/generate
// @access  Private
export const generateCareerSuggestion = async (req, res) => {
  try {
    const { targetRole, currentLevel, timeCommitment, currentSkills, preferences } = req.body;
    const userId = req.user.id;

    // Check if user already has a suggestion for this role
    const existingSuggestion = await CareerSuggestion.findOne({
      userId,
      targetRole,
      isActive: true
    });

    if (existingSuggestion) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active roadmap for this role. Update your existing one instead.'
      });
    }

    // Get template for the target role
    const template = CAREER_TEMPLATES[targetRole];
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap template not available for this role yet. We\'re working on it!'
      });
    }

    // Customize roadmap based on user's current skills and level
    const customizedRoadmap = customizeRoadmapForUser(template, {
      currentLevel,
      currentSkills: currentSkills || [],
      timeCommitment,
      preferences: preferences || {}
    });

    // Create career suggestion
    const careerSuggestion = await CareerSuggestion.create({
      userId,
      targetRole,
      currentLevel,
      timeCommitment,
      currentSkills: currentSkills || [],
      suggestedRoadmap: customizedRoadmap,
      preferences: preferences || {}
    });

    await careerSuggestion.populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      careerSuggestion,
      message: 'Personalized career roadmap generated successfully!'
    });
  } catch (error) {
    console.error('Generate career suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during roadmap generation',
      error: error.message
    });
  }
};

// @desc    Get user's career suggestions
// @route   GET /api/career-suggestions/my
// @access  Private
export const getMyCareerSuggestions = async (req, res) => {
  try {
    const suggestions = await CareerSuggestion.find({
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error('Get career suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update progress on roadmap item
// @route   PUT /api/career-suggestions/:id/progress
// @access  Private
export const updateProgress = async (req, res) => {
  try {
    const { phaseIndex, itemType, itemIndex, completed } = req.body;
    const suggestionId = req.params.id;

    const suggestion = await CareerSuggestion.findOne({
      _id: suggestionId,
      userId: req.user.id
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Career suggestion not found'
      });
    }

    // Update the specific item
    const phase = suggestion.suggestedRoadmap.phases[phaseIndex];
    if (!phase) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phase index'
      });
    }

    let item;
    switch (itemType) {
      case 'skill':
        item = phase.skills[itemIndex];
        break;
      case 'project':
        item = phase.projects[itemIndex];
        break;
      case 'certification':
        item = phase.certifications[itemIndex];
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid item type'
        });
    }

    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item index'
      });
    }

    // Update completion status
    item.completed = completed;
    if (completed) {
      item.completedAt = new Date();
    } else {
      item.completedAt = undefined;
    }

    // Check if phase is completed
    const allSkillsCompleted = phase.skills.every(skill => skill.completed);
    const allProjectsCompleted = phase.projects.every(project => project.completed);
    const allCertificationsCompleted = phase.certifications.every(cert => cert.completed);
    
    if (allSkillsCompleted && allProjectsCompleted && allCertificationsCompleted) {
      phase.completed = true;
      phase.completedAt = new Date();
    } else {
      phase.completed = false;
      phase.completedAt = undefined;
    }

    // Update overall progress
    suggestion.updateProgress();
    await suggestion.save();

    res.status(200).json({
      success: true,
      suggestion,
      message: `${itemType} ${completed ? 'completed' : 'marked as incomplete'}!`
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during progress update',
      error: error.message
    });
  }
};

// @desc    Get available career roles
// @route   GET /api/career-suggestions/roles
// @access  Public
export const getAvailableRoles = async (req, res) => {
  try {
    const roles = Object.keys(CAREER_TEMPLATES).map(role => ({
      name: role,
      estimatedDuration: CAREER_TEMPLATES[role].estimatedCompletion,
      phases: CAREER_TEMPLATES[role].phases.length
    }));

    res.status(200).json({
      success: true,
      roles
    });
  } catch (error) {
    console.error('Get available roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to customize roadmap based on user profile
function customizeRoadmapForUser(template, userProfile) {
  const { currentLevel, currentSkills, timeCommitment, preferences } = userProfile;
  
  // Clone the template
  const customizedRoadmap = JSON.parse(JSON.stringify(template));
  
  // Adjust based on current level
  if (currentLevel === 'intermediate') {
    // Mark some beginner skills as completed if user has them
    customizedRoadmap.phases.forEach(phase => {
      phase.skills.forEach(skill => {
        if (currentSkills.includes(skill.name.toLowerCase()) || 
            currentSkills.some(userSkill => skill.name.toLowerCase().includes(userSkill.toLowerCase()))) {
          skill.completed = true;
          skill.completedAt = new Date();
        }
      });
    });
  }
  
  // Adjust timeline based on time commitment
  if (timeCommitment === 'part-time') {
    customizedRoadmap.estimatedCompletion = customizedRoadmap.estimatedCompletion.replace(/(\d+)-(\d+)/, (match, min, max) => {
      return `${Math.ceil(min * 1.5)}-${Math.ceil(max * 1.5)}`;
    });
  } else if (timeCommitment === 'full-time') {
    customizedRoadmap.estimatedCompletion = customizedRoadmap.estimatedCompletion.replace(/(\d+)-(\d+)/, (match, min, max) => {
      return `${Math.floor(min * 0.7)}-${Math.floor(max * 0.7)}`;
    });
  }
  
  return customizedRoadmap;
}
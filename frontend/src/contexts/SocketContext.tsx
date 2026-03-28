import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  applicationUpdates: ApplicationUpdate[];
  companyApplicationUpdates: CompanyApplicationUpdate[];
  postUpdates: PostUpdate[];
  followUpdates: FollowUpdate[];
  clearApplicationUpdates: () => void;
  clearCompanyApplicationUpdates: () => void;
  clearPostUpdates: () => void;
  clearFollowUpdates: () => void;
}

interface ApplicationUpdate {
  id: string;
  type: 'new_application' | 'status_change' | 'offer_response';
  message: string;
  timestamp: Date;
  applicationId?: string;
  jobTitle?: string;
  company?: string;
  status?: string;
}

interface CompanyApplicationUpdate {
  id: string;
  type: 'new_company_application' | 'company_status_change';
  message: string;
  timestamp: Date;
  applicationId?: string;
  companyName?: string;
  status?: string;
}

interface PostUpdate {
  id: string;
  type: 'new_post' | 'post_like' | 'post_comment';
  message: string;
  timestamp: Date;
  postId?: string;
  authorName?: string;
  content?: string;
}

interface FollowUpdate {
  id: string;
  type: 'new_follower';
  message: string;
  timestamp: Date;
  followerId?: string;
  followerName?: string;
  followerRole?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [applicationUpdates, setApplicationUpdates] = useState<ApplicationUpdate[]>([]);
  const [companyApplicationUpdates, setCompanyApplicationUpdates] = useState<CompanyApplicationUpdate[]>([]);
  const [postUpdates, setPostUpdates] = useState<PostUpdate[]>([]);
  const [followUpdates, setFollowUpdates] = useState<FollowUpdate[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const socketInstance = io('http://localhost:8080', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      
      // Register user for real-time updates
      if (user._id) {
        socketInstance.emit('registerUser', user._id);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Application-related event handlers
    socketInstance.on('newApplication', (data: any) => {
      console.log('New application received:', data);
      const update: ApplicationUpdate = {
        id: Date.now().toString(),
        type: 'new_application',
        message: `New application received for ${data.jobTitle}`,
        timestamp: new Date(),
        applicationId: data.applicationId,
        jobTitle: data.jobTitle,
        company: data.company
      };
      setApplicationUpdates(prev => [update, ...prev.slice(0, 9)]);
    });

    socketInstance.on('applicationStatusUpdate', (data: any) => {
      console.log('Application status update:', data);
      const update: ApplicationUpdate = {
        id: Date.now().toString(),
        type: 'status_change',
        message: `Application status changed to ${data.status}`,
        timestamp: new Date(),
        applicationId: data._id || data.applicationId,
        jobTitle: data.jobTitle,
        company: data.company,
        status: data.status
      };
      setApplicationUpdates(prev => [update, ...prev.slice(0, 9)]);
    });

    // Company application-related event handlers
    socketInstance.on('newCompanyApplication', (data: any) => {
      console.log('New company application received:', data);
      const update: CompanyApplicationUpdate = {
        id: Date.now().toString(),
        type: 'new_company_application',
        message: `New application received for ${data.companyName}`,
        timestamp: new Date(),
        applicationId: data.applicationId,
        companyName: data.companyName
      };
      setCompanyApplicationUpdates(prev => [update, ...prev.slice(0, 9)]);
    });

    socketInstance.on('companyApplicationStatusUpdate', (data: any) => {
      console.log('Company application status update:', data);
      const update: CompanyApplicationUpdate = {
        id: Date.now().toString(),
        type: 'company_status_change',
        message: `Your application to ${data.companyName} was ${data.status}`,
        timestamp: new Date(),
        applicationId: data._id || data.applicationId,
        companyName: data.companyName,
        status: data.status
      };
      setCompanyApplicationUpdates(prev => [update, ...prev.slice(0, 9)]);
    });

    socketInstance.on('offerResponse', (data: any) => {
      console.log('Offer response received:', data);
      const update: ApplicationUpdate = {
        id: Date.now().toString(),
        type: 'offer_response',
        message: `${data.applicantName} ${data.response} the job offer`,
        timestamp: new Date(),
        applicationId: data.applicationId,
        jobTitle: data.jobTitle,
        status: data.response
      };
      setApplicationUpdates(prev => [update, ...prev.slice(0, 9)]);
    });

    // Post-related event handlers
    socketInstance.on('newPost', (data: any) => {
      console.log('New post received:', data);
      const update: PostUpdate = {
        id: Date.now().toString(),
        type: 'new_post',
        message: `${data.authorName} shared a new post`,
        timestamp: new Date(),
        postId: data.postId,
        authorName: data.authorName,
        content: data.content
      };
      setPostUpdates(prev => [update, ...prev.slice(0, 9)]);
    });

    // Follow-related event handlers
    socketInstance.on('newFollower', (data: any) => {
      console.log('New follower received:', data);
      const update: FollowUpdate = {
        id: Date.now().toString(),
        type: 'new_follower',
        message: `${data.followerName} started following you`,
        timestamp: new Date(),
        followerId: data.followerId,
        followerName: data.followerName,
        followerRole: data.followerRole
      };
      setFollowUpdates(prev => [update, ...prev.slice(0, 9)]);
    });

    socketInstance.on('newJobPosted', (data: any) => {
      console.log('New job posted:', data);
      // Only show to students and alumni
      if (user.role === 'student' || user.role === 'alumni') {
        const update: ApplicationUpdate = {
          id: Date.now().toString(),
          type: 'new_application',
          message: `New job posted: ${data.title} at ${data.company}`,
          timestamp: new Date(),
          jobTitle: data.title,
          company: data.company
        };
        setApplicationUpdates(prev => [update, ...prev.slice(0, 9)]);
      }
    });

    // Error handling
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const clearApplicationUpdates = () => {
    setApplicationUpdates([]);
  };

  const clearCompanyApplicationUpdates = () => {
    setCompanyApplicationUpdates([]);
  };

  const clearPostUpdates = () => {
    setPostUpdates([]);
  };

  const clearFollowUpdates = () => {
    setFollowUpdates([]);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    applicationUpdates,
    companyApplicationUpdates,
    postUpdates,
    followUpdates,
    clearApplicationUpdates,
    clearCompanyApplicationUpdates,
    clearPostUpdates,
    clearFollowUpdates
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
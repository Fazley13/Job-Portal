import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AlumniDashboard from './pages/dashboard/AlumniDashboard';
import EmployerDashboard from './pages/dashboard/EmployerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import JobSearch from './pages/job/JobSearch';
import JobDetails from './pages/job/JobDetails';
import Events from './pages/events/Events';
import EventDetails from './pages/events/EventDetails';
import CareerRoadmap from './pages/roadmap/CareerRoadmap';
import RoadmapDetails from './pages/roadmap/RoadmapDetails';

import Profile from './pages/user/Profile';
import UserProfile from './pages/user/UserProfile';
import Applications from './pages/applications/Applications';
import CompanyApplications from './pages/applications/CompanyApplications';
import Feed from './pages/social/Feed';
import Network from './pages/social/Network';
import UserSearch from './pages/social/UserSearch';

// Admin Pages
import ManageUsers from './pages/admin/ManageUsers';
import ManageJobs from './pages/admin/ManageJobs';
import ManageRoadmaps from './pages/admin/ManageRoadmaps';
import ManageAdminEvents from './pages/admin/ManageAdminEvents';
import ManageAdminCompanies from './pages/admin/ManageAdminCompanies';
import Landing from './pages/public/Landing';
import NotFound from './pages/public/NotFound';
import { PageLoader } from './components/ui';
import { useAuth } from './contexts/AuthContext';


// Employer Pages
import CreateJob from './pages/employer/CreateJob';
import ManageApplications from './pages/employer/ManageApplications';
import ManageEmployerJobs from './pages/employer/ManageEmployerJobs';
import CreateEvent from './pages/employer/CreateEvent';
import ManageEvents from './pages/employer/ManageEvents';
import CreateCompany from './pages/employer/CreateCompany';
import ManageCompanies from './pages/employer/ManageCompanies';
import ManageCompanyApplications from './pages/employer/ManageCompanyApplications';

// Company Pages
import CompanySearch from './pages/company/CompanySearch';
import CompanyDetails from './pages/company/CompanyDetails';

// Mentorship Pages
import AlumniMentorshipDashboard from './pages/mentorship/AlumniMentorshipDashboard';
import StudentMentorshipDashboard from './pages/mentorship/StudentMentorshipDashboard';
import CreateProgram from './pages/mentorship/CreateProgram';
import ProgramContent from './pages/mentorship/ProgramContent';
import AdminMentorshipManagement from './pages/mentorship/AdminMentorshipManagement';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardRouter />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/search"
                element={
                  <PrivateRoute>
                    <JobSearch />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <PrivateRoute>
                    <JobDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/roadmap"
                element={
                  <PrivateRoute>
                    <CareerRoadmap />
                  </PrivateRoute>
                }
              />
              <Route
                path="/roadmap/:id"
                element={
                  <PrivateRoute>
                    <RoadmapDetails />
                  </PrivateRoute>
                }
              />
              
              
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/:userId"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <PrivateRoute>
                    <Applications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/company-applications"
                element={
                  <PrivateRoute roles={['student', 'alumni']}>
                    <CompanyApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <PrivateRoute>
                    <Events />
                  </PrivateRoute>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <PrivateRoute>
                    <EventDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <PrivateRoute>
                    <Feed />
                  </PrivateRoute>
                }
              />
              <Route
                path="/network"
                element={
                  <PrivateRoute>
                    <Network />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/search"
                element={
                  <PrivateRoute>
                    <UserSearch />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute roles={['admin']}>
                    <ManageUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <PrivateRoute roles={['admin']}>
                    <ManageJobs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <PrivateRoute roles={['admin']}>
                    <ManageAdminEvents />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/companies"
                element={
                  <PrivateRoute roles={['admin']}>
                    <ManageAdminCompanies />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/roadmaps"
                element={
                  <PrivateRoute roles={['admin']}>
                    <ManageRoadmaps />
                  </PrivateRoute>
                }
              />

              {/* Employer Routes */}
              <Route
                path="/jobs/create"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <CreateJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/manage"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <ManageEmployerJobs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/applications/manage"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <ManageApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/events/create"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <CreateEvent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/events/manage"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <ManageEvents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies/create"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <CreateCompany />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies/manage"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <ManageCompanies />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies/:companyId/applications"
                element={
                  <PrivateRoute roles={['employer', 'admin']}>
                    <ManageCompanyApplications />
                  </PrivateRoute>
                }
              />
              
              {/* Company Routes */}
              <Route
                path="/companies"
                element={
                  <PrivateRoute>
                    <CompanySearch />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies/:id"
                element={
                  <PrivateRoute>
                    <CompanyDetails />
                  </PrivateRoute>
                }
              />
               {/* Mentorship Routes */}
              <Route
                path="/mentorship/alumni"
                element={
                  <PrivateRoute roles={['alumni']}>
                    <AlumniMentorshipDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mentorship/student"
                element={
                  <PrivateRoute roles={['student']}>
                    <StudentMentorshipDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mentorship/admin"
                element={
                  <PrivateRoute roles={['admin']}>
                    <AdminMentorshipManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mentorship/create"
                element={
                  <PrivateRoute roles={['alumni']}>
                    <CreateProgram />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mentorship/programs/:programId/content"
                element={
                  <PrivateRoute roles={['student', 'alumni']}>
                    <ProgramContent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mentorship/programs/:programId"
                element={
                  <PrivateRoute roles={['student', 'alumni', 'admin']}>
                    <ProgramContent />
                  </PrivateRoute>
                }
              />

              
              {/* Root redirect */}
              <Route path="/" element={<Landing />} />

              {/* Old / mistyped links that used to 404 */}
              <Route path="/settings" element={<Navigate to="/profile" replace />} />
              <Route path="/roadmaps" element={<Navigate to="/roadmap" replace />} />
              <Route path="/mentorship-panel" element={<Navigate to="/mentorship/alumni" replace />} />
              <Route path="/admin/mentorships" element={<Navigate to="/mentorship/admin" replace />} />
              <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Dashboard Router Component

function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'alumni':
      return <AlumniDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}


export default App;
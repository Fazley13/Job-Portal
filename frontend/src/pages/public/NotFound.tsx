import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Logo from '../../components/layout/Logo';
import { useAuth } from '../../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <Logo to="/" className="mb-10" />
      <div className="rounded-2xl bg-blue-50 p-4 text-blue-700"><Compass className="h-8 w-8" /></div>
      <h1 className="mt-6 font-display text-4xl font-bold">This page doesn’t exist</h1>
      <p className="mt-2 max-w-md text-gray-500">The link may be old or mistyped. Head back and pick up where you left off.</p>
      <div className="mt-6 flex gap-3">
        <Link to={user ? '/dashboard' : '/'} className="btn-primary">{user ? 'Go to dashboard' : 'Back to home'}</Link>
        {!user && <Link to="/login" className="btn-secondary">Sign in</Link>}
      </div>
    </div>
  );
};

export default NotFound;

import React from 'react';
import { Briefcase, GraduationCap, Handshake, Target } from 'lucide-react';
import Logo from '../layout/Logo';

const points = [
  { icon: Briefcase, text: 'Apply to jobs and track every application live' },
  { icon: GraduationCap, text: 'Learn from alumni through mentorship programs' },
  { icon: Target, text: 'Follow career roadmaps built by your university' },
  { icon: Handshake, text: 'Meet employers at events and job fairs' },
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <aside className="relative hidden overflow-hidden bg-blue-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="pattern-dots absolute inset-0" aria-hidden="true" />
      <div className="relative"><Logo light to="/" /></div>
      <div className="relative">
        <h2 className="max-w-md font-display text-4xl font-bold leading-tight !text-white">
          Your next step is closer than you think.
        </h2>
        <ul className="mt-8 space-y-4">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-blue-50">
              <span className="rounded-lg bg-white/10 p-2"><Icon className="h-5 w-5" /></span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-sm text-blue-200">Built for students, alumni, employers and the people who run the platform.</p>
    </aside>

    <main className="flex items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden"><Logo to="/" /></div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-gray-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>
      </div>
    </main>
  </div>
);

export default AuthLayout;

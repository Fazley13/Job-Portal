import React from 'react';
import { Link } from 'react-router-dom';

export const LogoMark: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#157a73" />
    <path d="M10 42c6-14 13-20 22-20s16 6 22 20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <path d="M32 22V46" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <circle cx="32" cy="13" r="5" fill="#ffa01f" />
    <path d="M18 50h28" stroke="#a9e2d9" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

interface LogoProps {
  to?: string;
  light?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ to = '/', light = false, className = '' }) => (
  <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="JobPortal home">
    <LogoMark />
    <span className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>
      Job<span className={light ? 'text-accent-300' : 'text-blue-600'}>Portal</span>
    </span>
  </Link>
);

export default Logo;

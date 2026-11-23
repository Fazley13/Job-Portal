import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProgressBar, RoleBadge, roleMeta } from '../ui';
import axios from 'axios';
import { useEffect, useState } from 'react';

export function useDashboardSummary<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get('/dashboard/summary');
        if (!cancelled) setData(res.data.summary);
      } catch (e: any) {
        if (!cancelled) setError(e.response?.data?.message || 'Could not load your dashboard. Check that the server is running.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export const WelcomeBanner: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-800 p-6 text-white sm:p-8">
      <div className="pattern-dots absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <RoleBadge role={user.role} className="!bg-white/15 !text-white !ring-white/30" />
          <h1 className="mt-3 font-display text-2xl font-bold !text-white sm:text-3xl">
            {greeting()}, {user.firstName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-blue-100">{roleMeta[user.role]?.blurb}</p>
        </div>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
};

export const BannerLink: React.FC<{ to: string; children: React.ReactNode; primary?: boolean }> = ({ to, children, primary }) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
      primary ? 'bg-accent-400 text-gray-900 hover:bg-accent-300' : 'bg-white/10 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20'
    }`}
  >
    {children}
  </Link>
);

export const ProfileCompleteness: React.FC<{ value: number }> = ({ value }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">Profile strength</h3>
      <span className="font-display text-lg font-bold text-blue-700">{value}%</span>
    </div>
    <ProgressBar value={value} className="mt-3" />
    <p className="mt-3 text-xs text-gray-500">
      {value >= 100 ? 'Your profile is complete. Nice work.' : 'Add a photo, bio, skills and links so people can find and trust you.'}
    </p>
    {value < 100 && (
      <Link to="/profile" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
        Complete profile <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  </div>
);

export const QuickLinks: React.FC<{ items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }> = ({ items }) => (
  <div className="card p-2">
    {items.map(({ to, label, icon: Icon }) => (
      <Link key={to} to={to} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
        <span className="rounded-lg bg-blue-50 p-1.5 text-blue-700"><Icon className="h-4 w-4" /></span>
        <span className="flex-1">{label}</span>
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600" />
      </Link>
    ))}
  </div>
);

export const ErrorNotice: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{message}</div>
);

export const EventList: React.FC<{ events: any[] }> = ({ events }) => (
  <ul className="divide-y divide-gray-100">
    {events.map((e) => {
      const d = new Date(e.startDateTime);
      return (
        <li key={e._id}>
          <Link to={`/events/${e._id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-50 text-accent-700">
              <span className="text-[10px] font-semibold uppercase leading-none">{d.toLocaleString(undefined, { month: 'short' })}</span>
              <span className="font-display text-lg font-bold leading-tight">{d.getDate()}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{e.title}</p>
              <p className="truncate text-xs text-gray-500">{e.isOnline ? 'Online' : e.location} · {e.organizer}</p>
            </div>
          </Link>
        </li>
      );
    })}
  </ul>
);

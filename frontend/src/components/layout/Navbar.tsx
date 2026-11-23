import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Building2, LogOut, Menu, Search, User as UserIcon, UserPlus, MessageSquare, FileText, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Avatar, RoleBadge, timeAgo } from '../ui';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const {
    applicationUpdates, companyApplicationUpdates, postUpdates, followUpdates,
    clearApplicationUpdates, clearCompanyApplicationUpdates, clearPostUpdates, clearFollowUpdates,
  } = useSocket();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setProfileOpen(false); setNotifOpen(false); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const notifications = useMemo(() => {
    const all = [
      ...applicationUpdates.map((u) => ({ ...u, kind: 'application' as const })),
      ...companyApplicationUpdates.map((u) => ({ ...u, kind: 'company' as const })),
      ...postUpdates.map((u) => ({ ...u, kind: 'post' as const })),
      ...followUpdates.map((u) => ({ ...u, kind: 'follow' as const })),
    ];
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applicationUpdates, companyApplicationUpdates, postUpdates, followUpdates]);

  if (!user) return null;

  const iconFor = { application: FileText, company: Building2, post: MessageSquare, follow: UserPlus };
  const clearAll = () => {
    clearApplicationUpdates();
    clearCompanyApplicationUpdates();
    clearPostUpdates();
    clearFollowUpdates();
  };

  const quickLinks = [
    { to: '/jobs/search', label: 'Jobs', icon: Briefcase },
    { to: '/users/search', label: 'People', icon: Users },
    { to: '/companies', label: 'Companies', icon: Building2 },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-gray-200 bg-white/90 backdrop-blur lg:left-64">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Quick links">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => navigate('/users/search')}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Search people"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label={`Notifications${notifications.length ? `, ${notifications.length} new` : ''}`}
              aria-expanded={notifOpen}
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-xs font-medium text-blue-600 hover:text-blue-700">Clear all</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500">You’re all caught up.</p>
                ) : (
                  <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                    {notifications.map((n) => {
                      const Icon = iconFor[n.kind];
                      return (
                        <li key={`${n.kind}-${n.id}`} className="flex gap-3 px-4 py-3">
                          <span className="mt-0.5 rounded-lg bg-blue-50 p-1.5 text-blue-600"><Icon className="h-4 w-4" /></span>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800">{n.message}</p>
                            <p className="mt-0.5 text-xs text-gray-400">{timeAgo(n.timestamp)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-gray-100"
              aria-expanded={profileOpen}
              aria-label="Account menu"
            >
              <Avatar name={`${user.firstName} ${user.lastName}`} src={user.profile?.avatar} size="sm" />
              <span className="hidden text-sm font-semibold text-gray-800 sm:block">{user.firstName}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                  <RoleBadge role={user.role} className="mt-2" />
                </div>
                <div className="p-1.5">
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <UserIcon className="h-4 w-4" /> My profile
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

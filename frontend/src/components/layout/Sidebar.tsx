import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import { Avatar, RoleBadge } from '../ui';
import { navForRole, bestMatch } from './navConfig';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const groups = navForRole(user?.role);
  const active = bestMatch(groups, pathname);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) return null;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Logo to="/dashboard" />
        <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2" aria-label="Main navigation">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.title && <p className="mb-1.5 px-3 text-xs font-semibold text-gray-400">{group.title}</p>}
            <ul className="space-y-0.5">
              {group.items.map(({ icon: Icon, label, path }) => {
                const isActive = active === path;
                return (
                  <li key={path}>
                    <Link
                      to={path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-200 p-3">
        <Link to="/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50">
          <Avatar name={`${user.firstName} ${user.lastName}`} src={user.profile?.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <RoleBadge role={user.role} className="mt-0.5" />
          </div>
        </Link>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:block">{content}</aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-gray-900/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl transition-transform duration-200 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;

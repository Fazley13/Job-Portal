import {
  LayoutDashboard, User, Briefcase, FileText, Building2, CalendarDays, GraduationCap, Target,
  Users, UserPlus, Search, PlusCircle, ListChecks, Inbox, Newspaper, ShieldCheck, CalendarPlus, Building,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem { icon: LucideIcon; label: string; path: string }
export interface NavGroup { title?: string; items: NavItem[] }

export const navForRole = (role?: string): NavGroup[] => {
  switch (role) {
    case 'student':
      return [
        { items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }] },
        {
          title: 'Career',
          items: [
            { icon: Briefcase, label: 'Find jobs', path: '/jobs/search' },
            { icon: FileText, label: 'My applications', path: '/applications' },
            { icon: Building2, label: 'Companies', path: '/companies' },
            { icon: Inbox, label: 'Company requests', path: '/company-applications' },
            { icon: Target, label: 'Career roadmaps', path: '/roadmap' },
            { icon: GraduationCap, label: 'Mentorship', path: '/mentorship/student' },
          ],
        },
        {
          title: 'Community',
          items: [
            { icon: Newspaper, label: 'Feed', path: '/feed' },
            { icon: UserPlus, label: 'My network', path: '/network' },
            { icon: Search, label: 'Find people', path: '/users/search' },
            { icon: CalendarDays, label: 'Events', path: '/events' },
          ],
        },
        { title: 'Account', items: [{ icon: User, label: 'My profile', path: '/profile' }] },
      ];
    case 'alumni':
      return [
        { items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }] },
        {
          title: 'Give back',
          items: [
            { icon: GraduationCap, label: 'My mentorship', path: '/mentorship/alumni' },
            { icon: PlusCircle, label: 'New program', path: '/mentorship/create' },
            { icon: CalendarDays, label: 'Events', path: '/events' },
          ],
        },
        {
          title: 'Career',
          items: [
            { icon: Briefcase, label: 'Find jobs', path: '/jobs/search' },
            { icon: FileText, label: 'My applications', path: '/applications' },
            { icon: Building2, label: 'Companies', path: '/companies' },
            { icon: Target, label: 'Career roadmaps', path: '/roadmap' },
          ],
        },
        {
          title: 'Community',
          items: [
            { icon: Newspaper, label: 'Feed', path: '/feed' },
            { icon: UserPlus, label: 'My network', path: '/network' },
            { icon: Search, label: 'Find people', path: '/users/search' },
          ],
        },
        { title: 'Account', items: [{ icon: User, label: 'My profile', path: '/profile' }] },
      ];
    case 'employer':
      return [
        { items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }] },
        {
          title: 'Hiring',
          items: [
            { icon: PlusCircle, label: 'Post a job', path: '/jobs/create' },
            { icon: ListChecks, label: 'My jobs', path: '/jobs/manage' },
            { icon: Users, label: 'Applicants', path: '/applications/manage' },
          ],
        },
        {
          title: 'Brand',
          items: [
            { icon: Building2, label: 'My companies', path: '/companies/manage' },
            { icon: CalendarPlus, label: 'My events', path: '/events/manage' },
          ],
        },
        {
          title: 'Community',
          items: [
            { icon: Search, label: 'Find talent', path: '/users/search' },
            { icon: Newspaper, label: 'Feed', path: '/feed' },
            { icon: CalendarDays, label: 'All events', path: '/events' },
          ],
        },
        { title: 'Account', items: [{ icon: User, label: 'My profile', path: '/profile' }] },
      ];
    case 'admin':
      return [
        { items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }] },
        {
          title: 'Manage',
          items: [
            { icon: Users, label: 'Users', path: '/admin/users' },
            { icon: Briefcase, label: 'Jobs', path: '/admin/jobs' },
            { icon: Building, label: 'Companies', path: '/admin/companies' },
            { icon: CalendarDays, label: 'Events', path: '/admin/events' },
            { icon: GraduationCap, label: 'Mentorships', path: '/mentorship/admin' },
            { icon: Target, label: 'Roadmaps', path: '/admin/roadmaps' },
          ],
        },
        {
          title: 'Browse',
          items: [
            { icon: Newspaper, label: 'Feed', path: '/feed' },
            { icon: Search, label: 'Find people', path: '/users/search' },
          ],
        },
        { title: 'Account', items: [{ icon: ShieldCheck, label: 'My profile', path: '/profile' }] },
      ];
    default:
      return [];
  }
};

/** Returns the path of the nav item that best matches the current URL (longest prefix wins). */
export const bestMatch = (groups: NavGroup[], pathname: string): string | null => {
  let best: string | null = null;
  for (const g of groups) {
    for (const it of g.items) {
      const hit = pathname === it.path || (it.path !== '/dashboard' && pathname.startsWith(it.path + '/'));
      if (hit && (!best || it.path.length > best.length)) best = it.path;
    }
  }
  return best;
};

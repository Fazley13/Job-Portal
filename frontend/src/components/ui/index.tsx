import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

export const roleMeta: Record<string, { label: string; dot: string; chip: string; blurb: string }> = {
  student: { label: 'Student', dot: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 ring-blue-200', blurb: 'Build your profile, apply to jobs and learn from alumni.' },
  alumni: { label: 'Alumni', dot: 'bg-accent-400', chip: 'bg-accent-50 text-accent-700 ring-accent-200', blurb: 'Mentor students and open doors for your community.' },
  employer: { label: 'Employer', dot: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-700 ring-indigo-200', blurb: 'Post roles, review applicants and hire great talent.' },
  admin: { label: 'Admin', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 ring-rose-200', blurb: 'Keep the platform healthy, safe and moving.' },
};

export const RoleBadge: React.FC<{ role: string; className?: string }> = ({ role, className = '' }) => {
  const meta = roleMeta[role] || roleMeta.student;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${meta.chip} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

export const Avatar: React.FC<{ name?: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  name = '?',
  src,
  size = 'md',
  className = '',
}) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-24 w-24 text-3xl' };
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white ${className}`} />;
  }
  return (
    <span className={`${sizes[size]} inline-flex items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ring-2 ring-white ${className}`}>
      {initials || '?'}
    </span>
  );
};

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${className}`}>{children}</div>
);

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, subtitle, actions, icon }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 rounded-xl bg-blue-50 p-2.5 text-blue-700">{icon}</div>}
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'brand' | 'amber' | 'indigo' | 'rose' | 'slate';
}> = ({ label, value, hint, icon: Icon, tone = 'brand' }) => {
  const tones = {
    brand: 'bg-blue-50 text-blue-700',
    amber: 'bg-accent-50 text-accent-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-gray-100 text-gray-700',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

export const Section: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, action, children, className = '' }) => (
  <section className={`card ${className}`}>
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => (
  <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
    <div className="mb-3 rounded-2xl bg-gray-100 p-3 text-gray-400">{icon || <Inbox className="h-6 w-6" />}</div>
    <p className="font-semibold text-gray-900">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
    <div className="text-center">
      <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-blue-600" />
      <p className="text-sm text-gray-500">{label}…</p>
    </div>
  </div>
);

export const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

export const timeAgo = (date: string | Date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

export const formatDate = (date: string | Date, withTime = false) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

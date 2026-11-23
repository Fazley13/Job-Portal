import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building, CalendarDays, FileText, GraduationCap, Target, UserCheck, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBar from '../../components/dashboard/StatusBar';
import { Avatar, PageContainer, PageLoader, RoleBadge, Section, StatCard, timeAgo } from '../../components/ui';
import { BannerLink, ErrorNotice, QuickLinks, WelcomeBanner, useDashboardSummary } from '../../components/dashboard/shared';

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardSummary<any>();

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <WelcomeBanner>
          <BannerLink to="/admin/users" primary><Users className="h-4 w-4" /> Manage users</BannerLink>
          <BannerLink to="/admin/jobs"><Briefcase className="h-4 w-4" /> Review jobs</BannerLink>
        </WelcomeBanner>

        {error && <ErrorNotice message={error} />}

        {loading ? (
          <PageLoader label="Loading platform stats" />
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Users" value={data.users.total} hint={`${data.users.newThisWeek} joined this week`} icon={Users} />
              <StatCard label="Active jobs" value={data.jobs.active} hint={`${data.jobs.total} total`} icon={Briefcase} tone="amber" />
              <StatCard label="Applications" value={data.applications.total} hint={`${data.applications.appointed || 0} hires`} icon={FileText} tone="indigo" />
              <StatCard label="Deactivated users" value={data.users.deactivated} icon={UserCheck} tone="rose" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Companies" value={data.companies} icon={Building} tone="slate" />
              <StatCard label="Events" value={data.events} icon={CalendarDays} tone="slate" />
              <StatCard label="Mentorship programs" value={data.mentorshipPrograms} icon={GraduationCap} tone="slate" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="min-w-0 space-y-6 lg:col-span-2">
                <Section title="Who’s on the platform">
                  <StatusBar counts={data.users.byRole} keys={['student', 'alumni', 'employer', 'admin']} />
                </Section>
                <Section title="Application outcomes">
                  <StatusBar counts={data.applications} keys={['pending', 'shortlisted', 'appointed', 'rejected']} />
                </Section>
              </div>

              <div className="min-w-0 space-y-6">
                <Section title="Newest members" action={<Link to="/admin/users" className="text-sm font-semibold text-blue-700">All users</Link>}>
                  <ul className="space-y-3">
                    {data.recentUsers.map((u: any) => (
                      <li key={u._id} className="flex items-center gap-3">
                        <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400">{timeAgo(u.createdAt)}</p>
                        </div>
                        <RoleBadge role={u.role} />
                      </li>
                    ))}
                  </ul>
                </Section>
                <QuickLinks
                  items={[
                    { to: '/admin/companies', label: 'Companies', icon: Building },
                    { to: '/admin/events', label: 'Events', icon: CalendarDays },
                    { to: '/mentorship/admin', label: 'Mentorship programs', icon: GraduationCap },
                    { to: '/admin/roadmaps', label: 'Career roadmaps', icon: Target },
                  ]}
                />
              </div>
            </div>
          </>
        ) : null}
      </PageContainer>
    </DashboardLayout>
  );
};

export default AdminDashboard;

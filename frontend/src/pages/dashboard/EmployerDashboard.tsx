import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, CalendarPlus, ListChecks, PlusCircle, Search, Target, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBar from '../../components/dashboard/StatusBar';
import { EmptyState, PageContainer, PageLoader, Section, StatCard, timeAgo } from '../../components/ui';
import { BannerLink, ErrorNotice, QuickLinks, WelcomeBanner, useDashboardSummary } from '../../components/dashboard/shared';

const statusStyle: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  shortlisted: 'bg-accent-50 text-accent-700',
  appointed: 'bg-blue-50 text-blue-700',
  rejected: 'bg-rose-50 text-rose-700',
};

const EmployerDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardSummary<any>();

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <WelcomeBanner>
          <BannerLink to="/jobs/create" primary><PlusCircle className="h-4 w-4" /> Post a job</BannerLink>
          <BannerLink to="/users/search"><Search className="h-4 w-4" /> Find talent</BannerLink>
        </WelcomeBanner>

        {error && <ErrorNotice message={error} />}

        {loading ? (
          <PageLoader label="Loading your dashboard" />
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Active jobs" value={data.jobs.active} hint={`${data.jobs.total} posted in total`} icon={Briefcase} />
              <StatCard label="Applicants" value={data.applications.total} hint={`${data.applications.pending || 0} to review`} icon={Users} tone="amber" />
              <StatCard label="Hire rate" value={`${data.hireRate}%`} hint={`${data.applications.appointed || 0} hired`} icon={Target} tone="indigo" />
              <StatCard label="Companies" value={data.companies} hint={`${data.events} events hosted`} icon={Building2} tone="slate" />
            </div>

            <Section title="Hiring pipeline">
              <StatusBar counts={data.applications} keys={['pending', 'shortlisted', 'appointed', 'rejected']} />
            </Section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Section
                title="Latest applicants"
                className="lg:col-span-2"
                action={<Link to="/applications/manage" className="text-sm font-semibold text-blue-700">Review all</Link>}
              >
                {data.recentApplications.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-6 w-6" />}
                    title="No applicants yet"
                    description="Post a job and applicants will appear here."
                    action={<Link to="/jobs/create" className="btn-primary">Post a job</Link>}
                  />
                ) : (
                  <ul className="-my-2 divide-y divide-gray-100">
                    {data.recentApplications.map((a: any) => (
                      <li key={a._id} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {a.applicantId ? `${a.applicantId.firstName} ${a.applicantId.lastName}` : 'Former user'}
                          </p>
                          <p className="truncate text-xs text-gray-500">{a.jobId?.title || 'Removed job'} · {timeAgo(a.appliedAt)}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle[a.status] || statusStyle.pending}`}>
                          {a.status === 'appointed' ? 'hired' : a.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <div className="min-w-0 space-y-6">
                <Section title="Top jobs by applicants">
                  {data.topJobs.length === 0 ? (
                    <p className="text-sm text-gray-500">No jobs posted yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.topJobs.map((j: any) => (
                        <li key={j._id} className="flex items-center justify-between text-sm">
                          <Link to={`/jobs/${j._id}`} className="truncate font-medium hover:text-blue-700">{j.title}</Link>
                          <span className="ml-2 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{j.applicationsCount}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
                <QuickLinks
                  items={[
                    { to: '/jobs/manage', label: 'Manage jobs', icon: ListChecks },
                    { to: '/companies/manage', label: 'Company profiles', icon: Building2 },
                    { to: '/events/create', label: 'Host an event', icon: CalendarPlus },
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

export default EmployerDashboard;

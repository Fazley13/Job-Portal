import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Target, Users, Search, Building2, GraduationCap, CalendarDays, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FeedSection from '../../components/social/FeedSection';
import { EmptyState, PageContainer, PageLoader, ProgressBar, Section, StatCard, timeAgo } from '../../components/ui';
import {
  BannerLink, ErrorNotice, EventList, ProfileCompleteness, QuickLinks, WelcomeBanner, useDashboardSummary,
} from '../../components/dashboard/shared';

const StudentDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardSummary<any>();

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <WelcomeBanner>
          <BannerLink to="/jobs/search" primary><Search className="h-4 w-4" /> Find jobs</BannerLink>
          <BannerLink to="/roadmap"><Target className="h-4 w-4" /> Career roadmaps</BannerLink>
        </WelcomeBanner>

        {error && <ErrorNotice message={error} />}

        {loading ? (
          <PageLoader label="Loading your dashboard" />
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Applications" value={data.applications.total} hint={`${data.applications.pending || 0} waiting for a reply`} icon={FileText} />
              <StatCard label="Shortlisted" value={data.applications.shortlisted || 0} hint={`${data.applications.appointed || 0} ${data.applications.appointed === 1 ? "offer" : "offers"}`} icon={Briefcase} tone="amber" />
              <StatCard label="Roadmaps" value={data.roadmaps.started} hint={`${data.roadmaps.completed} completed`} icon={Target} tone="indigo" />
              <StatCard label="Followers" value={data.followers} hint={`Following ${data.following}`} icon={Users} tone="slate" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="min-w-0 space-y-6 lg:col-span-2">
                <Section
                  title="Fresh jobs for you"
                  action={<Link to="/jobs/search" className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all</Link>}
                >
                  {data.jobs.length === 0 ? (
                    <EmptyState title="No open jobs right now" description="New roles appear here as soon as employers post them." />
                  ) : (
                    <ul className="-my-2 divide-y divide-gray-100">
                      {data.jobs.map((job: any) => (
                        <li key={job._id}>
                          <Link to={`/jobs/${job._id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                            <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Briefcase className="h-5 w-5" /></span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-gray-900">{job.title}</p>
                              <p className="truncate text-xs text-gray-500">{job.company} · {job.location} · {job.type}</p>
                            </div>
                            <span className="shrink-0 text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <FeedSection />
              </div>

              <div className="min-w-0 space-y-6">
                <ProfileCompleteness value={data.profileCompleteness} />

                <Section title="Your learning">
                  {data.mentorship && (
                    <Link to="/mentorship/student" className="mb-4 block rounded-xl bg-blue-50 p-3 hover:bg-blue-100">
                      <p className="text-xs font-semibold text-blue-700">Mentorship program</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">{data.mentorship.title}</p>
                      <ProgressBar value={data.mentorship.progress} className="mt-2 !bg-white" />
                    </Link>
                  )}
                  {data.roadmaps.items.length === 0 && !data.mentorship ? (
                    <EmptyState
                      icon={<GraduationCap className="h-6 w-6" />}
                      title="Start learning"
                      description="Pick a career roadmap or join a mentorship program."
                      action={<Link to="/roadmap" className="btn-primary">Browse roadmaps</Link>}
                    />
                  ) : (
                    <ul className="space-y-2">
                      {data.roadmaps.items.map((r: any) => (
                        <li key={r.id}>
                          <Link to={`/roadmap/${r.id}`} className="flex items-center justify-between rounded-lg px-1 py-1.5 text-sm hover:text-blue-700">
                            <span className="truncate font-medium">{r.title}</span>
                            <span className="ml-2 shrink-0 text-xs text-gray-500">{r.skillsDone} skills done</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section title="Upcoming events" action={<Link to="/events" className="text-sm font-semibold text-blue-700">All events</Link>}>
                  {data.events.length === 0 ? (
                    <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="Nothing scheduled" description="Workshops and job fairs will show up here." />
                  ) : (
                    <EventList events={data.events} />
                  )}
                </Section>

                <QuickLinks
                  items={[
                    { to: '/companies', label: 'Explore companies', icon: Building2 },
                    { to: '/users/search', label: 'Find alumni to follow', icon: Users },
                    { to: '/applications', label: 'Track applications', icon: ArrowRight },
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

export default StudentDashboard;

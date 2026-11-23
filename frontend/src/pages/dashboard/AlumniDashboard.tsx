import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CalendarClock, GraduationCap, PlusCircle, Star, Users, UserPlus, Briefcase, Search, Video } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FeedSection from '../../components/social/FeedSection';
import { EmptyState, PageContainer, PageLoader, ProgressBar, Section, StatCard, formatDate } from '../../components/ui';
import {
  BannerLink, ErrorNotice, EventList, ProfileCompleteness, QuickLinks, WelcomeBanner, useDashboardSummary,
} from '../../components/dashboard/shared';

const AlumniDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardSummary<any>();

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <WelcomeBanner>
          <BannerLink to="/mentorship/create" primary><PlusCircle className="h-4 w-4" /> New mentorship program</BannerLink>
          <BannerLink to="/users/search"><Search className="h-4 w-4" /> Find students</BannerLink>
        </WelcomeBanner>

        {error && <ErrorNotice message={error} />}

        {loading ? (
          <PageLoader label="Loading your dashboard" />
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Active mentees" value={data.activeMentees} hint={`${data.programs.active} active programs`} icon={GraduationCap} />
              <StatCard label="Upcoming sessions" value={data.upcomingSessions.length} icon={CalendarClock} tone="amber" />
              <StatCard
                label="Mentor rating"
                value={data.averageRating ?? '–'}
                hint={data.ratingCount ? `${data.ratingCount} reviews` : 'No reviews yet'}
                icon={Star}
                tone="indigo"
              />
              <StatCard label="Followers" value={data.followers} hint={`${data.posts} posts shared`} icon={Users} tone="slate" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="min-w-0 space-y-6 lg:col-span-2">
                <Section
                  title="Your mentorship programs"
                  action={<Link to="/mentorship/alumni" className="text-sm font-semibold text-blue-700">Manage</Link>}
                >
                  {data.programs.items.length === 0 ? (
                    <EmptyState
                      icon={<Award className="h-6 w-6" />}
                      title="Share what you’ve learned"
                      description="Create a program and students can enroll right away."
                      action={<Link to="/mentorship/create" className="btn-primary">Create a program</Link>}
                    />
                  ) : (
                    <ul className="space-y-4">
                      {data.programs.items.map((p: any) => (
                        <li key={p._id}>
                          <Link to={`/mentorship/programs/${p._id}`} className="block rounded-xl border border-gray-200 p-4 hover:border-blue-300">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{p.title}</p>
                              <span className="text-xs text-gray-500">{p.enrolled}/{p.capacity} seats</span>
                            </div>
                            <ProgressBar value={(p.enrolled / Math.max(1, p.capacity)) * 100} className="mt-3" />
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

                <Section title="Upcoming sessions">
                  {data.upcomingSessions.length === 0 ? (
                    <EmptyState icon={<CalendarClock className="h-6 w-6" />} title="No sessions scheduled" description="Sessions you schedule with mentees appear here." />
                  ) : (
                    <ul className="space-y-3">
                      {data.upcomingSessions.map((s: any) => (
                        <li key={s._id} className="rounded-xl bg-gray-50 p-3">
                          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                          <p className="text-xs text-gray-500">
                            {s.studentId ? `${s.studentId.firstName} ${s.studentId.lastName} · ` : ''}
                            {formatDate(s.scheduledDate, true)}
                          </p>
                          {s.meetingLink && (
                            <a href={s.meetingLink} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                              <Video className="h-3.5 w-3.5" /> Join meeting
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section title="Upcoming events" action={<Link to="/events" className="text-sm font-semibold text-blue-700">All events</Link>}>
                  {data.events.length === 0 ? <p className="text-sm text-gray-500">No upcoming events.</p> : <EventList events={data.events} />}
                </Section>

                <QuickLinks
                  items={[
                    { to: '/network', label: 'My network', icon: UserPlus },
                    { to: '/jobs/search', label: 'Browse jobs', icon: Briefcase },
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

export default AlumniDashboard;

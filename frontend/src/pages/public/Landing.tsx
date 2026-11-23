import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, CalendarDays, GraduationCap, Handshake, Newspaper, ShieldCheck, Target, Users } from 'lucide-react';
import Logo from '../../components/layout/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../../components/ui';

const roles = [
  {
    icon: GraduationCap, title: 'Students',
    text: 'Search jobs, apply in a click, follow roadmaps and get a mentor who has been where you want to go.',
    items: ['Track every application', 'Join mentorship programs', 'Build a public profile and CV'],
  },
  {
    icon: Handshake, title: 'Alumni',
    text: 'Give back on your own schedule. Run mentorship programs, share openings and stay close to your university.',
    items: ['Create mentorship programs', 'Schedule sessions with mentees', 'Post updates to your network'],
  },
  {
    icon: Building2, title: 'Employers',
    text: 'Reach motivated candidates directly. Post roles, manage applicants and host events from one workspace.',
    items: ['Post and manage jobs', 'Move applicants through a pipeline', 'Host job fairs and workshops'],
  },
  {
    icon: ShieldCheck, title: 'Admins',
    text: 'See the whole platform at a glance and keep users, jobs, events and roadmaps in good shape.',
    items: ['User and content moderation', 'Platform-wide statistics', 'Curate career roadmaps'],
  },
];

const features = [
  { icon: Briefcase, title: 'Jobs & internships', text: 'Filter by type, location and experience.' },
  { icon: Target, title: 'Career roadmaps', text: 'Step-by-step skill paths with progress tracking.' },
  { icon: GraduationCap, title: 'Mentorship', text: 'Structured programs, sessions and shared resources.' },
  { icon: CalendarDays, title: 'Events', text: 'Webinars, workshops, hackathons and job fairs.' },
  { icon: Newspaper, title: 'Community feed', text: 'Share wins and learn from people you follow.' },
  { icon: Users, title: 'Live updates', text: 'Get notified the moment an application changes.' },
];

const Landing: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-2">
            <a href="#roles" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 sm:block">Who it’s for</a>
            <a href="#features" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 sm:block">Features</a>
            <Link to="/login" className="btn-secondary">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-blue-800 text-white">
        <div className="pattern-dots absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] !text-white sm:text-6xl">
              Where graduates meet their first break.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-blue-100">
              JobPortal brings students, alumni and employers into one place: real openings, real mentors and a clear path from classroom to career.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-accent px-6 py-3 text-base">Create free account <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/login" className="btn bg-white/10 px-6 py-3 text-base text-white ring-1 ring-inset ring-white/30 hover:bg-white/20">Sign in</Link>
            </div>
          </div>

          {/* Product preview: an application moving through the pipeline */}
          <div className="relative mx-auto mb-10 w-full max-w-md" aria-hidden="true">
            <div className="rounded-2xl bg-white p-5 text-gray-900 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Briefcase className="h-5 w-5" /></span>
                <div>
                  <p className="font-semibold">Junior Frontend Developer</p>
                  <p className="text-xs text-gray-500">Northwind Labs · Dhaka · Full-time</p>
                </div>
              </div>
              <ol className="mt-5 space-y-3">
                {[
                  { label: 'Application sent', done: true },
                  { label: 'Shortlisted by employer', done: true },
                  { label: 'Interview scheduled', done: false },
                ].map((s) => (
                  <li key={s.label} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${s.done ? 'bg-blue-600 text-white' : 'border-2 border-gray-300'}`}>{s.done ? '✓' : ''}</span>
                    <span className={s.done ? 'font-medium' : 'text-gray-400'}>{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="absolute -bottom-10 right-4 hidden rounded-2xl bg-accent-400 p-4 text-gray-900 shadow-xl sm:block">
              <p className="text-xs font-semibold">Mentor session</p>
              <p className="font-display text-lg font-bold">Tomorrow, 4:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">One platform, four ways to take part</h2>
        <p className="mt-3 max-w-2xl text-gray-500">Every role gets its own dashboard and tools, so you only see what helps you.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {roles.map(({ icon: Icon, title, text, items }) => (
            <article key={title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Icon className="h-5 w-5" /></span>
                <h3 className="text-lg font-bold">{title}</h3>
              </div>
              <p className="mt-3 text-gray-600">{text}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
                {items.map((i) => (
                  <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent-400" />{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-16 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">Everything a career needs, in one place</h2>
          <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="mt-0.5 h-fit rounded-xl bg-white p-2.5 text-blue-700 shadow-card"><Icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-blue-700 px-8 py-12 text-center text-white sm:px-16">
          <h2 className="font-display text-3xl font-bold !text-white">Ready to take the next step?</h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">Create your account in under a minute and start exploring.</p>
          <Link to="/register" className="btn-accent mt-6 px-6 py-3 text-base">Join JobPortal <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p>© {new Date().getFullYear()} JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

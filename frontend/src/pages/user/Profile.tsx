import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Briefcase, Building2, Github, Globe, GraduationCap, KeyRound, Linkedin, Loader2, MapPin, Pencil, Plus, Save, Users, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostCard from '../../components/social/PostCard';
import CVUploader from '../../components/social/CVUploader';
import ProfilePictureUpload from '../../components/user/ProfilePictureUpload';
import { Avatar, EmptyState, PageContainer, PageLoader, RoleBadge, Section } from '../../components/ui';

type Tab = 'overview' | 'posts' | 'resume' | 'security';

const emptyProfile = (u: any) => ({
  bio: u?.profile?.bio || '',
  skills: (u?.profile?.skills || []) as string[],
  university: u?.profile?.university || '',
  graduationYear: u?.profile?.graduationYear ? String(u.profile.graduationYear) : '',
  company: u?.profile?.company || '',
  position: u?.profile?.position || '',
  location: u?.profile?.location || '',
  linkedin: u?.profile?.linkedin || '',
  github: u?.profile?.github || '',
  website: u?.profile?.website || '',
});

/** Which parts of the profile matter for each role. */
const roleConfig = {
  student: { education: true, work: false, skillsLabel: 'Skills', github: true, resume: true, posts: true, bioHint: 'Tell employers and alumni about your studies and what you want to do next.' },
  alumni: { education: true, work: true, skillsLabel: 'Areas you can mentor in', github: true, resume: true, posts: true, bioHint: 'Share your journey and what students can learn from you.' },
  employer: { education: false, work: true, skillsLabel: '', github: false, resume: false, posts: true, bioHint: 'Describe your organisation and the kind of people you hire.' },
  admin: { education: false, work: false, skillsLabel: '', github: false, resume: false, posts: false, bioHint: 'A short note about your role on the platform.' },
} as const;

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
    {children}
  </label>
);

const InfoRow: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; value?: React.ReactNode }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="rounded-lg bg-gray-100 p-2 text-gray-500"><Icon className="h-4 w-4" /></span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="break-words text-sm font-medium text-gray-900">{value || <span className="font-normal text-gray-400">Not added yet</span>}</p>
    </div>
  </div>
);

const Profile: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const role = (user?.role || 'student') as keyof typeof roleConfig;
  const cfg = roleConfig[role];

  const tabs = useMemo(() => {
    const t: { id: Tab; label: string }[] = [{ id: 'overview', label: 'Overview' }];
    if (cfg.posts) t.push({ id: 'posts', label: 'Posts' });
    if (cfg.resume) t.push({ id: 'resume', label: 'Resume' });
    t.push({ id: 'security', label: 'Security' });
    return t;
  }, [cfg]);

  const [tab, setTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [form, setForm] = useState(emptyProfile(user));
  const [newSkill, setNewSkill] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [cv, setCV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [postsRes, cvRes] = await Promise.all([
        cfg.posts ? axios.get(`/posts/user/${user._id}`).catch(() => null) : Promise.resolve(null),
        cfg.resume ? axios.get('/cv/my').catch(() => null) : Promise.resolve(null),
      ]);
      setPosts(postsRes?.data?.posts || []);
      setCV(cvRes?.data?.cv || null);
    } finally {
      setLoading(false);
    }
  }, [user, cfg]);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setForm(emptyProfile(user));
    setNewSkill('');
  };

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) return toast.error('First and last name are required');
    setSaving(true);
    try {
      const profile: any = { ...form };
      if (profile.graduationYear === '') delete profile.graduationYear;
      else profile.graduationYear = Number(profile.graduationYear);
      await updateProfile({ firstName, lastName, profile });
      setEditing(false);
    } catch {
      /* toast shown by context */
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] });
    setNewSkill('');
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pw.newPassword !== pw.confirm) return toast.error('New passwords do not match');
    setPwSaving(true);
    try {
      await axios.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password updated');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update password');
    } finally {
      setPwSaving(false);
    }
  };

  if (!user) return null;
  const p = user.profile || {};
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        {/* Header */}
        <div className="card overflow-hidden">
          <div className="h-24 bg-blue-700 sm:h-28">
            <div className="pattern-dots h-full w-full" aria-hidden="true" />
          </div>
          <div className="px-5 pb-5 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
                {editing ? (
                  <div className="rounded-2xl bg-white p-3 shadow-card">
                    <ProfilePictureUpload currentAvatar={p.avatar} onAvatarUpdated={() => refreshUser()} />
                  </div>
                ) : (
                  <Avatar name={`${user.firstName} ${user.lastName}`} src={p.avatar} size="xl" className="!h-24 !w-24 !ring-4" />
                )}
                <div className="pb-1 sm:mt-14">
                  <h1 className="font-display text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {[p.position, p.company].filter(Boolean).join(' at ') || user.email}
                  </p>
                  <RoleBadge role={user.role} className="mt-2" />
                </div>
              </div>
              <div className="flex gap-2 sm:mt-14">
                {editing ? (
                  <>
                    <button onClick={() => { reset(); setEditing(false); }} className="btn-secondary"><X className="h-4 w-4" /> Cancel</button>
                    <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
                    </button>
                  </>
                ) : (
                  <button onClick={() => { reset(); setEditing(true); setTab('overview'); }} className="btn-secondary"><Pencil className="h-4 w-4" /> Edit profile</button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-t border-gray-100 px-3 sm:px-6" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
                  tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Section title="About">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First name"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2.5" /></Field>
                      <Field label="Last name"><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2.5" /></Field>
                    </div>
                    <Field label="Bio">
                      <textarea value={form.bio} onChange={set('bio')} rows={4} maxLength={500} placeholder={cfg.bioHint} className="w-full px-3 py-2.5" />
                    </Field>
                  </div>
                ) : p.bio ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{p.bio}</p>
                ) : (
                  <EmptyState title="No bio yet" description={cfg.bioHint} action={<button onClick={() => { reset(); setEditing(true); }} className="btn-primary">Add a bio</button>} />
                )}
              </Section>

              {cfg.skillsLabel && (
                <Section title={cfg.skillsLabel}>
                  <div className="flex flex-wrap gap-2">
                    {(editing ? form.skills : p.skills || []).map((s: string) => (
                      <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {s}
                        {editing && (
                          <button onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })} aria-label={`Remove ${s}`}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    ))}
                    {!editing && !(p.skills || []).length && <p className="text-sm text-gray-400">Nothing added yet.</p>}
                  </div>
                  {editing && (
                    <div className="mt-4 flex gap-2">
                      <input
                        value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                        placeholder="Type and press Enter" className="flex-1 px-3 py-2.5"
                      />
                      <button type="button" onClick={addSkill} className="btn-secondary"><Plus className="h-4 w-4" /> Add</button>
                    </div>
                  )}
                </Section>
              )}

              {role === 'employer' && !editing && (
                <Section title="Your hiring workspace">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { to: '/jobs/manage', label: 'My jobs', icon: Briefcase },
                      { to: '/companies/manage', label: 'My companies', icon: Building2 },
                      { to: '/applications/manage', label: 'Applicants', icon: Users },
                    ].map(({ to, label, icon: Icon }) => (
                      <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50">
                        <Icon className="h-5 w-5 text-blue-700" /> {label}
                      </Link>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            <div className="space-y-6">
              <Section title="Details">
                {editing ? (
                  <div className="space-y-4">
                    {cfg.work && (
                      <>
                        <Field label={role === 'employer' ? 'Organisation' : 'Current company'}><input value={form.company} onChange={set('company')} className="w-full px-3 py-2.5" /></Field>
                        <Field label="Job title"><input value={form.position} onChange={set('position')} className="w-full px-3 py-2.5" /></Field>
                      </>
                    )}
                    {cfg.education && (
                      <>
                        <Field label="University"><input value={form.university} onChange={set('university')} className="w-full px-3 py-2.5" /></Field>
                        <Field label="Graduation year"><input type="number" min={1950} max={2100} value={form.graduationYear} onChange={set('graduationYear')} className="w-full px-3 py-2.5" /></Field>
                      </>
                    )}
                    <Field label="Location"><input value={form.location} onChange={set('location')} placeholder="City, Country" className="w-full px-3 py-2.5" /></Field>
                    <Field label="LinkedIn"><input value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/…" className="w-full px-3 py-2.5" /></Field>
                    {cfg.github && <Field label="GitHub"><input value={form.github} onChange={set('github')} placeholder="https://github.com/…" className="w-full px-3 py-2.5" /></Field>}
                    <Field label="Website"><input value={form.website} onChange={set('website')} placeholder="https://…" className="w-full px-3 py-2.5" /></Field>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cfg.work && <InfoRow icon={Briefcase} label={role === 'employer' ? 'Organisation' : 'Works at'} value={[p.position, p.company].filter(Boolean).join(' · ')} />}
                    {cfg.education && <InfoRow icon={GraduationCap} label="Education" value={[p.university, p.graduationYear].filter(Boolean).join(' · ')} />}
                    <InfoRow icon={MapPin} label="Location" value={p.location} />
                    <InfoRow icon={Linkedin} label="LinkedIn" value={p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{p.linkedin}</a>} />
                    {cfg.github && <InfoRow icon={Github} label="GitHub" value={p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{p.github}</a>} />}
                    <InfoRow icon={Globe} label="Website" value={p.website && <a href={p.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{p.website}</a>} />
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}

        {/* Posts */}
        {tab === 'posts' && cfg.posts && (
          <div className="mx-auto max-w-2xl space-y-4">
            <CreatePostForm onPostCreated={load} />
            {loading ? <PageLoader /> : posts.length === 0 ? (
              <div className="card"><EmptyState title="You haven’t posted yet" description="Share an update, a win or something you learned." /></div>
            ) : (
              posts.map((post) => <PostCard key={post._id} post={post} onDelete={(id: string) => setPosts((prev) => prev.filter((x) => x._id !== id))} />)
            )}
          </div>
        )}

        {/* Resume */}
        {tab === 'resume' && cfg.resume && (
          <div className="mx-auto max-w-2xl"><CVUploader cv={cv} onCVUpdated={load} /></div>
        )}

        {/* Security */}
        {tab === 'security' && (
          <div className="mx-auto max-w-lg">
            <Section title="Change password">
              <form onSubmit={changePassword} className="space-y-4">
                <Field label="Current password"><input type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className="w-full px-3 py-2.5" /></Field>
                <Field label="New password"><input type="password" required minLength={6} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className="w-full px-3 py-2.5" /></Field>
                <Field label="Confirm new password"><input type="password" required autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="w-full px-3 py-2.5" /></Field>
                <button type="submit" disabled={pwSaving} className="btn-primary disabled:opacity-60">
                  {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password
                </button>
              </form>
              <p className="mt-4 text-xs text-gray-500">Signed in as {user.email}</p>
            </Section>
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
};

export default Profile;

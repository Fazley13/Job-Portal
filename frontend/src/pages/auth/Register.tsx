import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, User, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';

const roles = [
  { value: 'student', label: 'Student', hint: 'Find jobs and mentors', icon: GraduationCap },
  { value: 'alumni', label: 'Alumni', hint: 'Mentor and refer', icon: UserCheck },
  { value: 'employer', label: 'Employer', hint: 'Hire talent', icon: Building2 },
];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '', role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const { confirmPassword: _confirm, ...payload } = formData;
      await register({ ...payload, email: payload.email.trim() });
    } catch {
      // The auth context already shows the error toast
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a minute. Pick the role that fits you best."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">I am a…</legend>
          <div className="grid grid-cols-3 gap-2">
            {roles.map(({ value, label, hint, icon: Icon }) => {
              const selected = formData.role === value;
              return (
                <label
                  key={value}
                  className={`cursor-pointer rounded-xl border p-3 text-center transition-colors focus-within:ring-2 focus-within:ring-blue-500/40 ${
                    selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input type="radio" name="role" value={value} checked={selected} onChange={handleChange} className="sr-only" />
                  <Icon className={`mx-auto h-5 w-5 ${selected ? 'text-blue-700' : 'text-gray-400'}`} />
                  <span className="mt-1.5 block text-sm font-semibold text-gray-900">{label}</span>
                  <span className="hidden text-[11px] text-gray-500 sm:block">{hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-gray-700">First name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input id="firstName" name="firstName" required autoComplete="given-name" className="block w-full py-3 pl-10 pr-3" value={formData.firstName} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-gray-700">Last name</label>
            <input id="lastName" name="lastName" required autoComplete="family-name" className="block w-full px-3 py-3" value={formData.lastName} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input id="email" name="email" type="email" required autoComplete="email" className="block w-full py-3 pl-11 pr-3" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" className="block w-full py-3 pl-10 pr-3" value={formData.password} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">Confirm</label>
            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" className="block w-full py-3 pl-3 pr-10" value={formData.confirmPassword} onChange={handleChange} />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <p className="-mt-2 text-xs text-gray-500">Use at least 6 characters.</p>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account</> : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;

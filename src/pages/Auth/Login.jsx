import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isValidEmail } from '../../utils/validators';
import {
  Eye, EyeOff, Mail, Lock, CheckCircle, ArrowRight,
  Send, BarChart3, Users, Zap,
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(formData);
    console.log('Login result:', result);
    if (result.success) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (result.accounts && result.accounts.length > 0) {
        navigate('/select-account', { state: { accounts: result.accounts, email: formData.email } });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const features = [
    { icon: Send,      text: '2.4B+ emails delivered with 98.7% deliverability' },
    { icon: BarChart3, text: 'Real-time analytics — opens, clicks, revenue' },
    { icon: Users,     text: '50,000+ businesses trust Mail Pilot' },
  ];

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-linear-to-br from-slate-900 via-slate-800 to-primary-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 w-fit">
          <img src="/mail-pilot-logo.png" alt="Mail Pilot" className="w-10 h-10" />
          <span className="text-white text-2xl font-bold">Mail Pilot</span>
        </Link>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-primary-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" /> Performance Email CRM
            </span>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Send Smarter.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-teal-300">
                Grow Faster.
              </span>
            </h2>
            <p className="mt-4 text-slate-300 text-lg leading-relaxed max-w-sm">
              The CRM platform built for marketers who demand results — not just reports.
            </p>
          </div>
          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-slate-300 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 border border-white/15 rounded-2xl p-6">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
          </div>
          <p className="text-white text-sm leading-relaxed italic mb-3">
            "Mail Pilot tripled our email revenue in 60 days. The analytics are insane — we finally know what's working."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">SK</div>
            <div>
              <p className="text-white text-xs font-semibold">Sarah K.</p>
              <p className="text-slate-400 text-xs">Director of Marketing · Acme Corp</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/mail-pilot-logo.png" alt="Mail Pilot" className="w-9 h-9" />
              <span className="text-slate-900 text-xl font-bold">Mail Pilot</span>
            </Link>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your Mail Pilot account to continue.</p>

          {/* Status banners */}
          {location.state?.message && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{location.state.message}</p>
            </div>
          )}
          {authError && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-5 h-5 shrink-0 mt-0.5 text-red-600">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-sm text-red-800">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors outline-none
                    ${errors.email ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-colors outline-none
                    ${errors.password ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Create one free
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-slate-400">
            By signing in, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-slate-600">Terms</span> and{' '}
            <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

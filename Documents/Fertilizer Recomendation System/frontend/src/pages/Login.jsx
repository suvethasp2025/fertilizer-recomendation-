import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn, AlertCircle, Leaf, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
        style={{ border: '1px solid var(--border-color)' }}
      >

        {/* ── Left Panel: Branding ─────────────────────────── */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 rounded-xl border border-emerald-500/25">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-wide text-white">Flora</span>
          </div>

          {/* Hero text */}
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-extrabold text-white leading-snug">
              Empower Your<br />Harvest with AI
            </h2>
            <p className="text-emerald-200/60 text-sm leading-relaxed max-w-xs">
              Sign in to access your personal dashboard, generate custom soil reports, and monitor farm weather trends.
            </p>

            {/* Feature bullets */}
            <ul className="space-y-2 pt-2">
              {[
                'AI fertilizer recommendations',
                'Real-time weather insights',
                'Downloadable PDF field reports',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-xs text-emerald-300/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer note */}
          <p className="relative z-10 text-xs text-emerald-400/30">
            &copy; {new Date().getFullYear()} Flora Prediction Suite
          </p>
        </div>

        {/* ── Right Panel: Login Form ──────────────────────── */}
        <div
          className="flex flex-col justify-center p-8 md:p-10 backdrop-blur-md"
          style={{ background: 'var(--bg-card)' }}
        >

          {/* Mobile logo (hidden on md+) */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Flora</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Sign in to manage your recommendations.</p>
          </div>

          {/* Session-expired banner */}
          {isExpired && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 p-3.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400 leading-relaxed">
                Your session has expired. Please sign in again.
              </p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-500/8 border border-red-500/20 p-3.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-11 text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-11 text-sm"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-emerald text-white text-sm font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 border border-emerald-400/20 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-1"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

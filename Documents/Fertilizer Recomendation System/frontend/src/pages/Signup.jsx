import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, Phone, MapPin, Sparkles, AlertCircle, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('farmer'); // default 'farmer'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength checker helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Medium', color: 'bg-amber-500' };
    if (score >= 3) return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name || !email || !phone || !location || !password || !confirmPassword) {
      setError('Please fill in all input fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signup({
      name,
      email,
      phone,
      location,
      password,
      role
    });
    setLoading(false);

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error || 'Failed to complete registration.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto glass border border-slate-900 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl my-4 animate-fade-in">

      {/* Left side: Visual Branding */}
      <div className="relative hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center space-x-2 relative z-10">
          <Leaf className="w-8 h-8 text-emerald-400" />
          <span className="text-xl font-bold tracking-wider font-display">Flora</span>
        </div>

        <div className="space-y-6 relative z-10">
          <h2 className="text-4xl font-extrabold leading-tight">
            Begin Your <br />
            Precision Journey
          </h2>
          <p className="text-emerald-200/70 text-sm leading-relaxed max-w-sm">
            Create an account to run classifier predictions, view dynamic soil analytics charts, manage catalogs, and get climate warnings.
          </p>
        </div>

        <div className="text-xs text-emerald-300/40 relative z-10">
          &copy; {new Date().getFullYear()} Flora Prediction Suite.
        </div>
      </div>

      {/* Right side: Signup Form */}
      <div className="p-8 md:p-12 flex flex-col justify-center bg-slate-950/60 backdrop-blur-md overflow-y-auto max-h-[90vh]">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-100">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Register to start predicting.</p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-500/5 border border-red-500/15 flex items-start space-x-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input pl-10 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone (E.164 format)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input pl-10 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location / Region</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tamil Nadu, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="glass-input pl-10 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Select Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${role === 'farmer' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}
              >
                🌾 Farmer (Standard)
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${role === 'admin' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}
              >
                🛡️ System Admin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 text-sm"
                  required
                />
              </div>
              {/* Strength Meter */}
              {password && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex space-x-1 flex-1 max-w-[120px] mr-2">
                    <div className={`h-1 rounded-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`}></div>
                    <div className={`h-1 rounded-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`}></div>
                    <div className={`h-1 rounded-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`}></div>
                    <div className={`h-1 rounded-full flex-1 ${strength.score >= 4 ? strength.color : 'bg-slate-800'}`}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{strength.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input pl-10 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-emerald text-white font-bold shadow-lg hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 border border-emerald-400/25 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Signup;

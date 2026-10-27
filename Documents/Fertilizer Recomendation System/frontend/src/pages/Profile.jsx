import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Phone, MapPin, Key, Trash2, Calendar, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  
  // Profile Update fields state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Account delete double confirmation
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name || !phone || !location) {
      toast.error('All fields must be filled in.');
      return;
    }
    
    setProfileLoading(true);
    const res = await updateProfile({ name, phone, location });
    setProfileLoading(false);
    
    if (res.success) {
      toast.success('Your profile details were updated.');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please enter all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/api/users/profile/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail || 'Failed to change password.';
      toast.error(detail);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (confirmEmail !== user.email) {
      toast.error('Email confirmation does not match your account.');
      return;
    }

    if (!window.confirm('WARNING: Deleting your account will remove your entire prediction history permanently. This action is irreversible. Proceed?')) {
      return;
    }

    setDeleteLoading(true);
    const res = await deleteAccount();
    setDeleteLoading(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-page">
      
      {/* Header Panel */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-900/60 flex items-center space-x-4">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
          alt="avatar"
          className="w-16 h-16 rounded-2xl object-cover border border-slate-700 bg-slate-900 shrink-0"
        />
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2">
            {user.name}
            {user.role === 'admin' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-extrabold uppercase tracking-wide">
                Admin
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Stats Summary & Details forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Summary and Information */}
        <div className="space-y-6">
          <div className="glass-card space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">Profile Statistics</h3>
            
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Recommendations</p>
                <p className="text-lg font-bold text-slate-200">{user.prediction_count} calculations</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Member Since</p>
                <p className="text-sm font-bold text-slate-300">
                  {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Account Role</p>
                <p className="text-sm font-bold text-slate-300 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Details forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Form */}
          <form onSubmit={handleProfileUpdate} className="glass-card space-y-5">
            <h3 className="text-sm font-bold text-slate-300 border-b border-slate-900 pb-2 uppercase tracking-wider">Account Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Contact</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="glass-input pl-12"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location / Region</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="glass-input pl-12"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 rounded-xl bg-gradient-emerald text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/10 hover:scale-[1.01] cursor-pointer disabled:opacity-50"
              >
                {profileLoading ? 'Updating details...' : 'Update Settings'}
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordUpdate} className="glass-card space-y-5">
            <h3 className="text-sm font-bold text-slate-300 border-b border-slate-900 pb-2 uppercase tracking-wider">Modify Account Password</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="glass-input pl-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-input pl-12"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? 'Verifying password...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Danger Zone: Account Deletion */}
          <div className="glass-card border border-rose-500/15 bg-rose-500/5 space-y-4">
            <div className="flex justify-between items-center border-b border-rose-500/10 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2 uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Security Danger Zone</span>
              </h3>
            </div>
            
            {!showDeleteZone ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs font-semibold text-rose-300">Delete Profile and Prediction History</p>
                  <p className="text-[11px] text-slate-400 mt-1">Once clicked, all model logs, recommendations, and files are destroyed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteZone(true)}
                  className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Delete My Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleDeleteAccount} className="space-y-4 animate-fade-in text-xs">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 leading-relaxed">
                  <strong>Warning:</strong> To confirm account deletion, please type your registered email address <strong>{user.email}</strong> below:
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="email"
                    placeholder="Enter email here..."
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="glass-input text-xs py-2.5 flex-1"
                    required
                  />
                  <div className="flex space-x-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => { setShowDeleteZone(false); setConfirmEmail(''); }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold transition-all text-xs flex-1 sm:flex-none text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={deleteLoading || confirmEmail !== user.email}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold transition-all text-xs flex-1 sm:flex-none text-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;

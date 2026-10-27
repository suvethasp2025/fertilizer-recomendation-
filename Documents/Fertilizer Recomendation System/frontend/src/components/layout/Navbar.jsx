import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, LogOut, User, Bell, Menu, X, Leaf } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full backdrop-blur-md px-6 py-4 flex items-center justify-between"
      style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-color)', transition: 'background 0.3s ease' }}
    >
      <div className="flex items-center space-x-3">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-800 rounded-lg lg:hidden text-slate-400 hover:text-emerald-400 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/25">
            <Leaf className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-300 tracking-wide font-display">
            Flora
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border transition-all duration-200 hover:border-emerald-500/40"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        {user ? (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border transition-all duration-200 hover:border-emerald-500/40"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" style={{ border: '2px solid var(--bg-base)' }}></span>
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-3 w-80 rounded-2xl p-4 shadow-2xl animate-fade-in text-left z-50"
                  style={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border-color)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="flex justify-between items-center mb-3 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                    <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="font-semibold text-emerald-400 mb-0.5">Optimal Farming Season</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Current humidity is 58% - ideal timing to apply urea for wheat crop.</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>2 hours ago</span>
                    </div>
                    <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                      <p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Model Updated</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Admin has retrained the classifier dataset. Prediction confidence increased.</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>1 day ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl border transition-all duration-200 hover:border-emerald-500/30"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-lg object-cover"
                  style={{ border: '1px solid var(--border-color)' }}
                />
                <span className="hidden md:inline text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-3 w-56 rounded-2xl py-2 shadow-2xl animate-fade-in z-50"
                  style={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border-color)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Signed in as</p>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm transition-all duration-200 hover:text-emerald-400"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm transition-all duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">Admin Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left mt-1"
                    style={{ borderTop: '1px solid var(--border-color)' }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl bg-gradient-emerald text-sm font-semibold text-white shadow-lg transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

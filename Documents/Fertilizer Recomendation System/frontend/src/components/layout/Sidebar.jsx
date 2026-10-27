import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Sprout, 
  BookOpen, 
  History, 
  User, 
  ShieldAlert, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Prediction Form', path: '/predict', icon: Sprout },
    { name: 'Fertilizers Library', path: '/fertilizers', icon: BookOpen },
    { name: 'Prediction History', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldAlert, highlight: true });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 backdrop-blur-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-80px)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', transition: 'background 0.3s ease, transform 0.3s ease' }}
      >
        <div className="flex justify-between items-center px-6 py-5 lg:hidden" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="font-bold text-emerald-400">Navigation</span>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-80px)] lg:h-full py-6 px-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? item.highlight 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
                      : item.highlight
                        ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                        : 'hover:bg-emerald-500/5 hover:text-emerald-500'
                  }`}
                  style={({ isActive }) => ({
                    color: isActive ? undefined : 'var(--text-secondary)',
                  })}
                >
                  <Icon className={`w-5 h-5 group-hover:scale-110 transition-transform duration-200 ${item.highlight ? 'text-emerald-400' : ''}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Signout area in bottom of sidebar */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-agriculture-pattern"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}
    >
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-row overflow-hidden">
        {user && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        )}
        
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 flex flex-col justify-between">
          <div className="w-full max-w-7xl mx-auto flex-1">
            {children}
          </div>
          <div className="mt-12">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

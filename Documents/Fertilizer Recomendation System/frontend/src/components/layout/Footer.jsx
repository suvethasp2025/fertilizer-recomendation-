import React from 'react';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full glass border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-slate-500 text-xs">
      <div className="flex items-center space-x-2">
        <Leaf className="w-4 h-4 text-emerald-500" />
        <span className="font-semibold text-slate-400">Flora Prediction Suite</span>
      </div>
      <div>
        <p>&copy; {new Date().getFullYear()} Flora Corp. empowering farmers with AI.</p>
      </div>
      <div className="flex space-x-4">
        <a href="#about" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
      </div>
    </footer>
  );
};

export default Footer;

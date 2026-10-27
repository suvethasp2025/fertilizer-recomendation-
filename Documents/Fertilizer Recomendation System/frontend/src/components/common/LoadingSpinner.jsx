import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-20 h-20 border-8',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`relative ${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-12 h-12' : 'w-20 h-20'}`}>
        {/* Outer glowing ring */}
        <div className={`absolute inset-0 rounded-full border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin ${sizeClasses[size]}`}></div>
        {/* Inner reverse-spinning ring */}
        <div className={`absolute inset-1.5 rounded-full border-t-transparent border-r-transparent border-b-green-500 border-l-transparent animate-spin-reverse opacity-70 ${size === 'small' ? 'border-2' : size === 'medium' ? 'border-2' : 'border-4'}`}></div>
      </div>
      {size !== 'small' && (
        <span className="text-emerald-400 text-sm font-semibold tracking-wider animate-pulse uppercase">
          Nourishing crops...
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

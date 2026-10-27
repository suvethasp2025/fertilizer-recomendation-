import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtext }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      glow: 'bg-emerald-500/5',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/25',
      text: 'text-blue-400',
      glow: 'bg-blue-500/5',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/25',
      text: 'text-amber-400',
      glow: 'bg-amber-500/5',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/25',
      text: 'text-purple-400',
      glow: 'bg-purple-500/5',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/25',
      text: 'text-rose-400',
      glow: 'bg-rose-500/5',
    },
  };

  const activeColor = colorMap[color] || colorMap.emerald;

  return (
    <div className="glass-card relative overflow-hidden flex flex-col justify-between p-6">
      {/* Background glow shadow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none ${activeColor.glow}`}></div>

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-100 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${activeColor.bg} ${activeColor.border}`}>
          <Icon className={`w-5 h-5 ${activeColor.text}`} />
        </div>
      </div>

      {subtext && (
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <p className="text-xs text-slate-400 truncate">{subtext}</p>
        </div>
      )}
    </div>
  );
};

export default StatCard;

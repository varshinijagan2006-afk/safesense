import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, subtext, trend, trendValue, icon: Icon, accentColor = 'amber' }) {
  const accentClasses = {
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
  };

  const accent = accentClasses[accentColor] || accentClasses.amber;

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${accent}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-3xl font-extrabold text-slate-50 tracking-tight">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend === 'up-bad' || trend === 'down-bad' ? 'text-red-400' :
            trend === 'up-good' || trend === 'down-good' ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {trend.startsWith('up') && <TrendingUp className="w-3.5 h-3.5" />}
            {trend.startsWith('down') && <TrendingDown className="w-3.5 h-3.5" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}

import React from 'react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || 'LOW').toUpperCase();

  const badgeStyles = {
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const dots = {
    CRITICAL: 'bg-red-500 animate-pulse',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-amber-400',
    LOW: 'bg-emerald-400',
  };

  const style = badgeStyles[sev] || badgeStyles.LOW;
  const dot = dots[sev] || dots.LOW;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`}></span>
      {sev}
    </span>
  );
}

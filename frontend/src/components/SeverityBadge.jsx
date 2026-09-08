import React from 'react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || 'LOW').toUpperCase();

  const badgeStyles = {
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const style = badgeStyles[sev] || badgeStyles.LOW;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${style}`}>
      {sev}
    </span>
  );
}

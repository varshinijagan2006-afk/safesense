import React from 'react';

export default function RiskGauge({ score, severity, size = 'normal' }) {
  const s = Math.min(100, Math.max(0, score || 0));

  const getColor = (val) => {
    if (val >= 75) return '#EF4444'; // Critical
    if (val >= 55) return '#F97316'; // High
    if (val >= 30) return '#EAB308'; // Medium
    return '#22C55E'; // Low
  };

  const color = getColor(s);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (s / 100) * circumference;

  const isLarge = size === 'large';
  const svgSize = isLarge ? 140 : 100;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90" width={svgSize} height={svgSize} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#1E293B"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-bold tracking-tight text-slate-100 ${isLarge ? 'text-3xl' : 'text-xl'}`}>
            {s}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">/ 100</span>
        </div>
      </div>
      {severity && (
        <span
          className="mt-2 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ color: color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
        >
          {severity}
        </span>
      )}
    </div>
  );
}

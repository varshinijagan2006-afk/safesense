import React from 'react';
import { Bell, Search, ShieldCheck } from 'lucide-react';

export default function TopBar({ title, subtitle, searchVal, onSearchChange }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#090D16]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {onSearchChange && (
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incidents, tags..."
              value={searchVal || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Explainable AI Engine</span>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
        </button>
      </div>
    </header>
  );
}

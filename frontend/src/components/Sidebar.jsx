import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FilePlus, 
  History, 
  BarChart3, 
  FileText, 
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard }
      ]
    },
    {
      group: 'OPERATIONS',
      items: [
        { name: 'Incident Analyzer', path: '/analyzer', icon: FilePlus },
        { name: 'Incident History', path: '/history', icon: History }
      ]
    },
    {
      group: 'INSIGHTS',
      items: [
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Reports', path: '/reports', icon: FileText }
      ]
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100 tracking-tight leading-none">
            SafeSense
          </h1>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1 block">
            WORKPLACE SAFETY
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.group}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Status Banner */}
      <div className="mx-3 my-2 px-3 py-2 rounded-md bg-slate-900/80 border border-slate-800/80 text-[11px] flex items-center justify-between">
        <span className="text-slate-400 font-medium">System Status</span>
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Operational
        </span>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
            {user?.name ? user.name[0] : 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Safety Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Senior Safety Manager'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onLogout) onLogout();
            navigate('/login');
          }}
          title="Sign Out"
          className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

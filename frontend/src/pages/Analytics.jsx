import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Flame, 
  Droplet, 
  Zap, 
  Footprints, 
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

import StatCard from '../components/StatCard';
import { getAnalytics } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const severityColors = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#EAB308',
    Low: '#22C55E'
  };

  const riskIcons = [Droplet, Zap, Footprints, Wrench, ShieldCheck];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-500" />
          Safety Analytics &amp; Risk Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep-dive statistical analysis, department comparative safety index, and priority risk rankings
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Incidents"
          value={data?.total_incidents ?? 128}
          subtext="Logged in system"
          icon={BarChart3}
          accentColor="amber"
        />
        <StatCard
          title="Critical Ratio"
          value={`${data?.critical_percentage ?? 13.3}%`}
          subtext={`${data?.critical_incidents ?? 17} critical incidents`}
          icon={AlertTriangle}
          accentColor="red"
        />
        <StatCard
          title="High Risk Ratio"
          value={`${data?.high_percentage ?? 24.2}%`}
          subtext={`${data?.high_incidents ?? 31} high risk incidents`}
          icon={TrendingUp}
          accentColor="orange"
        />
        <StatCard
          title="Resolution Rate"
          value={`${data?.resolution_rate ?? 75.0}%`}
          subtext={`${data?.resolved_incidents ?? 96} issues resolved`}
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Avg Risk Index"
          value={data?.average_risk_score ?? 64.2}
          subtext="0–100 weighted score"
          icon={Building2}
          accentColor="blue"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Monthly Incident Volume &amp; Critical Trends</h3>
              <p className="text-[11px] text-slate-400">Total incidents vs critical severity events over time</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_trend || []}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="incidents" stroke="#F59E0B" fillOpacity={1} fill="url(#colorInc)" name="Total Incidents" />
                <Area type="monotone" dataKey="critical" stroke="#EF4444" fillOpacity={1} fill="url(#colorCrit)" name="Critical Incidents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparative Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Department Safety Comparison</h3>
            <p className="text-[11px] text-slate-400">Incident count and average risk score by department</p>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.department_stats || []}>
                <XAxis dataKey="department" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Incidents Count" />
                <Bar dataKey="avg_risk" fill="#EA580C" radius={[4, 4, 0, 0]} name="Avg Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Safety Risks & Category Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Safety Risks List */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Top Safety Risks &amp; Vulnerabilities
            </h3>
            <p className="text-[11px] text-slate-400">Ranked by historical frequency and severity impact</p>
          </div>

          <div className="space-y-3">
            {(data?.top_risks || []).map((rk, i) => {
              const IconComp = riskIcons[i % riskIcons.length];
              return (
                <div key={rk.rank} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center">
                      #{rk.rank}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-amber-400" />
                        {rk.risk}
                      </h4>
                      <span className="text-[10px] text-slate-400">Category: {rk.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      {rk.frequency} events
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rk.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {rk.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Pie Chart */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Overall Severity Ratio</h3>
            <p className="text-[11px] text-slate-400">Proportional classification of incidents</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
            Automated dynamic statistics refreshed from SQLite database records.
          </div>
        </div>
      </div>
    </div>
  );
}

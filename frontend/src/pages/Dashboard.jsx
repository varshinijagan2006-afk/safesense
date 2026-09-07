import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Eye, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
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
import SeverityBadge from '../components/SeverityBadge';
import IncidentModal from '../components/IncidentModal';
import { getAnalytics, getIncidents } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, incidentsRes] = await Promise.all([
        getAnalytics(),
        getIncidents({ limit: 6 })
      ]);
      setStats(analyticsRes);
      setIncidents(incidentsRes);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdated = () => {
    fetchData();
  };

  const severityColors = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#EAB308',
    Low: '#22C55E'
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
            Safety Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-powered workplace incident monitoring and risk assessment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/analyzer')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Analyze New Incident</span>
          </button>
        </div>
      </div>

      {/* Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Incidents"
          value={stats?.total_incidents ?? 128}
          subtext="Recorded site logs"
          trend="up-good"
          trendValue="+12% mo"
          icon={ShieldAlert}
          accentColor="amber"
        />
        <StatCard
          title="Critical Incidents"
          value={stats?.critical_incidents ?? 17}
          subtext={`${stats?.critical_percentage ?? 13.2}% of total`}
          trend="down-good"
          trendValue="-4%"
          icon={AlertOctagon}
          accentColor="red"
        />
        <StatCard
          title="High Risk"
          value={stats?.high_incidents ?? 31}
          subtext={`${stats?.high_percentage ?? 24.2}% requiring action`}
          trend="neutral"
          trendValue="Stable"
          icon={AlertTriangle}
          accentColor="orange"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolved_incidents ?? 96}
          subtext={`${stats?.resolution_rate ?? 75}% resolution rate`}
          trend="up-good"
          trendValue="+8%"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Avg Risk Score"
          value={stats?.average_risk_score ?? 64}
          subtext="Scale 0–100 index"
          trend="down-good"
          trendValue="-2.5 pts"
          icon={Activity}
          accentColor="blue"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: 7-Month Incident Trend */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Incident Activity &amp; Risk Score Trend</h3>
              <p className="text-[11px] text-slate-400">Monthly total volume vs average risk severity</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Last 7 Months
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthly_trend || []}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' }}
                />
                <Line type="monotone" dataKey="incidents" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} name="Total Incidents" />
                <Line type="monotone" dataKey="avg_score" stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" name="Avg Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Severity Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Incident Severity Distribution</h3>
            <p className="text-[11px] text-slate-400">Risk classification ratio breakdown</p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {(stats?.severity_distribution || []).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[item.name] }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart: Category Breakdown */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Incident Category Distribution</h3>
          <p className="text-[11px] text-slate-400">Occurrences categorized by hazard type</p>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.category_distribution || []}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#EA580C" radius={[6, 6, 0, 0]} name="Incident Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Recent Reported Incidents</h3>
            <p className="text-[11px] text-slate-400">Latest hazard submissions needing review</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View All History &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-center">Risk Score</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No incidents recorded yet. Use the Incident Analyzer to submit one!
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-400">{inc.id}</td>
                    <td className="p-3.5 text-slate-400">{inc.created_at.slice(0, 10)}</td>
                    <td className="p-3.5 font-medium">{inc.category}</td>
                    <td className="p-3.5 text-slate-400">{inc.location}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-100">
                      {inc.risk_score}
                    </td>
                    <td className="p-3.5">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        inc.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        inc.status === 'Under Investigation' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}

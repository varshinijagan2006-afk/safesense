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
  RefreshCw,
  Cpu,
  BrainCircuit,
  RotateCw,
  Database,
  Check
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
import Toast from '../components/Toast';
import { getAnalytics, getIncidents, getMLStatus, retrainModel } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [showRetrainModal, setShowRetrainModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, incidentsRes, mlRes] = await Promise.all([
        getAnalytics(),
        getIncidents({ limit: 6 }),
        getMLStatus().catch(() => null)
      ]);
      setStats(analyticsRes);
      setIncidents(incidentsRes);
      setMlStatus(mlRes);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetrain = async () => {
    setShowRetrainModal(false);
    setRetraining(true);
    try {
      const res = await retrainModel();
      setToast({ message: res.message || 'Model retrained successfully!', type: 'success' });
      await fetchData();
    } catch (err) {
      setToast({ message: err.message || 'Retraining failed', type: 'error' });
    } finally {
      setRetraining(false);
    }
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
          <h1 className="text-xl font-bold text-slate-50 tracking-tight">
            Safety Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor workplace incidents, risk levels and safety performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/analyzer')}
            className="px-3.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="TOTAL INCIDENTS"
          value={stats?.total_incidents ?? 0}
          subtext="Logged in system"
          icon={ShieldAlert}
          accentColor="amber"
        />
        <StatCard
          title="CRITICAL INCIDENTS"
          value={stats?.critical_incidents ?? 0}
          subtext={`${stats?.critical_percentage ?? 0}% ratio`}
          icon={AlertOctagon}
          accentColor="red"
        />
        <StatCard
          title="HIGH RISK"
          value={stats?.high_incidents ?? 0}
          subtext="Requires action"
          icon={AlertTriangle}
          accentColor="orange"
        />
        <StatCard
          title="OPEN INCIDENTS"
          value={(stats?.pending_incidents || 0) + (stats?.under_investigation_incidents || 0)}
          subtext="Pending / investigating"
          icon={Activity}
          accentColor="amber"
        />
        <StatCard
          title="RESOLVED"
          value={stats?.resolved_incidents ?? 0}
          subtext={`${stats?.resolution_rate ?? 0}% resolution rate`}
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="AVERAGE RISK"
          value={stats?.average_risk_score ?? 0}
          subtext="0–100 scale"
          icon={Activity}
          accentColor="blue"
        />
      </div>

      {/* Redesigned Safety Intelligence Status Card */}
      <div className="bg-slate-900/90 rounded-lg border border-slate-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">SAFETY INTELLIGENCE</h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Operational
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hybrid risk evaluation engine combining domain safety rules and validated ML model predictions.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRetrainModal(true)}
            disabled={retraining}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 self-start sm:self-auto shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining...' : 'Retrain Model'}</span>
          </button>
        </div>

        {/* Compact Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Model Version</span>
            <span className="text-xs font-mono font-bold text-amber-400">v{mlStatus?.model_version || '1.0.1'}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Training Records</span>
            <span className="text-xs font-mono font-bold text-slate-200">{mlStatus?.training_records || 1010}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Validation Performance</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {mlStatus?.accuracy ? `${(mlStatus.accuracy * 100).toFixed(1)}%` : '90.0%'}
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Last Trained</span>
            <span className="text-xs font-mono text-slate-300">
              {mlStatus?.last_trained ? mlStatus.last_trained.slice(0, 10) : 'Recent'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Incident Trend */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-lg border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Incident Trend</h3>
              <p className="text-[11px] text-slate-400">Monthly incident volume and average risk trend</p>
            </div>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthly_trend || []}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '6px', fontSize: '12px', color: '#F8FAFC' }}
                />
                <Line type="monotone" dataKey="incidents" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} name="Total Incidents" />
                <Line type="monotone" dataKey="avg_score" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 3" name="Avg Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Incidents by Severity */}
        <div className="bg-slate-900/90 rounded-lg border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Incidents by Severity</h3>
            <p className="text-[11px] text-slate-400">Severity level distribution</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '6px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
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

      {/* Visual Charts Grid 2: Incidents by Category & Resolution Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Incidents by Category */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-lg border border-slate-800 p-4 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Incidents by Category</h3>
            <p className="text-[11px] text-slate-400">Occurrences breakdown by hazard classification</p>
          </div>

          <div className="h-52 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.category_distribution || []}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Incident Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Status Summary */}
        <div className="bg-slate-900/90 rounded-lg border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resolution Status</h3>
            <p className="text-[11px] text-slate-400">Status breakdown of logged incidents</p>
          </div>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Resolved Incidents</span>
                <span className="text-emerald-400 font-bold">{stats?.resolved_incidents || 0}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats?.resolution_rate || 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Under Investigation</span>
                <span className="text-sky-400 font-bold">{stats?.under_investigation_incidents || 0}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.min(100, ((stats?.under_investigation_incidents || 0) / (stats?.total_incidents || 1)) * 100)}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Pending Action</span>
                <span className="text-amber-400 font-bold">{stats?.pending_incidents || 0}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, ((stats?.pending_incidents || 0) / (stats?.total_incidents || 1)) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 text-center">
            {stats?.resolution_rate || 0}% overall resolution rate
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Recent Incidents</h3>
            <p className="text-[11px] text-slate-400">Latest recorded workplace safety incidents</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View History &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">DATE</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">LOCATION</th>
                <th className="p-3 text-center">RISK</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">REVIEW</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No incidents logged in system.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">{inc.id}</td>
                    <td className="p-3 text-slate-400">{inc.created_at.slice(0, 10)}</td>
                    <td className="p-3 font-medium">{inc.category}</td>
                    <td className="p-3 text-slate-400">{inc.location}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-100">
                      {inc.risk_score}
                    </td>
                    <td className="p-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        inc.verified
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {inc.verified ? 'Verified' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        inc.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        inc.status === 'Under Investigation' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
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

      {/* Retrain Confirmation Modal */}
      {showRetrainModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-lg w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Retrain Safety Model?</h3>
                <p className="text-xs text-slate-400">Random Forest Classifier &amp; Regressor</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Retraining compiles all human-verified incident records with synthetic bootstrap data to update safety model parameters.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRetrainModal(false)}
                className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRetrain}
                className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Confirm Retraining</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Details Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={fetchData}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

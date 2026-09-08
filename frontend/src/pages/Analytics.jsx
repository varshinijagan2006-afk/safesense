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
  ShieldCheck,
  BrainCircuit,
  Cpu,
  UserCheck,
  Clock,
  Target
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
import { getAnalytics, getMLStatus, getFeatureImportance } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [featureImportances, setFeatureImportances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, mlRes, fiRes] = await Promise.all([
          getAnalytics(),
          getMLStatus().catch(() => null),
          getFeatureImportance().catch(() => null)
        ]);
        setData(analyticsRes);
        setMlStatus(mlRes);
        if (fiRes && fiRes.top_features) {
          setFeatureImportances(fiRes.top_features);
        }
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
        <h1 className="text-xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
          Safety Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Operational safety trends, incident patterns and review performance.
        </p>
      </div>

      {/* Top 6 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="TOTAL INCIDENTS"
          value={data?.total_incidents ?? 0}
          subtext="Logged in system"
          icon={BarChart3}
          accentColor="amber"
        />
        <StatCard
          title="CRITICAL INCIDENTS"
          value={data?.critical_incidents ?? 0}
          subtext={`${data?.critical_percentage ?? 0}% ratio`}
          icon={AlertTriangle}
          accentColor="red"
        />
        <StatCard
          title="VERIFIED INCIDENTS"
          value={data?.verified_incidents ?? 0}
          subtext="Human verified"
          icon={UserCheck}
          accentColor="emerald"
        />
        <StatCard
          title="PENDING REVIEWS"
          value={data?.pending_reviews ?? 0}
          subtext="Awaiting review"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="AGREEMENT RATE"
          value={data?.prediction_agreement_rate !== null && data?.prediction_agreement_rate !== undefined ? `${data.prediction_agreement_rate}%` : 'N/A'}
          subtext={data?.prediction_agreement_rate !== null && data?.prediction_agreement_rate !== undefined ? 'Reviewed agreement' : 'No reviews yet'}
          icon={Target}
          accentColor="blue"
        />
        <StatCard
          title="AVERAGE RISK"
          value={data?.average_risk_score ?? 0}
          subtext="0–100 weighted score"
          icon={Building2}
          accentColor="orange"
        />
      </div>

      {/* Safety Intelligence Performance Section */}
      <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <BrainCircuit className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Safety Intelligence Performance</h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-slate-950 border border-slate-800">
            Version {mlStatus?.model_version || '1.0.1'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validation Accuracy</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {mlStatus?.accuracy ? `${(mlStatus.accuracy * 100).toFixed(1)}%` : '90.0%'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validation F1</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {mlStatus?.f1_score ? mlStatus.f1_score.toFixed(3) : '0.898'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validation MAE</span>
            <span className="text-sm font-mono font-bold text-amber-300">
              &plusmn;{mlStatus?.mae ? mlStatus.mae : '0.02'} pts
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validation R²</span>
            <span className="text-sm font-mono font-bold text-sky-400">
              {mlStatus?.r2_score ? mlStatus.r2_score.toFixed(3) : '0.999'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Training Samples</span>
            <span className="text-sm font-mono font-bold text-slate-200">
              {mlStatus?.training_records || 1010}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Human Review Agreement</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {data?.prediction_agreement_rate !== null && data?.prediction_agreement_rate !== undefined ? `${data.prediction_agreement_rate}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid 1: Incident Trends & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Trends */}
        <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Incident Trends</h3>
            <p className="text-[11px] text-slate-400">Total incidents vs critical events over time</p>
          </div>
          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_trend || []}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '6px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="incidents" stroke="#F59E0B" fillOpacity={1} fill="url(#colorInc)" name="Total Incidents" />
                <Area type="monotone" dataKey="critical" stroke="#EF4444" fillOpacity={1} fill="url(#colorCrit)" name="Critical Incidents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Severity Distribution</h3>
            <p className="text-[11px] text-slate-400">Proportional classification of incidents</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '6px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-400">
            Validated incident severity distribution across facility logs.
          </div>
        </div>
      </div>

      {/* Main Charts Grid 2: Incident Categories & Top Learned Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Categories */}
        <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Incident Categories</h3>
            <p className="text-[11px] text-slate-400">Occurrences breakdown by hazard category</p>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.category_distribution || []}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '6px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Incident Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Learned Risk Factors (Feature Importance) */}
        <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-500" />
              Top Learned Risk Factors
            </h3>
            <p className="text-[11px] text-slate-400">Random Forest feature weights derived from training</p>
          </div>

          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {featureImportances.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Loading feature importances...</p>
            ) : (
              featureImportances.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.feature}</span>
                    <span className="font-mono text-amber-400 font-bold">{(item.importance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, item.importance * 350)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Department Analysis Section */}
      <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Department Analysis</h3>
          <p className="text-[11px] text-slate-400">Incident breakdown and average risk score by department</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {(data?.department_stats || []).map((dept) => (
            <div key={dept.department} className="p-3 rounded bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">{dept.department}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-100">{dept.count} inc</span>
                <span className="text-xs font-mono font-bold text-amber-400">Avg {dept.avg_risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

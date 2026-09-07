import React, { useState } from 'react';
import { X, FileText, Calendar, MapPin, Building2, CheckCircle2, AlertTriangle, Shield, Download } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import RiskGauge from './RiskGauge';
import { updateIncidentStatus, getReportDownloadUrl } from '../services/api';

export default function IncidentModal({ incident, onClose, onStatusUpdated }) {
  if (!incident) return null;

  const [status, setStatus] = useState(incident.status || 'Pending');
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setUpdating(true);
    try {
      await updateIncidentStatus(incident.id, newStatus);
      if (onStatusUpdated) onStatusUpdated(incident.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md">
              {incident.id}
            </span>
            <SeverityBadge severity={incident.severity} />
          </div>

          <div className="flex items-center gap-3">
            {/* Download PDF button */}
            <a
              href={getReportDownloadUrl(incident.id)}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Banner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 glass-panel p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Incident Overview</h3>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">{incident.description}</p>
              
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{incident.department} Dept</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{incident.created_at}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Category: {incident.category}</span>
                </div>
              </div>
            </div>

            {/* Score & Status Panel */}
            <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-between">
              <RiskGauge score={incident.risk_score} severity={incident.severity} size="normal" />
              
              <div className="w-full mt-3 pt-3 border-t border-slate-800">
                <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Change Status
                </label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Rationale Box */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Explainable AI Rationale
              </span>
              <span className="text-[11px] text-slate-400">
                Confidence: <b className="text-amber-400">{incident.confidence || 85}%</b>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {incident.explanation}
            </p>
          </div>

          {/* Detected Hazards */}
          {incident.hazards && incident.hazards.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Detected Hazard Signals</h4>
              <div className="flex flex-wrap gap-2">
                {incident.hazards.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors Table */}
          {incident.risk_factors && incident.risk_factors.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Risk Breakdown Matrix</h4>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Risk Factor</th>
                      <th className="p-2.5">Impact Level</th>
                      <th className="p-2.5 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {incident.risk_factors.map((rf, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-medium">{rf.factor}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rf.impact === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}>
                            {rf.impact}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-400">+{rf.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Immediate Actions */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
                Immediate Response Actions
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {incident.immediate_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preventive Actions */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                Preventive &amp; Corrective Actions
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {incident.preventive_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  MapPin, 
  FileCheck,
  ShieldCheck
} from 'lucide-react';

import SeverityBadge from '../components/SeverityBadge';
import { getIncidents, getReportDownloadUrl } from '../services/api';

export default function Reports() {
  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getIncidents();
        setIncidents(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setSelectedIncident(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelect = (id) => {
    setSelectedId(id);
    const inc = incidents.find((i) => i.id === id);
    setSelectedIncident(inc || null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
          Safety Reports
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate and review workplace safety reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident Selector Panel (Left) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
            Select Incident for Report Export
          </h2>

          {loading ? (
            <p className="text-xs text-slate-500 py-4">Loading incidents...</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => handleSelect(inc.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedId === inc.id
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-400">{inc.id}</span>
                    <SeverityBadge severity={inc.severity} />
                  </div>

                  <p className="text-xs font-medium text-slate-200 mt-1.5 line-clamp-2">
                    {inc.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{inc.location}</span>
                    <span>{inc.created_at.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Preview & Download Panel (Right) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          {!selectedIncident ? (
            <div className="p-12 text-center text-slate-500">
              Select an incident from the list to preview and generate report.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Header Preview */}
              <div className="p-6 bg-[#0B0F17] rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
                      SAFESENSE OFFICIAL REPORT
                    </span>
                    <h2 className="text-lg font-bold text-slate-100">
                      Workplace Incident Risk Assessment Report
                    </h2>
                  </div>
                  <FileCheck className="w-8 h-8 text-amber-500" />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">INCIDENT ID</span>
                    <span className="font-mono font-bold text-amber-400">{selectedIncident.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DATE</span>
                    <span className="font-semibold text-slate-200">{selectedIncident.created_at}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LOCATION</span>
                    <span className="font-semibold text-slate-200">{selectedIncident.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DEPARTMENT</span>
                    <span className="font-semibold text-slate-200">{selectedIncident.department}</span>
                  </div>
                </div>

                {/* Risk Overview Box */}
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Risk Score Index</span>
                    <span className="text-2xl font-extrabold text-slate-100">{selectedIncident.risk_score} / 100</span>
                  </div>
                  <SeverityBadge severity={selectedIncident.severity} />
                </div>

                {/* Actions Preview */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Tailored Safety Recommendations
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {selectedIncident.immediate_actions.slice(0, 3).map((act, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-xs">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    ReportLab PDF Generation Ready
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Clicking below will trigger backend binary compilation of <code className="text-slate-200">SafeSense_Report_{selectedIncident.id}.pdf</code>.
                  </p>
                </div>

                <a
                  href={getReportDownloadUrl(selectedIncident.id)}
                  download
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Generate &amp; Download PDF Report</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

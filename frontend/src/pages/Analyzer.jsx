import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  MapPin, 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  ShieldAlert,
  Loader2,
  FileCheck,
  Zap
} from 'lucide-react';

import RiskGauge from '../components/RiskGauge';
import SeverityBadge from '../components/SeverityBadge';
import Toast from '../components/Toast';
import { analyzeIncident, saveIncident } from '../services/api';

const DEMO_SCENARIOS = [
  {
    title: "Scenario 1: Chemical Leak & Slip Injury",
    description: "A worker slipped near the chemical storage area. A container is leaking and the worker suffered a minor injury.",
    location: "Chemical Storage Bay 2",
    department: "Laboratory",
    people: 2,
    injury: true
  },
  {
    title: "Scenario 2: Electrical Spark",
    description: "An exposed electrical cable produced sparks near the production machine.",
    location: "Production Line 1",
    department: "Manufacturing",
    people: 1,
    injury: false
  },
  {
    title: "Scenario 3: Electrical Panel Fire",
    description: "A small fire was detected near an electrical panel.",
    location: "Substation Alpha",
    department: "Construction",
    people: 3,
    injury: false
  },
  {
    title: "Scenario 4: Wet Floor Slip (No Injury)",
    description: "A worker slipped on a wet floor but no injury was reported.",
    location: "Main Loading Dock",
    department: "Warehouse",
    people: 1,
    injury: false
  }
];

export default function Analyzer() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Chemical Storage Area');
  const [department, setDepartment] = useState('Laboratory');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [injuryReported, setInjuryReported] = useState(true);

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setAnalyzing(true);
    setResult(null);
    setSaved(false);

    try {
      const data = await analyzeIncident({
        description,
        location,
        department,
        people_affected: Number(peopleAffected) || 0,
        injury_reported: injuryReported,
        date_time: dateTime
      });
      setResult(data);
    } catch (err) {
      setToast({ message: err.message || 'Unable to analyze incident. Please try again.', type: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);

    try {
      const savedRes = await saveIncident({
        description,
        location,
        department,
        category: result.category,
        risk_score: result.risk_score,
        severity: result.severity,
        hazards: result.hazards,
        risk_factors: result.risk_factors,
        explanation: result.explanation,
        immediate_actions: result.immediate_actions,
        preventive_actions: result.preventive_actions,
        confidence: result.confidence,
        people_affected: Number(peopleAffected) || 0,
        injury_reported: injuryReported,
        status: 'Pending'
      });

      setSaved(true);
      setToast({ message: `Incident ${savedRes.id} saved successfully to database!`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to save incident', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const loadScenario = (sc) => {
    setDescription(sc.description);
    setLocation(sc.location);
    setDepartment(sc.department);
    setPeopleAffected(sc.people);
    setInjuryReported(sc.injury);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-amber-500" />
          AI Incident Analyzer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit workplace incident descriptions for real-time explainable risk assessment and action recommendation
        </p>
      </div>

      {/* Demo Scenario Quick-Buttons */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5" />
          Quick Test Demo Scenarios
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DEMO_SCENARIOS.map((sc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadScenario(sc)}
              className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                {sc.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{sc.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Panel (Left) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            Incident Details Form
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Incident Description *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, equipment involved, observed hazards, leaks, sparks, or worker conditions..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Chemical Storage Bay 4"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="Mining">Mining</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Construction">Construction</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  People Affected
                </label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Injury Reported?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInjuryReported(true)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    injuryReported
                      ? 'bg-red-500/15 text-red-400 border-red-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Yes (Injury Sustained)
                </button>
                <button
                  type="button"
                  onClick={() => setInjuryReported(false)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    !injuryReported
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  No Injury
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={analyzing || !description.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Incident...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Analyze Incident</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Result Display Panel (Right) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !analyzing && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Ready for Risk Assessment</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Enter incident details or select a demo scenario on the left, then click "Analyze Incident" to launch the rule-based explainable AI risk engine.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <h3 className="text-base font-bold text-slate-200">Analyzing Incident Vectors...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Scanning keywords, calculating hazard risk score weights, evaluating severity, and drafting recommendations...
              </p>
            </div>
          )}

          {result && !analyzing && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-fade-in">
              {/* Result Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">
                    Incident AI Risk Assessment
                  </span>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    Category: <span className="text-amber-400">{result.category}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Analysis Reliability</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{result.confidence}%</span>
                  </div>
                  <SeverityBadge severity={result.severity} />
                </div>
              </div>

              {/* Gauge & Top Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="sm:col-span-1 flex justify-center items-center">
                  <RiskGauge score={result.risk_score} severity={result.severity} size="large" />
                </div>
                
                <div className="sm:col-span-2 space-y-2 flex flex-col justify-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Hazards</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.hazards.map((h, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* WHY THIS SCORE? Rationale Box */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  WHY THIS SCORE? (Explainable AI Rationale)
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {result.explanation}
                </p>
              </div>

              {/* Risk Factors Breakdown Table */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Risk Factors Impact Matrix
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Factor</th>
                        <th className="p-2.5">Impact</th>
                        <th className="p-2.5 text-right">Contribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {result.risk_factors.map((rf, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-medium">{rf.factor}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rf.impact === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}>
                              {rf.impact}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-400">+{rf.points} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Immediate */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                    Immediate Safety Actions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.immediate_actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded bg-red-500/10 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preventive */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    Preventive Safety Actions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.preventive_actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Save Button Bar */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                    saved
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {saved ? (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Incident Saved to Database</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Incident to History'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

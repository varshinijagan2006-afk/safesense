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
  Loader2,
  FileCheck,
  Zap,
  BrainCircuit,
  Scale,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck
} from 'lucide-react';

import RiskGauge from '../components/RiskGauge';
import SeverityBadge from '../components/SeverityBadge';
import Toast from '../components/Toast';
import { analyzeIncident, saveIncident, reviewIncident } from '../services/api';

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
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Safety Review State
  const [reviewChoice, setReviewChoice] = useState(null); // 'correct' or 'incorrect'
  const [actualSeverity, setActualSeverity] = useState('HIGH');
  const [actualScore, setActualScore] = useState(75);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);

  const [toast, setToast] = useState(null);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setAnalyzing(true);
    setResult(null);
    setSaved(false);
    setSavedId(null);
    setReviewChoice(null);
    setReviewSaved(false);

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
      setActualSeverity(data.severity || 'HIGH');
      setActualScore(data.risk_score || 75);
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
        status: 'Pending',

        data_source: 'REAL',
        ml_prediction: {
          ml_predicted_score: result.ml_predicted_score,
          ml_severity: result.ml_severity
        },
        ml_confidence: result.ml_confidence,
        model_version: '1.0.0',
        rule_based_score: result.rule_based_score,
        verified: false
      });

      setSaved(true);
      setSavedId(savedRes.id);
      setToast({ message: `Incident ${savedRes.id} saved to database!`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to save incident', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReview = async () => {
    if (!savedId && !saved) {
      // If not saved yet, save first
      await handleSave();
    }
    const idToReview = savedId;
    if (!idToReview) return;

    setSavingReview(true);
    try {
      const isCorrect = reviewChoice === 'correct';
      await reviewIncident(idToReview, {
        verified: true,
        verified_severity: isCorrect ? (result.ml_severity || result.severity) : actualSeverity,
        verified_risk_score: isCorrect ? (result.ml_predicted_score !== undefined ? result.ml_predicted_score : result.risk_score) : Number(actualScore)
      });
      setReviewSaved(true);
      setToast({ message: 'Safety review recorded successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to record review', type: 'error' });
    } finally {
      setSavingReview(false);
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
        <h1 className="text-xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
          Report Workplace Incident
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Record an incident and assess its workplace safety risk.
        </p>
      </div>

      {/* Demo Scenario Quick-Buttons */}
      <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800">
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
              className="p-2.5 rounded-md bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
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
        <div className="lg:col-span-5 bg-slate-900/90 p-5 rounded-lg border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2.5">
            INCIDENT DETAILS
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
              className="w-full py-2.5 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assessing incident risk...</span>
                </>
              ) : (
                <span>ASSESS RISK</span>
              )}
            </button>
          </form>
        </div>

        {/* AI Result Display Panel (Right) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !analyzing && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">No incident assessed yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Enter incident details on the left and click ASSESS RISK to launch the safety risk assessment.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="bg-slate-900/90 p-12 rounded-lg border border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <h3 className="text-sm font-bold text-slate-200">Assessing incident risk...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Evaluating keyword safety rules and machine learning risk predictors...
              </p>
            </div>
          )}

          {result && !analyzing && (
            <div className="bg-slate-900/90 p-5 rounded-lg border border-slate-800 space-y-5">
              {/* Result Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    SAFETY RISK ASSESSMENT
                  </span>
                  <h2 className="text-base font-bold text-slate-100 mt-0.5">
                    Category: <span className="text-amber-400">{result.category}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={result.severity} />
                </div>
              </div>

              {/* Visual Focal Point: Risk Score */}
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Final Risk Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-slate-50 font-mono">{result.risk_score}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    <span className="ml-2 font-bold text-xs" style={{ color: result.severity === 'CRITICAL' ? '#EF4444' : result.severity === 'HIGH' ? '#F97316' : result.severity === 'MEDIUM' ? '#EAB308' : '#22C55E' }}>
                      {result.severity}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">Assessment Method</span>
                  <span className="text-xs font-semibold text-amber-400">Hybrid Safety Assessment</span>
                </div>
              </div>

              {/* Section 8: Hybrid Safety Assessment Comparison */}
              <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Hybrid Safety Assessment Breakdown
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Rule-Based Assessment</span>
                    <span className="text-base font-mono font-bold text-sky-400">{result.rule_based_score ?? result.risk_score}</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">ML Prediction</span>
                    <span className="text-base font-mono font-bold text-amber-400">{result.ml_predicted_score ?? result.risk_score}</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Final Risk Score</span>
                    <span className="text-base font-mono font-bold text-slate-50">{result.risk_score}</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">ML Confidence</span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      {result.ml_confidence ? `${Math.round(result.ml_confidence * 100)}%` : `${result.confidence}%`}
                    </span>
                  </div>
                </div>

                {/* Expandable Assessment Details */}
                <details className="text-xs text-slate-400 pt-2 border-t border-slate-800 cursor-pointer">
                  <summary className="font-semibold text-slate-300 hover:text-amber-400 transition-colors">
                    Assessment Details
                  </summary>
                  <div className="mt-2 space-y-1.5 p-3 rounded bg-slate-900 border border-slate-800 text-[11px]">
                    <p><b className="text-slate-300">Rule Engine Factors:</b> Keyword domain rules, location hazard weighting, injury multipliers.</p>
                    <p><b className="text-slate-300">ML Model Information:</b> Scikit-Learn Random Forest Classifier &amp; Regressor trained on historical site records.</p>
                    <p><b className="text-slate-300">Model Version:</b> {result.model_version || 'v1.0.1'}</p>
                    <p><b className="text-slate-300">Feature Information:</b> TF-IDF n-gram text signals + structured personnel &amp; hazard attributes.</p>
                  </div>
                </details>
              </div>

              {/* Identified Hazards & Rationale */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Identified Hazards</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.hazards.map((h, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Risk Rationale &amp; Explanations
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Actions & Prevention Checklists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Immediate Actions</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {result.immediate_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Preventive Actions</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {result.preventive_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Save Button Bar */}
              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`px-4 py-2 rounded-md font-bold text-xs flex items-center gap-2 transition-colors ${
                    saved
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {saved ? (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Saved to Incident History</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Incident'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Section 9: SAFETY REVIEW */}
              <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">SAFETY REVIEW</h3>
                  <p className="text-[11px] text-slate-400">Human verification improves future safety assessments.</p>
                </div>

                {reviewSaved && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Safety review recorded successfully.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900 p-2.5 rounded border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">ML Prediction</span>
                    <span className="font-bold text-amber-400">{result.ml_severity || result.severity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Confidence</span>
                    <span className="font-mono font-bold text-slate-200">
                      {result.ml_confidence ? `${Math.round(result.ml_confidence * 100)}%` : `${result.confidence}%`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Was this prediction correct?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setReviewChoice('correct');
                        setActualSeverity(result.severity);
                        setActualScore(result.risk_score);
                      }}
                      className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                        reviewChoice === 'correct'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>✓ Prediction Correct</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewChoice('incorrect')}
                      className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                        reviewChoice === 'incorrect'
                          ? 'bg-red-500/20 text-red-300 border-red-500/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                      <span>✕ Prediction Incorrect</span>
                    </button>
                  </div>

                  {/* Expandable Form if Prediction Incorrect */}
                  {reviewChoice === 'incorrect' && (
                    <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2.5">
                      <h4 className="text-xs font-semibold text-slate-200">Actual Incident Severity &amp; Risk Score</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                            Actual Severity
                          </label>
                          <select
                            value={actualSeverity}
                            onChange={(e) => setActualSeverity(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                            Actual Risk Score (0–100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={actualScore}
                            onChange={(e) => setActualScore(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {reviewChoice && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveReview}
                        disabled={savingReview || reviewSaved}
                        className={`px-4 py-2 rounded font-bold text-xs flex items-center gap-2 transition-colors ${
                          reviewSaved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {reviewSaved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Safety Review Saved</span>
                          </>
                        ) : (
                          <span>{savingReview ? 'Saving Review...' : 'SAVE REVIEW'}</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

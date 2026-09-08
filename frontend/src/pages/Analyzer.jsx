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
        verified: isCorrect,
        verified_severity: isCorrect ? result.severity : actualSeverity,
        verified_risk_score: isCorrect ? result.risk_score : Number(actualScore)
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
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-amber-500" />
          AI Incident Analyzer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit workplace incident descriptions for real-time explainable hybrid risk assessment and human safety verification
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
                  <span>Analyzing Hybrid Risk Vectors...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Analyze Hybrid Incident</span>
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
              <h3 className="text-base font-bold text-slate-200">Ready for Hybrid Risk Assessment</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Enter incident details or select a demo scenario on the left, then click "Analyze Hybrid Incident" to launch the rule engine and Random Forest ML predictor.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <h3 className="text-base font-bold text-slate-200">Running Hybrid AI Evaluation...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Parsing keywords, vectorizing TF-IDF description, predicting Random Forest score &amp; blending 60/40 rule weights...
              </p>
            </div>
          )}

          {result && !analyzing && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-fade-in">
              {/* Result Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Hybrid AI Assessment Result
                  </span>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    Category: <span className="text-amber-400">{result.category}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                    result.prediction_source === 'hybrid'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                  }`}>
                    {result.prediction_source === 'hybrid' ? 'Hybrid (Rule + ML)' : 'Rule Engine Fallback'}
                  </span>
                  <SeverityBadge severity={result.severity} />
                </div>
              </div>

              {/* Hybrid Score Breakdown Card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Hybrid Risk Score Breakdown
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rule Policy Base</span>
                    <span className="text-lg font-mono font-bold text-sky-400">{result.rule_based_score ?? result.risk_score}</span>
                    <span className="text-[10px] text-slate-500 block">Weight: 60%</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Random Forest ML</span>
                    <span className="text-lg font-mono font-bold text-amber-400">{result.ml_predicted_score ?? result.risk_score}</span>
                    <span className="text-[10px] text-slate-500 block">Weight: 40% ({result.ml_severity || result.severity})</span>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">Final Blended Score</span>
                    <span className="text-2xl font-mono font-extrabold text-slate-50">{result.risk_score}</span>
                    <span className="text-[10px] text-amber-300 block font-semibold">{result.severity}</span>
                  </div>
                </div>
              </div>

              {/* Gauge & Top Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="sm:col-span-1 flex justify-center items-center">
                  <RiskGauge score={result.risk_score} severity={result.severity} size="large" />
                </div>
                
                <div className="sm:col-span-2 space-y-2 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Hazards</h4>
                    <span className="text-[11px] text-slate-400">
                      ML Confidence: <b className="text-amber-400">{result.ml_confidence ? `${Math.round(result.ml_confidence*100)}%` : `${result.confidence}%`}</b>
                    </span>
                  </div>
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
                  WHY THIS SCORE? (Explainable Hybrid Rationale)
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {result.explanation}
                </p>
              </div>

              {/* Save Button Bar */}
              <div className="flex justify-end">
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
                      <span>Saved to SQLite Database</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Incident to History'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* SAFETY REVIEW & HUMAN VERIFICATION CARD */}
              <div className="p-5 rounded-2xl bg-[#090D16] border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">SAFETY REVIEW &amp; HUMAN VERIFICATION</h3>
                      <p className="text-[11px] text-slate-400">Validate AI model predictions to create human-confirmed ground truth for future retraining</p>
                    </div>
                  </div>
                  {reviewSaved && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">ML Prediction</span>
                    <span className="font-bold text-amber-400">{result.ml_severity || result.severity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">ML Model Confidence</span>
                    <span className="font-mono font-bold text-slate-200">
                      {result.ml_confidence ? `${Math.round(result.ml_confidence * 100)}%` : `${result.confidence}%`}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-200 block">
                    Was this AI risk prediction correct according to site safety evaluation?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setReviewChoice('correct');
                        setActualSeverity(result.severity);
                        setActualScore(result.risk_score);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                        reviewChoice === 'correct'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4 text-emerald-400" />
                      <span>Prediction Correct</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewChoice('incorrect')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                        reviewChoice === 'incorrect'
                          ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                      <span>Prediction Incorrect</span>
                    </button>
                  </div>

                  {/* Expandable Form if Prediction Incorrect */}
                  {reviewChoice === 'incorrect' && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-fade-in">
                      <h4 className="text-xs font-bold text-slate-200">Specify Verified Ground-Truth Outcome</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                            Actual Severity
                          </label>
                          <select
                            value={actualSeverity}
                            onChange={(e) => setActualSeverity(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
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
                        className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                          reviewSaved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                        }`}
                      >
                        {reviewSaved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Safety Review Verified &amp; Saved</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{savingReview ? 'Saving Review...' : 'SAVE REVIEW'}</span>
                          </>
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

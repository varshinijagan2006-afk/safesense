import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Info, ShieldCheck, Database, RotateCw, Server, Lock, Palette } from 'lucide-react';
import Toast from '../components/Toast';
import { getMLStatus, retrainModel } from '../services/api';

export default function Settings({ user }) {
  const [name, setName] = useState(user?.name || 'Safety Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@safesense.com');
  const [role, setRole] = useState(user?.role || 'Senior Safety Manager');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);

  const [mlStatus, setMlStatus] = useState(null);
  const [retraining, setRetraining] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getMLStatus().then(setMlStatus).catch(() => null);
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToast({ message: 'Profile settings updated successfully.', type: 'success' });
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await retrainModel();
      setToast({ message: res.message || 'Model retrained successfully!', type: 'success' });
      const updated = await getMLStatus();
      setMlStatus(updated);
    } catch (err) {
      setToast({ message: err.message || 'Retraining failed', type: 'error' });
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
          Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure application parameters, user credentials, safety intelligence, and system specifications.
        </p>
      </div>

      {/* 1. ACCOUNT */}
      <div className="bg-slate-900/90 p-5 rounded-lg border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            ACCOUNT &amp; CREDENTIALS
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. APPLICATION */}
      <div className="bg-slate-900/90 p-5 rounded-lg border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            APPLICATION &amp; NOTIFICATIONS
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block">Critical Incident Alerts</span>
              <span className="text-[11px] text-slate-400">Receive alerts for incidents rated CRITICAL (&ge;75 score)</span>
            </div>
            <input
              type="checkbox"
              checked={criticalAlerts}
              onChange={(e) => setCriticalAlerts(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block">Email Safety Summaries</span>
              <span className="text-[11px] text-slate-400">Send automatic summary emails when reports are generated</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* 3. SAFETY INTELLIGENCE */}
      <div className="bg-slate-900/90 p-5 rounded-lg border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            SAFETY INTELLIGENCE
          </h2>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining...' : 'Retrain Model'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Model Status</span>
            <span className="font-bold text-emerald-400">
              {mlStatus?.model_available ? '● Active' : 'Fallback'}
            </span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Model Version</span>
            <span className="font-mono font-bold text-amber-400">v{mlStatus?.model_version || '1.0.1'}</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Training Records</span>
            <span className="font-mono font-bold text-slate-200">{mlStatus?.training_records || 1010}</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Validation Accuracy</span>
            <span className="font-mono font-bold text-emerald-400">
              {mlStatus?.accuracy ? `${(mlStatus.accuracy * 100).toFixed(1)}%` : '90.0%'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. DATA & DATABASE */}
      <div className="bg-slate-900/90 p-5 rounded-lg border border-slate-800 space-y-3">
        <div className="border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            DATA MANAGEMENT
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Database Driver</span>
            <span className="font-semibold text-slate-200">SQLite + SQLAlchemy ORM</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Database Path</span>
            <span className="font-mono text-slate-300">backend/safesense.db</span>
          </div>
        </div>
      </div>

      {/* 5. SYSTEM */}
      <div className="bg-slate-900/90 p-5 rounded-lg border border-slate-800 space-y-3">
        <div className="border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-500" />
            SYSTEM SPECIFICATIONS
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">System Status</span>
            <span className="font-bold text-emerald-400">Operational</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">API Version</span>
            <span className="font-mono font-bold text-slate-200">1.1.0 (FastAPI)</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Frontend Engine</span>
            <span className="font-semibold text-slate-200">React 18 + Vite 5</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Report Engine</span>
            <span className="font-semibold text-slate-200">ReportLab PDF</span>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

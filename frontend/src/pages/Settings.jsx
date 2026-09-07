import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Info, ShieldCheck, Check } from 'lucide-react';
import Toast from '../components/Toast';

export default function Settings({ user }) {
  const [name, setName] = useState(user?.name || 'Safety Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@safesense.com');
  const [role, setRole] = useState(user?.role || 'Lead Safety Officer');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [toast, setToast] = useState(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToast({ message: 'Profile settings updated successfully.', type: 'success' });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-amber-500" />
          System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user profile credentials, alert configurations, and system specifications
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-amber-500" />
          User Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Bell className="w-4 h-4 text-amber-500" />
          Notification Preferences
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block">Critical Risk Alerts</span>
              <span className="text-[11px] text-slate-400">Receive immediate notifications for incidents rated CRITICAL (&ge;75 score)</span>
            </div>
            <input
              type="checkbox"
              checked={criticalAlerts}
              onChange={(e) => setCriticalAlerts(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block">Email Safety Bulletins</span>
              <span className="text-[11px] text-slate-400">Send email summary when new incident reports are generated</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block">Weekly Safety Digest</span>
              <span className="text-[11px] text-slate-400">Receive weekly analytics &amp; trend performance summary</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* System Information */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Info className="w-4 h-4 text-amber-500" />
          System Information
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Application</span>
            <span className="font-bold text-slate-200">SafeSense</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">App Version</span>
            <span className="font-bold text-amber-400 font-mono">1.0.0 (Release)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">AI Risk Engine</span>
            <span className="font-bold text-amber-400 font-mono">v1.0 (NLP Rules)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Database</span>
            <span className="font-bold text-slate-200">SQLite + SQLAlchemy</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          SafeSense prototype engine configured for decision-support and explainable risk scoring.
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

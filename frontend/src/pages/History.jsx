import React, { useEffect, useState, useMemo } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  ArrowUpDown, 
  Eye, 
  Trash2, 
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  ShieldCheck,
  Clock
} from 'lucide-react';

import SeverityBadge from '../components/SeverityBadge';
import IncidentModal from '../components/IncidentModal';
import Toast from '../components/Toast';
import { getIncidents, deleteIncident } from '../services/api';

export default function History() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      setToast({ message: 'Failed to load incident history', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((item) => {
        if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        if (categoryFilter !== 'ALL' && !item.category.includes(categoryFilter)) return false;
        if (reviewFilter === 'VERIFIED' && !item.verified) return false;
        if (reviewFilter === 'PENDING' && item.verified) return false;

        if (search.trim()) {
          const s = search.toLowerCase();
          const matchId = item.id.toLowerCase().includes(s);
          const matchDesc = item.description.toLowerCase().includes(s);
          const matchLoc = item.location.toLowerCase().includes(s);
          const matchDept = item.department.toLowerCase().includes(s);
          const matchCat = item.category.toLowerCase().includes(s);
          if (!matchId && !matchDesc && !matchLoc && !matchDept && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'desc') return b.risk_score - a.risk_score;
        return a.risk_score - b.risk_score;
      });
  }, [incidents, search, severityFilter, categoryFilter, statusFilter, reviewFilter, sortOrder]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete incident ${id}?`)) return;
    setDeletingId(id);
    try {
      await deleteIncident(id);
      setIncidents((prev) => prev.filter((item) => item.id !== id));
      setToast({ message: `Incident ${id} deleted successfully.`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete incident', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-amber-500" />
            Incident History Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable repository of all analyzed workplace incidents, safety logs, and human verification status
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter &amp; Search Controls
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keyword, ID, site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Review Status Filter */}
          <div>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 border-amber-500/30 focus:outline-none focus:border-amber-500 font-bold"
            >
              <option value="ALL">Review: All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Review</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="ALL">Severity: All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="ALL">Category: All Categories</option>
              <option value="Chemical">Chemical</option>
              <option value="Fire">Fire</option>
              <option value="Electrical">Electrical</option>
              <option value="Slip/Fall">Slip/Fall</option>
              <option value="Equipment">Equipment/Machinery</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Risk Score Sort Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="text-slate-400">Score:</span>
            <span className="flex items-center gap-1 font-mono text-amber-400">
              {sortOrder === 'desc' ? 'Highest' : 'Lowest'}
              <ArrowUpDown className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>

      {/* Main Incident History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-center">Risk Score</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Review Status</th>
                <th className="p-3.5">Incident Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Loading incident history records...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-600" />
                      <span>No incidents found matching your filter criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
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
                      {inc.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        inc.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        inc.status === 'Under Investigation' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(inc.id)}
                        disabled={deletingId === inc.id}
                        className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 border border-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={() => fetchHistory()}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

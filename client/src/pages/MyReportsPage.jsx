import React, { useState, useEffect } from 'react';
import { User, FileText, CheckCircle2, Clock, PlusCircle, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { IssueCard } from '../components/IssueCard';
import { api } from '../services/api';

export function MyReportsPage({ user, onNavigate, onSelectTicket }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserIssues = async () => {
    if (!user || !user.email) return;
    try {
      setLoading(true);
      const data = await api.getMyIssues(user.email);
      setIssues(data);
    } catch (err) {
      console.error('Failed to load user issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserIssues();
  }, [user]);

  const handleUpvote = async (issueId) => {
    try {
      const res = await api.upvoteIssue(issueId);
      setIssues(prev => prev.map(item => item.id === issueId ? { ...item, upvotes: res.upvotes } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Rejected').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Registered Citizen Profile
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {user?.name}'s Grievances
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              📧 {user?.email} {user?.phone ? `• 📱 ${user?.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUserIssues}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh My Issues"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('report')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Complaint</span>
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-400">Total Submitted</p>
            <p className="text-xl font-bold text-slate-900">{issues.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-400">Under Action</p>
            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-400">Resolved Work Orders</p>
            <p className="text-xl font-bold text-emerald-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* List of issues */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Your Reported Issues History
        </h3>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading your complaint history...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No Complaints Logged Yet</h4>
            <p className="text-xs text-slate-500">
              You haven't submitted any civic grievances with this account yet.
            </p>
            <button
              onClick={() => onNavigate('report')}
              className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Report an Issue Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onTrack={(id) => onSelectTicket(id)}
                onUpvote={handleUpvote}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

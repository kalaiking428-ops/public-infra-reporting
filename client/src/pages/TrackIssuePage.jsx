import React, { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, ArrowLeft, MapPin, Building, User, Calendar, 
  ThumbsUp, Star, CheckCircle, RefreshCw, Send 
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { IssueMap } from '../components/IssueMap';
import { api } from '../services/api';

export function TrackIssuePage({ ticketId = '', onNavigate }) {
  const [searchId, setSearchId] = useState(ticketId || '');
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Citizen Rating Form
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (ticketId) {
      setSearchId(ticketId);
      fetchTicket(ticketId);
    }
  }, [ticketId]);

  const fetchTicket = async (idToFetch) => {
    const cleanId = (idToFetch || searchId).trim().toUpperCase();
    if (!cleanId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getIssueById(cleanId);
      setIssue(data);
      if (data.citizen_rating) {
        setRating(data.citizen_rating);
        setFeedbackText(data.citizen_feedback || '');
        setFeedbackSubmitted(true);
      } else {
        setFeedbackSubmitted(false);
      }
    } catch (err) {
      setError(err.message || 'Issue not found. Please check ticket ID.');
      setIssue(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTicket();
  };

  const handleUpvote = async () => {
    if (!issue) return;
    try {
      const res = await api.upvoteIssue(issue.id);
      setIssue(prev => ({ ...prev, upvotes: res.upvotes }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!issue) return;
    try {
      await api.submitFeedback(issue.id, { rating, feedback: feedbackText });
      setFeedbackSubmitted(true);
    } catch (err) {
      alert('Failed to submit feedback: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      
      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Track Complaint Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your Ticket ID to inspect live progress, department actions, and resolution proof.
            </p>
          </div>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. INFRA-1001"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 shadow-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track</span>
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span>Try sample tickets:</span>
          {['INFRA-1001', 'INFRA-1002', 'INFRA-1003'].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setSearchId(sample);
                fetchTicket(sample);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-md font-mono text-[11px] font-semibold transition"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-rose-900 text-base">No Complaint Found</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Issue Details View */}
      {issue && (
        <div className="space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Header banner */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-blue-50/40 border-b border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-blue-950 bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-xs">
                    {issue.id}
                  </span>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </div>

                <button
                  onClick={handleUpvote}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 text-xs font-semibold shadow-xs transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{issue.upvotes} Citizens Impacted</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {issue.title}
              </h2>

              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {issue.description}
              </p>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/60 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                    <p className="font-semibold text-slate-800 line-clamp-1">{issue.address}</p>
                    {issue.landmark && <p className="text-slate-500 text-[11px]">Near: {issue.landmark}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</p>
                    <p className="font-semibold text-slate-800">{issue.department_name || 'Pending Assignment'}</p>
                    {issue.assigned_officer && (
                      <p className="text-slate-500 text-[11px]">Officer: {issue.assigned_officer}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Reported On</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(issue.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo & Map side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-slate-100">
              <div className="p-6 flex flex-col justify-center bg-slate-50/50">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">
                  Citizen Uploaded Evidence
                </span>
                <img
                  src={issue.image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'}
                  alt={issue.title}
                  className="w-full h-60 object-cover rounded-2xl border border-slate-200 shadow-sm"
                />
              </div>

              <div className="p-6 flex flex-col justify-center">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">
                  Pinpoint Location on Map
                </span>
                <IssueMap
                  issues={[issue]}
                  center={[issue.latitude, issue.longitude]}
                  zoom={15}
                  height="240px"
                />
              </div>
            </div>

          </div>

          {/* Timeline & Resolution Pipeline */}
          <Timeline
            status={issue.status}
            events={issue.timeline || []}
            resolutionImage={issue.resolution_image_url}
            originalImage={issue.image_url}
          />

          {/* Citizen Feedback Section (when resolved) */}
          {issue.status === 'Resolved' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Citizen Redressal Feedback
              </h3>

              {feedbackSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold text-sm">Feedback Recorded!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You rated this resolution {rating} out of 5 stars. Your response helps evaluate municipal officer performance.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Are you satisfied with the repair and clearance performed by the department?
                  </p>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-2">
                      {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Leave a short comment regarding the resolution quality..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  ></textarea>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Rating
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

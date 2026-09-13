import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle2, Clock, MapPin, Search, Filter, 
  ShieldAlert, Sparkles, Layers, List, Map as MapIcon, ArrowRight 
} from 'lucide-react';
import { IssueCard } from '../components/IssueCard';
import { IssueMap } from '../components/IssueMap';
import { api } from '../services/api';

export function HomePage({ onNavigate, onSelectTicket }) {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('both'); // 'both', 'map', 'grid'

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesData, catData, statsData] = await Promise.all([
        api.getIssues({
          status: statusFilter,
          category_id: categoryFilter,
          priority: priorityFilter,
          search: searchQuery
        }),
        api.getCategories(),
        api.getStats()
      ]);
      setIssues(issuesData);
      setCategories(catData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUpvote = async (issueId) => {
    try {
      const res = await api.upvoteIssue(issueId);
      setIssues(prev => prev.map(item => item.id === issueId ? { ...item, upvotes: res.upvotes } : item));
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 shadow-xl border border-blue-900/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Civic Infrastructure Transparency & Redressal
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            See a Problem in Your City? <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Report It. Track It. Fixed.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Directly connect with municipal departments for broken streetlights, hazardous potholes, garbage accumulation, and drainage failures. Provide exact GPS pins and photographic evidence with instant ticket tracking.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('report')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Report Infrastructure Issue
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm backdrop-blur border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-300" />
              Track Existing Ticket
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Statistics Cards */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reported</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Review</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.reported}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.inProgress}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resolved ({stats.resolutionRate}%)</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.resolved}</h3>
            </div>
          </div>
        </section>
      )}

      {/* Interactive City Map Overview */}
      {(viewMode === 'both' || viewMode === 'map') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Live City Incident Map</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {issues.length} mapped incidents
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewMode('both')}
                className={`px-3 py-1 rounded-lg transition-colors ${viewMode === 'both' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Map Only
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Cards Only
              </button>
            </div>
          </div>

          <IssueMap 
            issues={issues}
            onSelectIssue={(id) => onSelectTicket(id)}
            height={viewMode === 'map' ? '560px' : '380px'}
          />
        </section>
      )}

      {/* Filter & Search Bar */}
      {(viewMode === 'both' || viewMode === 'grid') && (
        <section className="space-y-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            {/* Top row: Search and View Mode Switcher */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ticket ID (e.g. INFRA-1001), keyword, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </form>

              {viewMode === 'grid' && (
                <button
                  onClick={() => setViewMode('both')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <MapIcon className="w-4 h-4" />
                  Show Map
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filters:
              </span>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Reported">Reported (Pending)</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              {/* Category Select */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Priority Select */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {(statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setPriorityFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-rose-600 hover:text-rose-700 font-medium underline ml-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>

          </div>

          {/* Issues Grid */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Loading civic issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No issues found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Reset All Filters
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

        </section>
      )}

    </div>
  );
}

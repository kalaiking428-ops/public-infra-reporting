import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  Users, Building, Download, Eye, Edit3, X, Sparkles, Filter, Search, Wrench, RefreshCw
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { api } from '../services/api';

export function AdminDashboardPage({ onSelectTicket }) {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Triage Modal state
  const [editingIssue, setEditingIssue] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalDept, setModalDept] = useState('');
  const [modalOfficer, setModalOfficer] = useState('');
  const [modalPriority, setModalPriority] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesData, deptData, statsData] = await Promise.all([
        api.getIssues({
          department_id: selectedDept,
          status: selectedStatus,
          priority: selectedPriority,
          search: searchTerm
        }),
        api.getDepartments(),
        api.getStats()
      ]);
      setIssues(issuesData);
      setDepartments(deptData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedStatus, selectedPriority]);

  const openTriageModal = (issue) => {
    setEditingIssue(issue);
    setModalStatus(issue.status);
    setModalDept(issue.department_id || '');
    setModalOfficer(issue.assigned_officer || '');
    setModalPriority(issue.priority || 'Medium');
    setModalNotes('');
    setResolutionFile(null);
  };

  const closeTriageModal = () => {
    setEditingIssue(null);
  };

  const handleSaveTriage = async (e) => {
    e.preventDefault();
    if (!editingIssue) return;

    try {
      setModalSaving(true);
      const formData = new FormData();
      formData.append('status', modalStatus);
      formData.append('department_id', modalDept);
      formData.append('assigned_officer', modalOfficer);
      formData.append('priority', modalPriority);
      formData.append('notes', modalNotes);
      formData.append('actor', 'Municipal Control Officer');
      if (resolutionFile) {
        formData.append('resolution_image', resolutionFile);
      }

      await api.updateIssueStatus(editingIssue.id, formData);
      closeTriageModal();
      loadData();
    } catch (err) {
      alert('Failed to update issue: ' + err.message);
    } finally {
      setModalSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (issues.length === 0) return;
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Department', 'Officer', 'Address', 'Created Date'];
    const rows = issues.map(i => [
      i.id,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.category_name || i.category_id,
      i.priority,
      i.status,
      `"${i.department_name || ''}"`,
      `"${i.assigned_officer || ''}"`,
      `"${(i.address || '').replace(/"/g, '""')}"`,
      i.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `civic-issues-report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Municipal Authority Operations Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Triage citizen complaints, allocate department crews, and oversee resolution workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Action</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.reported}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">In Progress</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Critical Hazards</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.critical}</p>
          </div>
        </div>
      )}

      {/* Departments Workload breakdown */}
      {departments.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            Department Workload & Active Dispatches
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {departments.map((dept) => (
              <div 
                key={dept.id}
                onClick={() => setSelectedDept(selectedDept === dept.id ? 'all' : dept.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedDept === dept.id 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-slate-800 truncate" title={dept.name}>
                    {dept.name}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>Active: <strong className="text-blue-700">{dept.active_issues_count || 0}</strong></span>
                  <span>Resolved: <strong className="text-emerald-700">{dept.resolved_issues_count || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filter controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by ID, keywords, street..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium"
            >
              <option value="all">Status: All</option>
              <option value="Reported">Reported</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium"
            >
              <option value="all">Priority: All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium"
            >
              <option value="all">Department: All</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Issue Details</th>
                <th className="py-3 px-4">Category & Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department & Officer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading complaint registry...
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No complaints match the specified criteria.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {issue.id}
                      <span className="block text-[10px] font-normal font-sans text-slate-400 mt-0.5">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        {issue.image_url && (
                          <img 
                            src={issue.image_url} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" 
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{issue.title}</p>
                          <p className="text-slate-400 text-[11px] line-clamp-1">📍 {issue.address}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-medium text-slate-700 block">
                          {issue.category_name || issue.category_id}
                        </span>
                        <PriorityBadge priority={issue.priority} />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={issue.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{issue.department_name || 'Unassigned'}</p>
                      <p className="text-[11px] text-slate-400">
                        {issue.assigned_officer ? `👮 ${issue.assigned_officer}` : 'No officer assigned'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectTicket(issue.id)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                          title="View Public Tracking Page"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openTriageModal(issue)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Triage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Triage & Status Update Modal */}
      {editingIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  {editingIssue.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Manage Complaint & Work Order
                </h3>
              </div>
              <button
                onClick={closeTriageModal}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTriage} className="space-y-4 text-xs">
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800 text-sm mb-1">{editingIssue.title}</p>
                <p className="text-slate-500">📍 {editingIssue.address}</p>
              </div>

              {/* Status transition */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Update Redressal Status *
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="Reported">Reported (Pending Review)</option>
                  <option value="Under Review">Under Review (Inspected)</option>
                  <option value="Assigned">Assigned (Dispatched to Department)</option>
                  <option value="In Progress">In Progress (Work underway on-site)</option>
                  <option value="Resolved">Resolved (Work completed & verified)</option>
                  <option value="Rejected">Rejected (Non-actionable / Closed)</option>
                </select>
              </div>

              {/* Department & Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Assign Department
                  </label>
                  <select
                    value={modalDept}
                    onChange={(e) => setModalDept(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Assigned Field Officer / Crew
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inspector M. Rajesh"
                    value={modalOfficer}
                    onChange={(e) => setModalOfficer(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Priority override */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Priority / Severity
                </label>
                <select
                  value={modalPriority}
                  onChange={(e) => setModalPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Immediate safety hazard)</option>
                </select>
              </div>

              {/* Resolution proof upload (if status is Resolved) */}
              {modalStatus === 'Resolved' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <label className="block font-bold uppercase tracking-wider text-emerald-800">
                    📸 Upload Resolution Proof / After-Fix Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolutionFile(e.target.files[0])}
                    className="w-full text-xs text-emerald-900 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                  />
                  <p className="text-[11px] text-emerald-700">
                    Attach photograph of cleared area or repaired equipment as audit evidence.
                  </p>
                </div>
              )}

              {/* Official Remarks / Timeline Note */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Official Remarks / Dispatch Note *
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter specific instructions, crew dispatched, material allocated, or reason for resolution..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeTriageModal}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {modalSaving ? 'Saving...' : 'Update Complaint'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

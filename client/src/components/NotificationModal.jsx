import React, { useState } from 'react';
import { 
  X, Bell, MessageSquare, Mail, CheckCircle2, 
  Clock, Shield, ArrowRight, ExternalLink, RefreshCw, Smartphone
} from 'lucide-react';

export function NotificationModal({ isOpen, onClose, notifications = [], onRefresh, onSelectIssue }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sms', 'email'

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'sms') return n.channel === 'SMS';
    if (activeTab === 'email') return n.channel === 'EMAIL';
    return true;
  });

  const smsCount = notifications.filter(n => n.channel === 'SMS').length;
  const emailCount = notifications.filter(n => n.channel === 'EMAIL').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur shadow-inner">
              <Bell className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Citizen Notification Alerts</h3>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Automated SMS & Email records for complaint registration and resolution
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh notifications"
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Alerts ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'sms'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>SMS ({smsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'email'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Email ({emailCount})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Status: <strong className="text-emerald-600">Active (Automatic)</strong>
          </span>
        </div>

        {/* Notification List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[60vh] bg-slate-50/50">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">No alerts found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Whenever you report a civic issue or an authority officer marks it as Resolved, instant SMS and Email notifications will appear right here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-4 rounded-xl border bg-white shadow-xs transition hover:shadow-md ${
                  notif.event === 'RESOLVED' 
                    ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30' 
                    : 'border-blue-200 bg-gradient-to-br from-white to-blue-50/30'
                }`}
              >
                {/* Channel & Badge Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {notif.channel === 'SMS' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        <Smartphone className="w-3 h-3" /> Mobile SMS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                        <Mail className="w-3 h-3" /> Official Email
                      </span>
                    )}

                    {notif.event === 'RESOLVED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Issue Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        <Clock className="w-3 h-3 text-sky-600" /> Registered
                      </span>
                    )}

                    {notif.issue_id && (
                      <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {notif.issue_id}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(notif.sent_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Recipient and Subject */}
                <div className="mb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    {notif.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>Sent to:</span>
                    <strong className="text-slate-700 font-medium font-mono">{notif.recipient}</strong>
                    <span className="text-emerald-600 font-semibold text-[10px] ml-2 flex items-center gap-0.5">
                      ✓ Delivered
                    </span>
                  </div>
                </div>

                {/* Message Body Styled Preview */}
                {notif.channel === 'SMS' ? (
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-slate-200 pb-1 font-sans">
                      <span>Sender ID: <strong>VD-CIVICGOV</strong></span>
                      <span>Network: GovSMS Gateway</span>
                    </div>
                    {notif.message}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                    <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> CivicAlert Municipal Notification Service
                    </div>
                    <div className="text-slate-600 whitespace-pre-wrap">
                      {notif.message}
                    </div>
                  </div>
                )}

                {/* Footer Action to Jump to Complaint */}
                {notif.issue_id && onSelectIssue && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onSelectIssue(notif.issue_id);
                        onClose();
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Track this ticket ({notif.issue_id})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer info note */}
        <div className="px-6 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SMS & Email Gateway: <strong>Simulated + SMTP Ready</strong></span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, UserCheck, ShieldCheck, Wrench, Sparkles, XCircle } from 'lucide-react';

export function Timeline({ status, events = [], resolutionImage, originalImage }) {
  const steps = [
    { key: 'Reported', label: 'Reported', icon: Clock },
    { key: 'Under Review', label: 'Verified', icon: ShieldCheck },
    { key: 'Assigned', label: 'Assigned', icon: UserCheck },
    { key: 'In Progress', label: 'In Progress', icon: Wrench },
    { key: 'Resolved', label: 'Resolved', icon: Sparkles },
  ];

  const statusHierarchy = {
    'Reported': 1,
    'Under Review': 2,
    'Assigned': 3,
    'In Progress': 4,
    'Resolved': 5,
    'Rejected': -1
  };

  const currentLevel = statusHierarchy[status] || 1;
  const isRejected = status === 'Rejected';

  return (
    <div className="space-y-8">
      
      {/* Visual Pipeline Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-700 mb-6 uppercase tracking-wider">
          Resolution Progress Pipeline
        </h4>

        {isRejected ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800">
            <XCircle className="w-6 h-6 text-rose-600" />
            <div>
              <p className="font-semibold text-sm">Complaint Closed / Rejected</p>
              <p className="text-xs text-rose-600">The authority reviewed this submission and marked it as non-actionable or outside jurisdiction.</p>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-100 -z-0"></div>
            {/* Active Progress Line */}
            <div 
              className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-blue-600 -z-0 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, ((currentLevel - 1) / (steps.length - 1)) * 100))}%`
              }}
            ></div>

            {steps.map((step, idx) => {
              const stepLevel = idx + 1;
              const isCompleted = currentLevel > stepLevel;
              const isCurrent = currentLevel === stepLevel;
              const Icon = step.icon;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center group">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-50' 
                        : isCurrent 
                        ? 'bg-white text-blue-600 border-2 border-blue-600 shadow-md ring-4 ring-blue-100 font-bold'
                        : 'bg-white text-slate-300 border-2 border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-semibold text-center whitespace-nowrap ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Before and After Proof of Work */}
      {(resolutionImage || status === 'Resolved') && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-4">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Resolution Evidence & Proof of Work</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {originalImage && (
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Original Issue (Reported)
                </span>
                <img 
                  src={originalImage} 
                  alt="Original Issue" 
                  className="w-full h-44 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-2">
                Work Completed (Resolved)
              </span>
              <img 
                src={resolutionImage || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80'} 
                alt="Resolved Work Proof" 
                className="w-full h-44 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Detailed Activity Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">
          Official Redressal Timeline
        </h4>

        {events.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No activity recorded yet.</p>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
            {events.map((ev, index) => {
              const formattedDate = new Date(ev.created_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div key={ev.id || index} className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 border-2 border-white flex items-center justify-center shrink-0 shadow-sm z-10">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h5 className="text-sm font-bold text-slate-800">
                        {ev.title}
                      </h5>
                      <span className="text-xs text-slate-400 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-blue-700 font-medium mb-2">
                      <span>Action by:</span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {ev.actor || 'System'}
                      </span>
                    </div>

                    {ev.description && (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, XCircle, ArrowUpRight, Flame } from 'lucide-react';

export function StatusBadge({ status }) {
  const configs = {
    'Reported': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: Clock,
      label: 'Reported'
    },
    'Under Review': {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
      icon: Clock,
      label: 'Under Review'
    },
    'Assigned': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: ArrowUpRight,
      label: 'Assigned'
    },
    'In Progress': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
      icon: Clock,
      label: 'In Progress'
    },
    'Resolved': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Resolved'
    },
    'Rejected': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: XCircle,
      label: 'Rejected'
    }
  };

  const conf = configs[status] || configs['Reported'];
  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot} animate-pulse-subtle`}></span>
      <Icon className="w-3.5 h-3.5" />
      {conf.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const configs = {
    'Critical': {
      bg: 'bg-red-100 text-red-800 border-red-300',
      icon: Flame,
      label: 'Critical'
    },
    'High': {
      bg: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: AlertTriangle,
      label: 'High Priority'
    },
    'Medium': {
      bg: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: null,
      label: 'Medium'
    },
    'Low': {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: null,
      label: 'Low'
    }
  };

  const conf = configs[priority] || configs['Medium'];
  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${conf.bg}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {conf.label}
    </span>
  );
}

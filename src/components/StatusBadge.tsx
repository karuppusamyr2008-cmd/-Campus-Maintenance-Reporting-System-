import React from 'react';
import { IssuePriority, IssueStatus } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Flame, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  };

  switch (status) {
    case 'Pending':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium ${sizeClasses[size]}`}
        >
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Pending
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-medium ${sizeClasses[size]}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium ${sizeClasses[size]}`}
        >
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-emerald-600'} />
          Resolved
        </span>
      );
    default:
      return null;
  }
};

interface PriorityBadgeProps {
  priority: IssuePriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
  };

  switch (priority) {
    case 'Emergency':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-red-600 text-white shadow-xs font-bold animate-pulse ${sizeClasses[size]}`}
        >
          <Flame className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Emergency
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800 ${sizeClasses[size]}`}
        >
          <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-orange-600'} />
          High
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 ${sizeClasses[size]}`}
        >
          <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-amber-600'} />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses[size]}`}
        >
          <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-slate-500'} />
          Low
        </span>
      );
    default:
      return null;
  }
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { CAMPUS_BUILDINGS } from '../data/seedData';
import { IssueCategory, IssuePriority, IssueStatus } from '../types';
import {
  AlertTriangle,
  BarChart3,
  Building,
  CheckCircle2,
  Clock,
  Flame,
  PieChart,
  TrendingUp,
  Zap,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { complaints } = useApp();

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const emergencyCount = complaints.filter((c) => c.priority === 'Emergency').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Calculate average resolution time for resolved complaints
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved' && c.resolvedAt);
  let avgResolutionHours = 0;
  if (resolvedComplaints.length > 0) {
    const totalDiffHours = resolvedComplaints.reduce((acc, c) => {
      const created = new Date(c.createdAt).getTime();
      const resTime = new Date(c.resolvedAt!).getTime();
      const diffHrs = Math.max(0, (resTime - created) / (1000 * 3600));
      return acc + diffHrs;
    }, 0);
    avgResolutionHours = Math.round((totalDiffHours / resolvedComplaints.length) * 10) / 10;
  }

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const mostReportedCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None';

  // Building hotspot distribution
  const buildingCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    buildingCounts[c.building] = (buildingCounts[c.building] || 0) + 1;
  });

  const sortedBuildings = Object.entries(buildingCounts).sort((a, b) => b[1] - a[1]);
  const mostProblematicBuilding = sortedBuildings.length > 0 ? sortedBuildings[0][0] : 'None';

  // Priority distribution
  const priorityCounts: Record<IssuePriority, number> = {
    Emergency: complaints.filter((c) => c.priority === 'Emergency').length,
    High: complaints.filter((c) => c.priority === 'High').length,
    Medium: complaints.filter((c) => c.priority === 'Medium').length,
    Low: complaints.filter((c) => c.priority === 'Low').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <BarChart3 className="w-4 h-4" /> Operational Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus Resolution Metrics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
          Real-time metrics computed directly from active work order logs and dispatch timestamps.
        </p>
      </div>

      {/* Top Highlight Cards: 2 cards per row on mobile, 1 col on <340px, 4 on lg */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{resolutionRate}%</p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">
            {resolved} of {total} tickets resolved
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">
            {avgResolutionHours > 0 ? `${avgResolutionHours} hrs` : 'N/A'}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">From filing to verified fix</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Top Category</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {mostReportedCategory}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">
            {sortedCategories[0]?.[1] || 0} issues reported
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Hotspot Building</span>
            <Building className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {mostProblematicBuilding}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">
            {sortedBuildings[0]?.[1] || 0} campus incidents
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Issues by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-base flex items-center justify-between">
            <span>Issues by Category</span>
            <span className="text-xs font-normal text-slate-500">Live Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 mb-5">Distribution across trade disciplines</p>

          <div className="space-y-3">
            {sortedCategories.map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="truncate">{cat}</span>
                    <span className="shrink-0 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues by Priority & Status */}
        <div className="space-y-6">
          {/* Priority Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-base">
              Issues by Priority Severity
            </h3>
            <p className="text-xs text-slate-500 mb-4">SLA triage classification</p>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs">
                <span className="font-bold text-red-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Emergency
                </span>
                <p className="text-xl sm:text-2xl font-black text-red-600 mt-1">
                  {priorityCounts.Emergency}
                </p>
                <span className="text-[10px] text-red-500">Immediate hazard</span>
              </div>

              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-xs">
                <span className="font-bold text-orange-600">High Priority</span>
                <p className="text-xl sm:text-2xl font-black text-orange-600 mt-1">
                  {priorityCounts.High}
                </p>
                <span className="text-[10px] text-orange-500">&lt; 4 hr response</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs">
                <span className="font-bold text-amber-600">Medium Priority</span>
                <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                  {priorityCounts.Medium}
                </p>
                <span className="text-[10px] text-amber-500">&lt; 24 hr response</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">Low Priority</span>
                <p className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 mt-1">
                  {priorityCounts.Low}
                </p>
                <span className="text-[10px] text-slate-400">Standard queue</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-base">
              Work Order Status Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Pipeline through completion</p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <p className="text-lg sm:text-xl font-black text-amber-600">{pending}</p>
                <span className="font-bold text-amber-700 dark:text-amber-300 block mt-0.5">
                  Pending
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <p className="text-lg sm:text-xl font-black text-blue-600">{inProgress}</p>
                <span className="font-bold text-blue-700 dark:text-blue-300 block mt-0.5">
                  In Progress
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <p className="text-lg sm:text-xl font-black text-emerald-600">{resolved}</p>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  Resolved
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

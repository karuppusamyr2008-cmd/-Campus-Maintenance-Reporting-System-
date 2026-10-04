import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FilePlus,
  Filter,
  Layers,
  MapPin,
  Search,
  User,
  Wrench,
} from 'lucide-react';

export const StudentDashboardView: React.FC = () => {
  const { complaints, currentUser, setActiveTab } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter complaints filed by the active student
  const studentReports = complaints.filter(
    (c) =>
      c.reporter.id === currentUser.id ||
      c.reporter.name.toLowerCase() === currentUser.name.toLowerCase() ||
      (currentUser.studentId && c.reporter.studentId === currentUser.studentId)
  );

  const pendingCount = studentReports.filter((c) => c.status === 'Pending').length;
  const inProgressCount = studentReports.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = studentReports.filter((c) => c.status === 'Resolved').length;

  const filteredReports = studentReports.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Layers className="w-4 h-4" /> Student Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Submitted Tickets
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.studentId || 'Student'}) • Campus Residence Portal
          </p>
        </div>

        <button
          onClick={() => setActiveTab('report')}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <FilePlus className="w-4 h-4" /> Report New Issue
        </button>
      </div>

      {/* Mobile-optimized Metrics: 2 cards per row on mobile, stack into 1 on ultra small screens */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Submitted</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {studentReports.length}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Your campus tickets</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'ALL' : 'Pending')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-xs text-amber-500 font-bold">Pending Review</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">{pendingCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Awaiting assignment</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'ALL' : 'In Progress')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'In Progress'
              ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-xs text-blue-500 font-bold">In Progress</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-500 mt-1">{inProgressCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Technician working</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'Resolved' ? 'ALL' : 'Resolved')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-xs text-emerald-500 font-bold">Resolved</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">{resolvedCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Completed fixes</span>
        </div>
      </div>

      {/* Search & Filter (44px min height touch targets) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my tickets by ID, title, or room..."
            className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="ALL">All Statuses ({studentReports.length})</option>
          <option value="Pending">Pending ({pendingCount})</option>
          <option value="In Progress">In Progress ({inProgressCount})</option>
          <option value="Resolved">Resolved ({resolvedCount})</option>
        </select>
      </div>

      {/* Complaints List - Responsive Cards on all viewports */}
      {filteredReports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            No complaints found
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            You haven't reported any issues matching this search criteria.
          </p>
          <button
            onClick={() => setActiveTab('report')}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Submit an Issue Now
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredReports.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-blue-400 transition-all space-y-3"
            >
              {/* Card Header: CF-2026-XXXX */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                  {c.id}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title & Location: 📍 Block A - Room 204 */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>📍 {c.building} - {c.room}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {c.description}
                </p>
              </div>

              {/* Priority & Status line */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Priority:</span>
                  <PriorityBadge priority={c.priority} size="sm" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              </div>

              {/* Assigned technician info if available */}
              {c.assignedStaff && (
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium pt-0.5">
                  🔧 Assigned to: {c.assignedStaff.name} ({c.assignedStaff.specialty})
                </div>
              )}

              {/* Full-width touch action button [View Details] */}
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('track', c.id)}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details & Timeline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

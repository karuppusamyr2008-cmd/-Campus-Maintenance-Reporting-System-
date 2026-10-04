import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IssueCategory, IssuePriority, IssueStatus, Complaint, StaffMember } from '../types';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import {
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Flame,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    complaints,
    staffList,
    updatePriority,
    assignStaffToComplaint,
    updateStatus,
    setActiveTab,
  } = useApp();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Selected complaint for bottom sheet / modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Quick stat cards (calculated from actual complaint data)
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const emergencyCount = complaints.filter(
    (c) => c.priority === 'Emergency' && c.status !== 'Resolved'
  ).length;

  const activeFilterCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (priorityFilter !== 'ALL' ? 1 : 0) +
    (categoryFilter !== 'ALL' ? 1 : 0);

  // Filtered complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reporter.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Keep modal complaint in sync with updated state
  const currentModalComplaint = selectedComplaint
    ? complaints.find((c) => c.id === selectedComplaint.id) || selectedComplaint
    : null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Shield className="w-4 h-4" /> Admin Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Facilities Management Dispatch
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Triage campus work orders, set response priorities, and assign maintenance specialists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
          >
            Analytics →
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center cursor-pointer"
          >
            Campus Map
          </button>
        </div>
      </div>

      {/* Mobile-optimized Dashboard Metric Cards:
          - 2 cards per row on mobile
          - Stack into 1 on ultra-small screens (<340px)
          - Emergency is full-width across 2 columns on mobile */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Issues */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Issues</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">All recorded tickets</span>
        </div>

        {/* Pending */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'ALL' : 'Pending')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Needs assignment</span>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'ALL' : 'In Progress')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'In Progress'
              ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-bold">In Progress</span>
            <Wrench className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{inProgressCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Technicians on-site</span>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Resolved' ? 'ALL' : 'Resolved')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">
            {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}% resolved
          </span>
        </div>

        {/* Emergency (spans full width of 2 cols on mobile) */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'Emergency' ? 'ALL' : 'Emergency')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer col-span-1 min-[340px]:col-span-2 lg:col-span-1 ${
            priorityFilter === 'Emergency'
              ? 'bg-red-100 dark:bg-red-950/60 border-red-500'
              : 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Flame className="w-4 h-4" /> Emergency Issues
            </span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-600">{emergencyCount}</p>
          <span className="text-[10px] sm:text-[11px] text-red-500 font-semibold">Immediate attention</span>
        </div>
      </div>

      {/* Filter and Search Bar with Collapsible Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input (44px min height) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, ID, building, reporter..."
              className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          {/* Mobile Collapsible Filter Toggle Button (44px min height) */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="sm:hidden min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-purple-600" />
              <span>{isFilterExpanded ? 'Hide Filters' : 'Show Filters'}</span>
            </div>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Dropdowns: Visible on desktop, Toggleable on mobile */}
        <div className={`mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 ${isFilterExpanded ? 'grid' : 'hidden sm:grid'}`}>
          {/* Status Filter */}
          <div>
            <label className="block sm:hidden text-[11px] font-bold text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Statuses ({complaints.length})</option>
              <option value="Pending">Pending ({pendingCount})</option>
              <option value="In Progress">In Progress ({inProgressCount})</option>
              <option value="Resolved">Resolved ({resolvedCount})</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block sm:hidden text-[11px] font-bold text-slate-400 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Emergency">🚨 Emergency Only</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block sm:hidden text-[11px] font-bold text-slate-400 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC & Climate">HVAC & Climate</option>
              <option value="Furniture & Carpentry">Furniture & Carpentry</option>
              <option value="Cleanliness & Sanitation">Cleanliness & Sanitation</option>
              <option value="Safety & Security">Safety & Security</option>
              <option value="Network & Wi-Fi">Network & Wi-Fi</option>
              <option value="Civil & Structural">Civil & Structural</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear Tag */}
        {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL') && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredComplaints.length} of {complaints.length} complaints</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium min-h-[44px] sm:min-h-0 flex items-center"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* MOBILE COMPLAINT CARDS (Visible on mobile/tablet < lg screens)
          Format required:
          CF-2026-00124
          Electrical Socket Damaged
          📍 Block A - Room 204
          Priority: Emergency
          Status: In Progress
          [View Details] */}
      <div className="lg:hidden space-y-3 mb-8">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
            <p className="text-sm font-semibold">No complaints match your filters.</p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                  {c.id}
                </span>
                <span className="text-[11px] text-slate-400">{c.category}</span>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.building} - {c.room}</span>
                </p>
              </div>

              {/* Priority & Status display lines */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Priority:</span>
                  <PriorityBadge priority={c.priority} size="sm" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              </div>

              {/* Assigned technician info */}
              <div className="text-xs text-slate-500 pt-0.5">
                {c.assignedStaff ? (
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    🔧 Assigned: {c.assignedStaff.name} ({c.assignedStaff.specialty})
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                    ⚠️ Unassigned — Needs Technician
                  </span>
                )}
              </div>

              {/* Mobile Action buttons (44px min touch target) */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setSelectedComplaint(c)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Manage
                </button>
                <button
                  onClick={() => setActiveTab('track', c.id)}
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Visible only on desktop >= lg screens) */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Issue Title & Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Staff</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No complaints match your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-slate-400">{c.category}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {c.building}
                      </p>
                      <p className="text-[11px] text-slate-400">{c.room}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {c.assignedStaff ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={c.assignedStaff.avatar}
                            alt={c.assignedStaff.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">
                              {c.assignedStaff.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{c.assignedStaff.specialty}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Manage
                        </button>
                        <button
                          onClick={() => setActiveTab('track', c.id)}
                          className="min-h-[36px] w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Track details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Admin Action Drawer / Bottom Sheet for Mobile & Centered Modal for Desktop:
          Allows View | Assign | Priority | Status without requiring desktop view! */}
      {currentModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-5 sm:p-6 overflow-y-auto max-h-[92vh] sm:max-h-[85vh]">
            {/* Mobile Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                  {currentModalComplaint.id}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  {currentModalComplaint.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Details Banner */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 mb-5 text-xs space-y-1.5">
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Description:</strong> {currentModalComplaint.description}
              </p>
              <div className="flex flex-wrap gap-3 text-slate-500 pt-1">
                <span>📍 {currentModalComplaint.building} ({currentModalComplaint.room})</span>
                <span>👤 Reporter: {currentModalComplaint.reporter.name}</span>
                <span>🏷️ {currentModalComplaint.category}</span>
              </div>
            </div>

            {/* Action 1: Change Priority (44px min touch targets) */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Update Priority Level
              </label>
              <div className="grid grid-cols-2 min-[340px]:grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Emergency'] as IssuePriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => updatePriority(currentModalComplaint.id, p)}
                    className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentModalComplaint.priority === p
                        ? p === 'Emergency'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Action 2: Assign Maintenance Staff (44px min touch targets) */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Assign Maintenance Specialist
              </label>
              <div className="space-y-2">
                {staffList.map((staff) => {
                  const isAssigned = currentModalComplaint.assignedStaff?.id === staff.id;
                  return (
                    <div
                      key={staff.id}
                      onClick={() => assignStaffToComplaint(currentModalComplaint.id, staff)}
                      className={`min-h-[52px] p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isAssigned
                          ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 ring-1 ring-purple-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {staff.name}
                          </p>
                          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                            {staff.specialty}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                          isAssigned
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isAssigned ? 'Assigned ✓' : 'Assign'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action 3: Change Status (44px min touch targets) */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                3. Direct Status Override
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pending', 'In Progress', 'Resolved'] as IssueStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateStatus(currentModalComplaint.id, st)}
                    className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentModalComplaint.status === st
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions (44px min touch targets) */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setActiveTab('track', currentModalComplaint.id);
                }}
                className="min-h-[44px] flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Track Live Progress →
              </button>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

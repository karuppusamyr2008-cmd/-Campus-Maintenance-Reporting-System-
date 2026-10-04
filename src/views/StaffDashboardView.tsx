import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, IssueStatus } from '../types';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import {
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  MessageSquare,
  Play,
  Send,
  Upload,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';

export const StaffDashboardView: React.FC = () => {
  const {
    complaints,
    currentUser,
    setCurrentRole,
    staffStartWork,
    addProgressNote,
    resolveComplaint,
    assignStaffToComplaint,
    setActiveTab,
    staffList,
  } = useApp();

  // Tab: 'assigned' (assigned to me) | 'all_active' | 'resolved'
  const [staffTab, setStaffTab] = useState<'assigned' | 'all_active' | 'resolved'>('assigned');

  // Modal states for action
  const [noteModalComplaint, setNoteModalComplaint] = useState<Complaint | null>(null);
  const [resolveModalComplaint, setResolveModalComplaint] = useState<Complaint | null>(null);

  const [noteText, setNoteText] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('');

  // Find tickets assigned to current user
  const assignedToMe = complaints.filter(
    (c) => c.assignedStaff?.id === currentUser.id && c.status !== 'Resolved'
  );

  const allActiveWorkOrders = complaints.filter((c) => c.status !== 'Resolved');
  const myResolvedWorkOrders = complaints.filter(
    (c) =>
      c.status === 'Resolved' &&
      (c.assignedStaff?.id === currentUser.id ||
        c.resolutionInfo?.completedBy.includes(currentUser.name))
  );

  const displayedList =
    staffTab === 'assigned'
      ? assignedToMe
      : staffTab === 'all_active'
      ? allActiveWorkOrders
      : myResolvedWorkOrders;

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalComplaint || !noteText.trim()) return;
    addProgressNote(noteModalComplaint.id, noteText.trim());
    setNoteText('');
    setNoteModalComplaint(null);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalComplaint || !resolveNotes.trim()) return;
    resolveComplaint(
      resolveModalComplaint.id,
      resolveNotes.trim(),
      completionPhotoUrl || resolveModalComplaint.photoUrl
    );
    setResolveNotes('');
    setCompletionPhotoUrl('');
    setResolveModalComplaint(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAcceptAssignment = (complaint: Complaint) => {
    // If not already assigned to current technician, assign it to them
    const activeStaffMember = staffList.find((s) => s.id === currentUser.id) || staffList[0];
    assignStaffToComplaint(complaint.id, activeStaffMember);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Top Banner / Staff Persona Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Wrench className="w-4 h-4" /> Field Technician Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Maintenance Crew Operations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Active technician: <strong>{currentUser.name}</strong> ({currentUser.department || 'Maintenance Staff'})
          </p>
        </div>

        {/* Switch Active Technician */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Technician:</span>
          <select
            value={currentUser.id}
            onChange={(e) => setCurrentRole('staff', e.target.value)}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards: 2 cards per row on mobile, 1 col on < 340px */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Assigned to Me</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{assignedToMe.length}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Active tickets under your name</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Campus Open Work Orders</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{allActiveWorkOrders.length}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Total campus tickets in flight</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-1 min-[340px]:col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 font-medium">Resolved by Crew</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {complaints.filter((c) => c.status === 'Resolved').length}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Successfully closed work orders</span>
        </div>
      </div>

      {/* Tabs with min 44px touch height */}
      <div className="flex overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setStaffTab('assigned')}
          className={`min-h-[44px] pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            staffTab === 'assigned'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Assigned ({assignedToMe.length})
        </button>
        <button
          onClick={() => setStaffTab('all_active')}
          className={`min-h-[44px] pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            staffTab === 'all_active'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          All Active ({allActiveWorkOrders.length})
        </button>
        <button
          onClick={() => setStaffTab('resolved')}
          className={`min-h-[44px] pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            staffTab === 'resolved'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Resolved ({myResolvedWorkOrders.length})
        </button>
      </div>

      {/* Work Orders List */}
      {displayedList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {staffTab === 'assigned'
              ? 'No tickets currently assigned to you!'
              : 'No complaints in this category.'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Check the "All Active Work Orders" tab to see unassigned campus issues or switch to Admin to assign tasks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {displayedList.map((complaint) => {
            const isAssignedToMe = complaint.assignedStaff?.id === currentUser.id;
            const isEmergency = complaint.priority === 'Emergency';

            return (
              <div
                key={complaint.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-6 flex flex-col justify-between shadow-xs transition-all ${
                  isEmergency
                    ? 'border-red-400 dark:border-red-800 bg-red-50/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top line: ID & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                      {complaint.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={complaint.priority} size="sm" />
                      <StatusBadge status={complaint.status} size="sm" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {complaint.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {complaint.description}
                  </p>

                  {/* Location Info Card */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1 mb-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      📍 {complaint.building} — {complaint.room}
                    </p>
                    <p className="text-slate-500">
                      Zone: {complaint.location} • Category: {complaint.category}
                    </p>
                    <p className="text-slate-500">
                      👤 Reported by: {complaint.reporter.name} (
                      {complaint.reporter.studentId || 'Campus'})
                    </p>
                  </div>

                  {/* Recent Progress Notes */}
                  {complaint.progressNotes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Latest Progress Log ({complaint.progressNotes.length}):
                      </p>
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                        <p className="italic">
                          "{complaint.progressNotes[complaint.progressNotes.length - 1].text}"
                        </p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                          — {complaint.progressNotes[complaint.progressNotes.length - 1].author}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resolution info if resolved */}
                  {complaint.resolutionInfo && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Resolution Note:
                      </p>
                      <p className="mt-1">{complaint.resolutionInfo.completionNotes}</p>
                    </div>
                  )}
                </div>

                {/* Mobile Maintenance Actions:
                    Each assigned issue has large touch-friendly buttons:
                    - Accept
                    - Start Work
                    - Add Update
                    - Mark Resolved */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Accept Button (if unassigned or not assigned to me yet) */}
                    {!isAssignedToMe && complaint.status !== 'Resolved' ? (
                      <button
                        onClick={() => handleAcceptAssignment(complaint)}
                        className="min-h-[44px] py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" /> Accept
                      </button>
                    ) : (
                      /* 2. Start Work Button (if Pending and assigned) */
                      complaint.status === 'Pending' ? (
                        <button
                          onClick={() => staffStartWork(complaint.id)}
                          className="min-h-[44px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-4 h-4" /> Start Work
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('track', complaint.id)}
                          className="min-h-[44px] py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" /> View Details
                        </button>
                      )
                    )}

                    {/* 3. Add Update Note Button */}
                    <button
                      onClick={() => setNoteModalComplaint(complaint)}
                      className="min-h-[44px] py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" /> Add Update
                    </button>
                  </div>

                  {/* 4. Mark Resolved Button - Full width high-visibility action */}
                  {complaint.status !== 'Resolved' && (
                    <button
                      onClick={() => setResolveModalComplaint(complaint)}
                      className="w-full min-h-[46px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Progress Note Bottom-Sheet (Mobile) / Centered Modal (Desktop) */}
      {noteModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            {/* Mobile drag handle */}
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">
                  {noteModalComplaint.id}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Add Progress Note
                </h3>
              </div>
              <button
                onClick={() => setNoteModalComplaint(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technician On-Site Progress Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Replaced faulty circuit breaker in main panel B. Testing load balance..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModalComplaint(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs"
                >
                  Save Progress Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Resolved Bottom-Sheet (Mobile) / Centered Modal (Desktop) */}
      {resolveModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-600">
                  {resolveModalComplaint.id}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  Complete & Resolve Ticket
                </h3>
              </div>
              <button
                onClick={() => setResolveModalComplaint(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Summary & Actions Taken <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Describe repair actions, parts installed, tests conducted, and verification completed..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Completion Photo with direct mobile camera support */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Completion Verification Photo (Take Photo with Camera)
                </label>
                {completionPhotoUrl ? (
                  <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200">
                    <img
                      src={completionPhotoUrl}
                      alt="Completion"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCompletionPhotoUrl('')}
                      className="absolute top-2 right-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-slate-900/80 text-white"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="min-h-[52px] flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Camera className="w-5 h-5 text-emerald-600" />
                      <span>Camera Snapshot</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <label className="min-h-[52px] flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Upload className="w-5 h-5 text-indigo-600" />
                      <span>Upload Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalComplaint(null)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20"
                >
                  Mark as Resolved & Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

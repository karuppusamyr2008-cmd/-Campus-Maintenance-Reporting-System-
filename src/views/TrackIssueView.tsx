import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Search,
  Send,
  User,
  Wrench,
  ArrowDown,
} from 'lucide-react';

export const TrackIssueView: React.FC = () => {
  const { complaints, selectedTrackId, addProgressNote, currentUser } = useApp();

  const [searchId, setSearchId] = useState<string>('');
  const [activeComplaintId, setActiveComplaintId] = useState<string>('');
  const [newComment, setNewComment] = useState('');

  // Sync selectedTrackId from context if supplied
  useEffect(() => {
    if (selectedTrackId) {
      setSearchId(selectedTrackId);
      setActiveComplaintId(selectedTrackId);
    } else if (complaints.length > 0 && !activeComplaintId) {
      // default to first complaint
      setSearchId(complaints[0].id);
      setActiveComplaintId(complaints[0].id);
    }
  }, [selectedTrackId, complaints]);

  const activeComplaint = complaints.find(
    (c) => c.id.toLowerCase() === activeComplaintId.toLowerCase()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setActiveComplaintId(searchId.trim());
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeComplaint) return;
    addProgressNote(activeComplaint.id, newComment.trim());
    setNewComment('');
  };

  // 5-stage workflow specifically required for Mobile Issue Tracking:
  // Reported ↓ Reviewed ↓ Assigned ↓ In Progress ↓ Resolved
  const getWorkflowStages = () => {
    if (!activeComplaint) return [];
    const isAssigned = !!activeComplaint.assignedStaff;
    const isInProgress =
      activeComplaint.status === 'In Progress' || activeComplaint.status === 'Resolved';
    const isResolved = activeComplaint.status === 'Resolved';

    return [
      {
        id: 'stage_reported',
        title: 'Reported',
        desc: `Logged by ${activeComplaint.reporter.name} (${new Date(activeComplaint.createdAt).toLocaleDateString()})`,
        completed: true,
        current: activeComplaint.status === 'Pending' && !isAssigned,
      },
      {
        id: 'stage_reviewed',
        title: 'Reviewed',
        desc: 'Facilities evaluated severity & SLA priority',
        completed: true,
        current: false,
      },
      {
        id: 'stage_assigned',
        title: 'Assigned',
        desc: activeComplaint.assignedStaff
          ? `Dispatched to ${activeComplaint.assignedStaff.name} (${activeComplaint.assignedStaff.specialty})`
          : 'Pending staff assignment',
        completed: isAssigned,
        current: isAssigned && activeComplaint.status === 'Pending',
      },
      {
        id: 'stage_inprogress',
        title: 'In Progress',
        desc: isInProgress
          ? 'Specialist actively on-site conducting repairs'
          : 'Technician scheduled for on-site diagnosis',
        completed: isInProgress,
        current: activeComplaint.status === 'In Progress',
      },
      {
        id: 'stage_resolved',
        title: 'Resolved',
        desc: isResolved
          ? activeComplaint.resolutionInfo?.completionNotes || 'Fix verified and signed off'
          : 'Pending final resolution & sign-off',
        completed: isResolved,
        current: isResolved,
      },
    ];
  };

  const workflowStages = getWorkflowStages();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase">
          Issue Tracking
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Track Complaint Status
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
          Enter any complaint ticket ID to view real-time progress, assigned technician, and chronological timeline.
        </p>
      </div>

      {/* Search Bar + Quick Chips (48px min touch targets) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 mb-6 sm:mb-8 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ticket ID (e.g. CFX-2026-0101)..."
              className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 dark:text-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center"
          >
            Track Status
          </button>
        </form>

        {/* Quick Clickable Ticket Chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs text-slate-400 font-medium shrink-0">Quick Tickets:</span>
          {complaints.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchId(c.id);
                setActiveComplaintId(c.id);
              }}
              className={`min-h-[36px] text-xs px-2.5 py-1.5 rounded-lg font-mono shrink-0 transition-all cursor-pointer ${
                activeComplaintId === c.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Issue Details View */}
      {activeComplaint ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Stepper Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-black text-base sm:text-lg text-blue-600 dark:text-blue-400">
                    {activeComplaint.id}
                  </span>
                  <StatusBadge status={activeComplaint.status} size="sm" />
                  <PriorityBadge priority={activeComplaint.priority} size="sm" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  {activeComplaint.title}
                </h2>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 space-y-0.5">
                <p>Reported: {new Date(activeComplaint.createdAt).toLocaleDateString()}</p>
                <p>
                  Updated:{' '}
                  {new Date(activeComplaint.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* MOBILE VERTICAL TIMELINE:
                Reported
                ↓
                Reviewed
                ↓
                Assigned
                ↓
                In Progress
                ↓
                Resolved
                (Visible on mobile < sm, zero horizontal scrolling) */}
            <div className="sm:hidden pt-4 pb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Lifecycle Progression
              </p>
              <div className="relative pl-7 space-y-4">
                {/* Connecting vertical line */}
                <div className="absolute left-3 top-2 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />

                {workflowStages.map((stage, idx) => {
                  const isLast = idx === workflowStages.length - 1;
                  return (
                    <div key={stage.id} className="relative">
                      {/* Circle node */}
                      <div
                        className={`absolute -left-[28px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                          stage.completed
                            ? stage.id === 'stage_resolved'
                              ? 'bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950'
                              : 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {stage.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold ${
                              stage.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                            }`}
                          >
                            {stage.title}
                          </span>
                          {stage.current && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                              Current Stage
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {stage.desc}
                        </p>
                      </div>

                      {/* Down arrow indicator between stages */}
                      {!isLast && (
                        <div className="flex justify-center -my-1.5 text-slate-300 dark:text-slate-600 pl-4">
                          <ArrowDown className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DESKTOP HORIZONTAL STEPPER (Visible on sm and above) */}
            <div className="hidden sm:block pt-8 pb-4">
              <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-blue-600 dark:bg-blue-500 transition-all duration-500 -z-0"
                  style={{
                    width:
                      activeComplaint.status === 'Resolved'
                        ? '100%'
                        : activeComplaint.status === 'In Progress'
                        ? '50%'
                        : '0%',
                  }}
                />

                {/* Step 1: Pending */}
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm bg-blue-600 text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold mt-2 text-slate-800 dark:text-white">
                    1. Pending
                  </span>
                  <span className="text-[10px] text-slate-400">Reported & Logged</span>
                </div>

                {/* Step 2: In Progress */}
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                      activeComplaint.status === 'In Progress' ||
                      activeComplaint.status === 'Resolved'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {activeComplaint.status === 'In Progress' ? (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                    ) : activeComplaint.status === 'Resolved' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-semibold mt-2 text-slate-800 dark:text-white">
                    2. In Progress
                  </span>
                  <span className="text-[10px] text-slate-400">Staff Assigned & On-Site</span>
                </div>

                {/* Step 3: Resolved */}
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                      activeComplaint.status === 'Resolved'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold mt-2 text-slate-800 dark:text-white">
                    3. Resolved
                  </span>
                  <span className="text-[10px] text-slate-400">Verified & Complete</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left 2 Cols: Details & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Incident Details Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-base">
                  Issue Description & Location
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {activeComplaint.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Category</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeComplaint.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Building</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeComplaint.building}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Room / Area</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeComplaint.room}
                    </span>
                  </div>
                </div>

                {/* Uploaded Photo */}
                {activeComplaint.photoUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Attached Inspection Photo
                    </p>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-72 bg-slate-100">
                      <img
                        src={activeComplaint.photoUrl}
                        alt="Incident"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Verification Box (if resolved) */}
              {activeComplaint.resolutionInfo && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Resolution Information
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 mb-3">
                    {activeComplaint.resolutionInfo.completionNotes}
                  </p>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 flex flex-wrap gap-4">
                    <span>
                      <strong>Resolved by:</strong> {activeComplaint.resolutionInfo.completedBy}
                    </span>
                    <span>
                      <strong>Date:</strong>{' '}
                      {new Date(activeComplaint.resolutionInfo.completionDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Chronological Progress Timeline */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Chronological Progress Timeline
                </h3>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {activeComplaint.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600" />
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {event.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {new Date(event.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {event.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          Logged by: {event.actor} ({event.actorRole})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Note / Inquiry Form */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Add Progress Note or Question
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Post an update as {currentUser.name} ({currentUser.role}).
                </p>
                <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type an update, question, or note..."
                    className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Update
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Assigned Staff & Reporter Cards */}
            <div className="space-y-4 sm:space-y-6">
              {/* Assigned Staff Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Assigned Technician
                </h3>
                {activeComplaint.assignedStaff ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={activeComplaint.assignedStaff.avatar}
                        alt={activeComplaint.assignedStaff.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {activeComplaint.assignedStaff.name}
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {activeComplaint.assignedStaff.specialty}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activeComplaint.assignedStaff.phone}
                        </p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium text-center">
                      Specialist Dispatched On-Site
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Awaiting Staff Assignment
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Campus facilities admin will assign a specialist technician shortly.
                    </p>
                  </div>
                )}
              </div>

              {/* Reporter Info */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Reported By
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                    {activeComplaint.reporter.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeComplaint.reporter.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{activeComplaint.reporter.email}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ID: {activeComplaint.reporter.studentId || 'Campus Resident'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            No Ticket Found with ID "{searchId}"
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Please check the ticket format (e.g. CFX-2026-0101) or click one of the quick select tickets above.
          </p>
        </div>
      )}
    </div>
  );
};

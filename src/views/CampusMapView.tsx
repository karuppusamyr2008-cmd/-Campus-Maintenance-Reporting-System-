import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CAMPUS_BUILDINGS } from '../data/seedData';
import { CampusBuilding, Complaint, IssuePriority, IssueStatus } from '../types';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Filter,
  Flame,
  Info,
  MapPin,
  Navigation,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

export const CampusMapView: React.FC = () => {
  const { complaints, setActiveTab } = useApp();

  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isMobileBottomSheetOpen, setIsMobileBottomSheetOpen] = useState(false);

  // Zoom level state for touch interaction
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Filter complaints for map display
  const mapComplaints = complaints.filter((c) => {
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  const getMarkerColor = (complaint: Complaint) => {
    if (complaint.priority === 'Emergency')
      return 'bg-red-600 text-white animate-pulse ring-4 ring-red-400/50';
    if (complaint.status === 'Resolved') return 'bg-emerald-600 text-white';
    if (complaint.status === 'In Progress') return 'bg-blue-600 text-white ring-2 ring-blue-300';
    return 'bg-amber-500 text-white';
  };

  const handleBuildingClick = (bldg: CampusBuilding) => {
    setSelectedBuilding(bldg);
    const bldgComplaints = complaints.filter((c) => c.building === bldg.name);
    if (bldgComplaints.length > 0) {
      setSelectedComplaint(bldgComplaints[0]);
    }
    // Open mobile bottom sheet on small screens
    setIsMobileBottomSheetOpen(true);
  };

  const handleComplaintPinClick = (e: React.MouseEvent, c: Complaint) => {
    e.stopPropagation();
    setSelectedComplaint(c);
    const bldg = CAMPUS_BUILDINGS.find((b) => b.name === c.building);
    if (bldg) setSelectedBuilding(bldg);
    setIsMobileBottomSheetOpen(true);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.6, z + 0.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.9, z - 0.2));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Compass className="w-4 h-4" /> Interactive Campus Map
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus Operations Geo-Map
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Geographic distribution of maintenance tickets, work orders, and emergency incident markers.
          </p>
        </div>

        {/* Quick Map Controls / Filters (min 44px touch targets) */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="In Progress">In Progress Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Emergency">🚨 Emergency Only</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Campus Map */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-xl overflow-hidden relative min-h-[480px] sm:min-h-[520px] flex flex-col justify-between">
          {/* Top Campus Map Header with Zoom Touch Controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 z-10 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Navigation className="w-4 h-4 text-blue-400 rotate-45" /> University Main Campus Quad
            </span>

            {/* Touch Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={handleZoomIn}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-200 hover:text-white rounded hover:bg-slate-700 transition-colors"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-200 hover:text-white rounded hover:bg-slate-700 transition-colors"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="min-h-[36px] px-2 flex items-center justify-center text-[10px] text-slate-300 hover:text-white rounded hover:bg-slate-700 transition-colors font-mono"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>
          </div>

          {/* Interactive Map Visual Layer with Zoom Transform */}
          <div className="relative flex-1 w-full my-3 rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800 min-h-[380px] sm:min-h-[440px]">
            <div
              className="absolute inset-0 transition-transform duration-300 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Campus Pathways & Green Zones SVG background */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="campus-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path
                      d="M 30 0 L 0 0 0 30"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="0.8"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#campus-grid)" />

                {/* Main walkways */}
                <line x1="20%" y1="10%" x2="20%" y2="90%" stroke="#334155" strokeWidth="6" strokeDasharray="4 2" />
                <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#334155" strokeWidth="8" />
                <line x1="80%" y1="10%" x2="80%" y2="90%" stroke="#334155" strokeWidth="6" strokeDasharray="4 2" />
                <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#334155" strokeWidth="8" />
                <circle cx="50%" cy="50%" r="40" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {/* Building Blocks */}
              {CAMPUS_BUILDINGS.map((bldg) => {
                const bldgComplaints = complaints.filter((c) => c.building === bldg.name);
                const hasEmergency = bldgComplaints.some(
                  (c) => c.priority === 'Emergency' && c.status !== 'Resolved'
                );
                const isSelected = selectedBuilding?.id === bldg.id;

                return (
                  <div
                    key={bldg.id}
                    onClick={() => handleBuildingClick(bldg)}
                    style={{
                      left: `${bldg.coords.x}%`,
                      top: `${bldg.coords.y}%`,
                      width: `${bldg.coords.width}%`,
                      height: `${bldg.coords.height}%`,
                    }}
                    className={`absolute rounded-xl border p-1.5 sm:p-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                      isSelected
                        ? 'bg-blue-900/60 border-blue-400 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                        : hasEmergency
                        ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-500/20'
                        : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] sm:text-[10px] font-bold text-blue-400">
                        {bldg.code}
                      </span>
                      {bldgComplaints.length > 0 && (
                        <span
                          className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            hasEmergency
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {bldgComplaints.length}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-200 leading-tight truncate">
                      {bldg.name}
                    </p>
                  </div>
                );
              })}

              {/* Complaint Pins */}
              {mapComplaints.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={(e) => handleComplaintPinClick(e, c)}
                    style={{
                      left: `${c.mapCoords.x}%`,
                      top: `${c.mapCoords.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform hover:scale-125 ${
                      isSelected ? 'scale-125 z-30' : ''
                    }`}
                    title={`${c.id}: ${c.title}`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg ${getMarkerColor(
                        c
                      )}`}
                    >
                      {c.priority === 'Emergency' ? (
                        <Flame className="w-3.5 h-3.5" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" /> Emergency
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Resolved
            </span>
          </div>
        </div>

        {/* Right Details Panel for Desktop (>= lg screens) */}
        <div className="hidden lg:block space-y-6">
          {/* Selected Building Details */}
          {selectedBuilding ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {selectedBuilding.code}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedBuilding.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3">{selectedBuilding.description}</p>
              <div className="text-xs text-slate-400 mb-3">
                📍 Zone: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedBuilding.zone}</span>
              </div>

              {/* Complaints at this building */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Building Tickets ({complaints.filter((c) => c.building === selectedBuilding.name).length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {complaints
                    .filter((c) => c.building === selectedBuilding.name)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedComplaint(item)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedComplaint?.id === item.id
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {item.id}
                          </span>
                          <PriorityBadge priority={item.priority} size="sm" />
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.room} • {item.status}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-xs">
              <Building className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click any building block on the map
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                View building info and inspect all incidents reported inside.
              </p>
            </div>
          )}

          {/* Selected Complaint Card */}
          {selectedComplaint && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-300 dark:border-blue-800 p-5 shadow-md">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {selectedComplaint.id}
                </span>
                <StatusBadge status={selectedComplaint.status} size="sm" />
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {selectedComplaint.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                {selectedComplaint.description}
              </p>

              <div className="text-[11px] text-slate-500 space-y-1 mb-4 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                <p>📍 {selectedComplaint.building} ({selectedComplaint.room})</p>
                <p>🔧 Category: {selectedComplaint.category}</p>
                {selectedComplaint.assignedStaff && (
                  <p className="text-blue-600 font-medium">
                    Technician: {selectedComplaint.assignedStaff.name}
                  </p>
                )}
              </div>

              <button
                onClick={() => setActiveTab('track', selectedComplaint.id)}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Track Live Ticket <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <NearbyMapsSuppliersPanel />
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FOR MAP INSPECTION (< lg screens):
          Opens issue & building details in a slide-up bottom sheet directly on mobile tap */}
      {isMobileBottomSheetOpen && (selectedComplaint || selectedBuilding) && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {selectedComplaint ? selectedComplaint.id : selectedBuilding?.code}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedComplaint ? selectedComplaint.title : selectedBuilding?.name}
                </h3>
              </div>
              <button
                onClick={() => setIsMobileBottomSheetOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedComplaint ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={selectedComplaint.priority} size="sm" />
                  <StatusBadge status={selectedComplaint.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedComplaint.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    📍 {selectedComplaint.building} - {selectedComplaint.room}
                  </p>
                  <p className="text-slate-500">
                    Category: {selectedComplaint.category}
                  </p>
                  {selectedComplaint.assignedStaff && (
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      🔧 Assigned: {selectedComplaint.assignedStaff.name} ({selectedComplaint.assignedStaff.specialty})
                    </p>
                  )}
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileBottomSheetOpen(false);
                      setActiveTab('track', selectedComplaint.id);
                    }}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Track Progress <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsMobileBottomSheetOpen(false)}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center"
                  >
                    Close Sheet
                  </button>
                </div>
              </div>
            ) : selectedBuilding ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">{selectedBuilding.description}</p>
                <p className="text-xs text-slate-400">Zone: {selectedBuilding.zone}</p>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tickets in Building ({complaints.filter((c) => c.building === selectedBuilding.name).length}):
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {complaints
                      .filter((c) => c.building === selectedBuilding.name)
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedComplaint(item)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50"
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-mono font-bold text-blue-600">{item.id}</span>
                            <StatusBadge status={item.status} size="sm" />
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-white truncate">
                            {item.title}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileBottomSheetOpen(false)}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold mt-2"
                >
                  Back to Map
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// Supporting component for Live Google Maps Grounding search
const NearbyMapsSuppliersPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [links, setLinks] = useState<Array<{ title: string; uri: string }>>([]);
  const { setIsChatOpen } = useApp();

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm || query).trim();
    if (!q) return;

    setIsLoading(true);
    setResultText(null);
    setLinks([]);

    try {
      const res = await fetch('/api/maps-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search places');

      setResultText(data.text);
      setLinks(data.groundingLinks || []);
    } catch (err: any) {
      setResultText(`Error fetching Maps data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Nearby Vendors (Google Maps)
        </h4>
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
          gemini-3.5-flash
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Find parts suppliers, hardware stores, or medical clinics near campus using real-time Maps data.
      </p>

      {/* Quick Search Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {['Hardware Store', 'Plumbing Supply', 'Emergency Clinic', 'Electrician Supply'].map((item) => (
          <button
            key={item}
            onClick={() => {
              setQuery(item);
              handleSearch(item);
            }}
            className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-1.5 mb-3"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 24hr plumbing supply..."
          className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isLoading ? '...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {resultText && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2 max-h-56 overflow-y-auto">
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {resultText}
          </p>

          {links.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Google Maps Links:</p>
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:underline text-[11px]"
                >
                  <span className="truncate">{link.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer link to full chat */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="mt-3 w-full py-1.5 text-center text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
      >
        Ask CivicFix AI Copilot for Full Advice →
      </button>
    </div>
  );
};

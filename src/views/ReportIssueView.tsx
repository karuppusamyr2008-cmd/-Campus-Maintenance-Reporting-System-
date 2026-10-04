import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CAMPUS_BUILDINGS, SAMPLE_ISSUE_PHOTOS } from '../data/seedData';
import { IssueCategory, IssuePriority } from '../types';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  PlusCircle,
  Send,
  Upload,
  X,
} from 'lucide-react';
import { PriorityBadge } from '../components/StatusBadge';

const CATEGORIES: IssueCategory[] = [
  'Plumbing',
  'Electrical',
  'HVAC & Climate',
  'Furniture & Carpentry',
  'Cleanliness & Sanitation',
  'Network & Wi-Fi',
  'Safety & Security',
  'Civil & Structural',
  'Other',
];

const PRIORITIES: { value: IssuePriority; label: string; desc: string; icon: any; color: string }[] = [
  {
    value: 'Low',
    label: 'Low Priority',
    desc: 'Minor issue; does not disrupt classes or living.',
    icon: Info,
    color: 'border-slate-300 dark:border-slate-700 hover:border-slate-400',
  },
  {
    value: 'Medium',
    label: 'Medium Priority',
    desc: 'Noticeable issue needing repair within standard SLA.',
    icon: AlertTriangle,
    color: 'border-amber-300 dark:border-amber-700 hover:border-amber-400',
  },
  {
    value: 'High',
    label: 'High Priority',
    desc: 'Significant disruption to study, work, or room comfort.',
    icon: AlertCircle,
    color: 'border-orange-400 dark:border-orange-700 hover:border-orange-500',
  },
  {
    value: 'Emergency',
    label: 'Emergency',
    desc: 'Immediate hazard, flooding, gas, or electrical fire.',
    icon: Flame,
    color: 'border-red-500 dark:border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-700',
  },
];

export const ReportIssueView: React.FC = () => {
  const { createComplaint, setActiveTab, currentUser } = useApp();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Plumbing');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0].name);
  const [room, setRoom] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success modal
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Get location zone from selected building
  const selectedBuildingObj =
    CAMPUS_BUILDINGS.find((b) => b.name === building) || CAMPUS_BUILDINGS[0];
  const locationZone = selectedBuildingObj.zone;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Issue title is required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Please provide a detailed description.';
    } else if (description.trim().length < 15) {
      errs.description = 'Description should provide at least 15 characters of detail.';
    }

    if (!room.trim()) {
      errs.room = 'Specific room number, lab, or area description is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        location: locationZone,
        building,
        room: room.trim(),
        photoUrl: photoUrl || undefined,
        priority,
      });

      setIsSubmitting(false);
      setSubmittedId(generatedId);
    }, 400);
  };

  const copyToClipboard = () => {
    if (submittedId) {
      navigator.clipboard.writeText(submittedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setRoom('');
    setCategory('Plumbing');
    setPriority('Medium');
    setPhotoUrl('');
    setErrors({});
    setSubmittedId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <PlusCircle className="w-4 h-4" /> Report Issue
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Report a Campus Issue
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs sm:text-sm leading-relaxed">
          Submit facilities, plumbing, electrical, and maintenance requests directly to campus dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Mobile-first Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-7 shadow-xs space-y-5"
          >
            {/* Title (Full width, 48px touch height, clear error) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g., Water leaking from ceiling in Room 204"
                className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 dark:text-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errors.title}
                </p>
              )}
            </div>

            {/* Category Selector: Large touch-friendly selectors with minimum 44px buttons */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Issue Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Building & Room dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Building / Block <span className="text-red-500">*</span>
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/60 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {CAMPUS_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Zone: {locationZone}
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Room Number / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => {
                    setRoom(e.target.value);
                    if (errors.room) setErrors((prev) => ({ ...prev, room: '' }));
                  }}
                  placeholder="e.g. Room 204 or Hallway B"
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 dark:text-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.room
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {errors.room && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {errors.room}
                  </p>
                )}
              </div>
            </div>

            {/* Description (Full width, clear spacing) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Describe what is broken, visible damage, sounds heard, or hazards..."
                className={`w-full p-3.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 dark:text-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errors.description}
                </p>
              )}
            </div>

            {/* Priority Selector (Minimum 48px touch targets) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITIES.map((p) => {
                  const Icon = p.icon;
                  const isSelected = priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`min-h-[52px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${p.color} ${
                        isSelected
                          ? 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <Icon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</p>
                    </button>
                  );
                })}
              </div>
              {priority === 'Emergency' && (
                <div className="mt-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <Flame className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <p>
                    <strong>Emergency protocol:</strong> Dispatches immediate notifications to Facilities Control and Campus Safety.
                  </p>
                </div>
              )}
            </div>

            {/* Photo Upload: Camera / Gallery Choice with 56px touch height */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Issue Photo (Camera or File)
              </label>
              <div className="space-y-3">
                {photoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 w-full h-44 bg-slate-100">
                    <img src={photoUrl} alt="Complaint preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-black transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Take Photo with Camera */}
                    <label className="min-h-[56px] flex items-center justify-center gap-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold">
                      <Camera className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>Take Photo / Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Choose from Gallery */}
                    <label className="min-h-[56px] flex items-center justify-center gap-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold">
                      <Upload className="w-5 h-5 text-indigo-600 shrink-0" />
                      <span>Upload from Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Preset Chips for quick testing */}
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-1.5">
                    Or select a 1-click sample incident photo:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_ISSUE_PHOTOS.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => setPhotoUrl(sample.url)}
                        className="min-h-[36px] text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center cursor-pointer"
                      >
                        📷 {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Report Button: Full Width on Mobile with 52px height */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[52px] py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Complaint & Generate Ticket ID</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Reporter Profile */}
        <div className="space-y-4 sm:space-y-6">
          {/* Active Reporter Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Filing As Active User
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                  {currentUser.studentId || currentUser.department || currentUser.role}
                </span>
              </div>
            </div>
          </div>

          {/* Service SLAs */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xs">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5 text-blue-300">
              <Building2 className="w-4 h-4" /> Campus Service SLAs
            </h3>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                <span className="text-red-400 font-bold">Emergency</span>
                <span>Response in &lt; 30 mins</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                <span className="text-orange-400 font-semibold">High Priority</span>
                <span>Within 4 hours</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                <span className="text-amber-400 font-medium">Medium Priority</span>
                <span>Within 24 hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Low Priority</span>
                <span>Within 72 hours</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal (Mobile Bottom-Sheet / Desktop Modal) */}
      {submittedId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 sm:p-6 text-center max-h-[92vh] overflow-y-auto">
            {/* Drag bar for mobile */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3 sm:mb-4">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
              Complaint Logged Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Your ticket has been dispatched to campus facilities maintenance.
            </p>

            {/* Generated ID Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Your Complaint Tracking ID
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-wide">
                  {submittedId}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Copy ID"
                  aria-label="Copy Ticket ID"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && <p className="text-[11px] text-emerald-600 font-medium mt-1">Copied to clipboard!</p>}
            </div>

            {/* Action Buttons (44px min touch targets) */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('track', submittedId);
                }}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                Track This Ticket Live <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('student');
                }}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all cursor-pointer"
              >
                View in My Reports
              </button>

              <button
                onClick={handleResetForm}
                className="w-full min-h-[44px] py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
              >
                Submit Another Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FilePlus,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentRole, setActiveTab, resetToSeedData, complaints } = useApp();

  if (!isOpen) return null;

  // Find a complaint that is ready to test at each stage
  const pendingComplaint = complaints.find((c) => c.status === 'Pending') || complaints[0];
  const inProgressComplaint = complaints.find((c) => c.status === 'In Progress') || complaints[0];
  const resolvedComplaint = complaints.find((c) => c.status === 'Resolved') || complaints[0];

  const steps = [
    {
      num: 1,
      role: 'student' as const,
      tab: 'report',
      title: 'Step 1: Student Reports an Issue',
      actor: 'Alex Johnson (Student)',
      desc: 'Fill out the Report Issue form with title, category, location, building, room, photo, and priority. Submit to generate a new CFX complaint ID.',
      buttonText: 'Switch to Student & Open Report Form',
      icon: FilePlus,
      color: 'blue',
      action: () => {
        setCurrentRole('student');
        setActiveTab('report');
        onClose();
      },
    },
    {
      num: 2,
      role: 'admin' as const,
      tab: 'admin',
      title: 'Step 2: Admin Prioritizes & Assigns Staff',
      actor: 'Marcus Vance (Facilities Director)',
      desc: 'View all campus complaints. Open the newly submitted complaint, adjust priority if required, and assign a maintenance specialist (e.g. Carlos or Priya).',
      buttonText: 'Switch to Admin & Open Dashboard',
      icon: UserCheck,
      color: 'purple',
      action: () => {
        setCurrentRole('admin');
        setActiveTab('admin');
        onClose();
      },
    },
    {
      num: 3,
      role: 'staff' as const,
      tab: 'staff',
      title: 'Step 3: Maintenance Staff Resolves Work Order',
      actor: 'Carlos Mendez / Priya Patel (Technician)',
      desc: 'View assigned tasks. Click "Start Work" (status moves to In Progress), add progress notes, and click "Resolve" with resolution details.',
      buttonText: 'Switch to Staff & Open Work Orders',
      icon: Wrench,
      color: 'amber',
      action: () => {
        setCurrentRole('staff');
        setActiveTab('staff');
        onClose();
      },
    },
    {
      num: 4,
      role: 'student' as const,
      tab: 'track',
      title: 'Step 4: Student Tracks Real-Time Resolution',
      actor: 'Alex Johnson (Student)',
      desc: 'Search the Complaint ID in the Tracker or My Reports. Watch the live timeline stepper reflect: Pending → In Progress → Resolved with staff notes.',
      buttonText: `Track Active Issue (${pendingComplaint?.id || 'CFX-2026-0102'})`,
      icon: Search,
      color: 'emerald',
      action: () => {
        setCurrentRole('student');
        setActiveTab('track', pendingComplaint?.id || 'CFX-2026-0102');
        onClose();
      },
    },
    {
      num: 5,
      role: 'admin' as const,
      tab: 'analytics',
      title: 'Step 5: View Live Campus Analytics & Map',
      actor: 'Operations Team',
      desc: 'See dynamically calculated metrics: average resolution times, category breakdowns, hotspot buildings, and map pins with emergency indicators.',
      buttonText: 'View Campus Analytics & Map',
      icon: BarChart3,
      color: 'indigo',
      action: () => {
        setCurrentRole('admin');
        setActiveTab('analytics');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold tracking-wider uppercase mb-1">
            <PlayCircle className="w-4 h-4" /> Hackathon Evaluation Guide
          </div>
          <h2 className="text-2xl font-bold">CivicFix Complete End-to-End Flow</h2>
          <p className="text-sm text-blue-100 mt-1">
            Follow these 5 steps to verify all 12 implementation priorities working in real-time without page reload.
          </p>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                    {s.num}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        {s.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {s.actor}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {s.desc}
                    </p>
                    <button
                      onClick={s.action}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {s.buttonText}
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              resetToSeedData();
              onClose();
            }}
            className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Initial Demo Data
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

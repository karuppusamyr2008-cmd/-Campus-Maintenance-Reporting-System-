import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ReportIssueView } from './views/ReportIssueView';
import { TrackIssueView } from './views/TrackIssueView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { StaffDashboardView } from './views/StaffDashboardView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { AnalyticsView } from './views/AnalyticsView';
import { CampusMapView } from './views/CampusMapView';
import { GeminiChatbot } from './components/GeminiChatbot';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  HeartHandshake,
  HelpCircle,
  Info,
  PhoneCall,
  RotateCcw,
  Shield,
  Sparkles,
  Wrench,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    setCurrentRole,
    toast,
    resetToSeedData,
    isChatOpen,
    setIsChatOpen,
  } = useApp();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold border ${
              toast.type === 'warning'
                ? 'bg-amber-600 text-white border-amber-500'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            {toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'report' && <ReportIssueView />}
        {activeTab === 'track' && <TrackIssueView />}
        {activeTab === 'student' && <StudentDashboardView />}
        {activeTab === 'admin' && <AdminDashboardView />}
        {activeTab === 'staff' && <StaffDashboardView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'map' && <CampusMapView />}
      </main>

      {/* Floating AI Assistant Trigger Button (Bottom-Right) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xl shadow-indigo-500/30 hover:scale-105 hover:shadow-2xl transition-all cursor-pointer ring-2 ring-white/20 group"
          title="Open CivicFix AI Assistant"
        >
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
            <Sparkles className="w-4 h-4 text-amber-300 relative" />
          </div>
          <span>AI Assistant & Maps</span>
        </button>
      )}

      {/* Gemini Chatbot Modal / Flyout */}
      <GeminiChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                CivicFix <span className="font-normal text-slate-500">• Campus Operations Portal</span>
              </p>
              <p className="text-slate-400 text-[11px]">
                Built for rapid student civic reporting and facilities dispatch.
              </p>
            </div>
          </div>

          {/* Quick Perspective Switching */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-slate-400 font-medium">Switch Active Persona:</span>
            <button
              onClick={() => setCurrentRole('student')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentRole === 'student'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Student (Alex)
            </button>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Admin (Marcus)
            </button>
            <button
              onClick={() => setCurrentRole('staff', 'staff_carlos')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentRole === 'staff'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Maintenance (Carlos)
            </button>
          </div>

          {/* Emergency Hotline & Reset */}
          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Campus Safety: (555) 911-0000</span>
            </div>
            <button
              onClick={resetToSeedData}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              title="Reset prototype to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

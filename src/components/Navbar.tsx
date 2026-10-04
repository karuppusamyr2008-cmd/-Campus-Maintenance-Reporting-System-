import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  AlertOctagon,
  BarChart3,
  Bell,
  CheckCircle,
  FilePlus,
  HelpCircle,
  Layers,
  LogOut,
  MapPin,
  Menu,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { DemoTourModal } from './DemoTourModal';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    activeTab,
    setActiveTab,
    setCurrentRole,
    unreadNotificationCount,
    complaints,
    staffList,
    resetToSeedData,
    isChatOpen,
    setIsChatOpen,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const emergencyCount = complaints.filter(
    (c) => c.priority === 'Emergency' && c.status !== 'Resolved'
  ).length;

  const navItems = [
    { id: 'report', label: 'Report Issue', icon: FilePlus },
    { id: 'track', label: 'Track Issue', icon: Search },
    { id: 'student', label: 'My Reports', icon: Layers },
    { id: 'admin', label: 'Admin Ops', icon: Shield },
    { id: 'staff', label: 'Staff Crew', icon: Wrench },
    { id: 'map', label: 'Campus Map', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleMobileNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleMobileRoleSwitch = (role: Role, staffId?: string) => {
    setCurrentRole(role, staffId);
    setIsMobileMenuOpen(false);
    // Switch to corresponding role view
    if (role === 'admin') setActiveTab('admin');
    else if (role === 'staff') setActiveTab('staff');
    else setActiveTab('student');
  };

  return (
    <>
      {/* Top persistent guided flow helper banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 sm:px-4 border-b border-slate-800 flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            DEMO
          </span>
          <span className="hidden sm:inline text-slate-400">
            1. Report (Student) → 2. Assign (Admin) → 3. Resolve (Staff) → 4. Track Live
          </span>
          <span className="sm:hidden text-slate-400 text-[11px]">
            Role: <strong className="text-white capitalize">{currentRole}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {emergencyCount > 0 && (
            <button
              onClick={() => setActiveTab('admin')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded cursor-pointer animate-pulse hover:bg-red-900/60 border border-red-800"
            >
              <AlertOctagon className="w-3 h-3" />
              <span>{emergencyCount} Emergency</span>
            </button>
          )}
          <button
            onClick={() => setIsTourOpen(true)}
            className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Demo Tour</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
              onClick={() => setActiveTab('report')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                    Civic<span className="text-blue-600">Fix</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    Campus
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Issue Reporting & Resolution Hub
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Role Persona Switcher (Desktop dropdown) */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/80 transition-all text-left min-h-[44px]"
                  title="Switch Persona Role"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium capitalize">
                      {currentRole}
                    </p>
                  </div>
                  <Users className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {isRoleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Switch Persona Role
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Test different user perspectives in 1 click
                      </p>
                    </div>

                    {/* Student */}
                    <button
                      onClick={() => {
                        setCurrentRole('student');
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${
                        currentRole === 'student'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-xs text-blue-700 dark:text-blue-300">
                        ST
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">
                          Alex Johnson (Student)
                        </p>
                        <p className="text-[11px] text-slate-500">Report issues, track dorm tickets</p>
                      </div>
                      {currentRole === 'student' && <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />}
                    </button>

                    {/* Admin */}
                    <button
                      onClick={() => {
                        setCurrentRole('admin');
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${
                        currentRole === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-bold text-xs text-purple-700 dark:text-purple-300">
                        AD
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">
                          Marcus Vance (Facilities Admin)
                        </p>
                        <p className="text-[11px] text-slate-500">Prioritize, assign staff, view stats</p>
                      </div>
                      {currentRole === 'admin' && <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />}
                    </button>

                    {/* Maintenance Staff Options */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        Maintenance Crew
                      </p>
                      {staffList.slice(0, 2).map((staff) => (
                        <button
                          key={staff.id}
                          onClick={() => {
                            setCurrentRole('staff', staff.id);
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${
                            currentRole === 'staff' && currentUser.id === staff.id
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center font-bold text-xs text-amber-700 dark:text-amber-300">
                            MF
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-white">
                              {staff.name}
                            </p>
                            <p className="text-[11px] text-slate-500">{staff.specialty}</p>
                          </div>
                          {currentRole === 'staff' && currentUser.id === staff.id && (
                            <CheckCircle className="w-4 h-4 ml-auto text-amber-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Copilot Button */}
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="min-h-[44px] flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-xs hover:shadow-md hover:brightness-110 transition-all cursor-pointer"
                title="Ask CivicFix AI Copilot (Powered by Gemini & Google Maps)"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>

              {/* Notification Bell with 44px touch target */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Activity Notifications"
                aria-label="Activity Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger menu button with 44px min touch target */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide-out Mobile Navigation Menu (Drawer) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-out drawer panel */}
            <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 z-50 animate-in slide-in-from-left duration-300">
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                      Civic<span className="text-blue-600">Fix</span>
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Campus Operations
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close mobile menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Card in Drawer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {currentUser.studentId || currentUser.department || currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Role Switcher in Mobile Drawer */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Switch Persona Role
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleMobileRoleSwitch('student')}
                      className={`min-h-[44px] px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        currentRole === 'student'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      onClick={() => handleMobileRoleSwitch('admin')}
                      className={`min-h-[44px] px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        currentRole === 'admin'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => handleMobileRoleSwitch('staff', 'staff_carlos')}
                      className={`min-h-[44px] px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        currentRole === 'staff'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Staff
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Items - Exact items required: Dashboard, Report Issue, My Reports, Track Issue, Notifications, Profile, Logout */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {/* 1. Dashboard */}
                <button
                  onClick={() => {
                    const target = currentRole === 'admin' ? 'admin' : currentRole === 'staff' ? 'staff' : 'student';
                    handleMobileNavClick(target);
                  }}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    (currentRole === 'admin' && activeTab === 'admin') ||
                    (currentRole === 'staff' && activeTab === 'staff') ||
                    (currentRole === 'student' && activeTab === 'student')
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Dashboard ({currentRole.toUpperCase()})</span>
                </button>

                {/* 2. Report Issue */}
                <button
                  onClick={() => handleMobileNavClick('report')}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'report'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FilePlus className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>Report Issue</span>
                </button>

                {/* 3. My Reports */}
                <button
                  onClick={() => handleMobileNavClick('student')}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'student'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>My Reports</span>
                </button>

                {/* 4. Track Issue */}
                <button
                  onClick={() => handleMobileNavClick('track')}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'track'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>Track Issue</span>
                </button>

                {/* 5. Notifications */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsNotifOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400 shrink-0" />
                    <span>Notifications</span>
                  </div>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Additional views: Campus Map & Analytics */}
                <button
                  onClick={() => handleMobileNavClick('map')}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'map'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>Campus Map</span>
                </button>

                <button
                  onClick={() => handleMobileNavClick('analytics')}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>Analytics</span>
                </button>

                {/* AI Copilot */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsChatOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                >
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>AI Copilot & Maps</span>
                </button>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-1">
                  {/* 6. Profile */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-5 h-5 text-slate-400 shrink-0" />
                    <span>Profile & Settings</span>
                  </button>

                  {/* 7. Logout / Reset Demo */}
                  <button
                    onClick={() => {
                      resetToSeedData();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-red-500 shrink-0" />
                    <span>Reset / Logout Session</span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                <p className="text-[11px] text-slate-400">CivicFix Mobile Ops • v1.0.0</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Hackathon Demo Guide Modal */}
      <DemoTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">User Profile</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center space-y-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-blue-500/20"
              />
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">{currentUser.name}</h4>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                Role: {currentUser.role.toUpperCase()}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <p><strong>Campus ID:</strong> {currentUser.studentId || currentUser.department || 'N/A'}</p>
              <p><strong>Department:</strong> {currentUser.department || 'Undergraduate Resident'}</p>
              <p><strong>Status:</strong> Active Resident</p>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full min-h-[44px] rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

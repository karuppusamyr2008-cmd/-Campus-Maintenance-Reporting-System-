import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CAMPUS_BUILDINGS,
  DEMO_USERS,
  INITIAL_COMPLAINTS,
  STAFF_MEMBERS,
} from '../data/seedData';
import {
  Complaint,
  IssuePriority,
  IssueStatus,
  NotificationItem,
  ResolutionInfo,
  Role,
  StaffMember,
  TimelineEvent,
  UserProfile,
} from '../types';

interface AppContextType {
  complaints: Complaint[];
  currentRole: Role;
  currentUser: UserProfile;
  activeTab: string;
  selectedTrackId: string | null;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  staffList: StaffMember[];
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  
  // Actions
  setCurrentRole: (role: Role, staffId?: string) => void;
  setActiveTab: (tab: string, trackId?: string) => void;
  createComplaint: (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    location: string;
    building: string;
    room: string;
    photoUrl?: string;
    priority: IssuePriority;
  }) => string;
  updatePriority: (complaintId: string, priority: IssuePriority) => void;
  assignStaffToComplaint: (complaintId: string, staff: StaffMember) => void;
  updateStatus: (complaintId: string, status: IssueStatus, note?: string) => void;
  staffStartWork: (complaintId: string) => void;
  addProgressNote: (complaintId: string, text: string) => void;
  resolveComplaint: (
    complaintId: string,
    notes: string,
    photoUrl?: string
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToSeedData: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const STORAGE_KEY_COMPLAINTS = 'civicfix_complaints_v2';
const STORAGE_KEY_NOTIFS = 'civicfix_notifications_v2';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial complaints from localStorage or seed
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_COMPLAINTS;
  });

  const [currentRole, setRoleState] = useState<Role>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.student);
  const [activeTab, setActiveTabState] = useState<string>('report');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'notif_init_1',
        title: 'Welcome to CivicFix',
        message: 'Campus maintenance tracking portal is live for Fall semester.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
      },
      {
        id: 'notif_init_2',
        title: 'Emergency Priority Logged',
        message: 'High-pressure pipe burst in Edison Science Center assigned to Priya Patel.',
        timestamp: '2026-10-04T05:42:00Z',
        read: false,
        complaintId: 'CFX-2026-0101',
        type: 'emergency',
      },
    ];
  });

  // Sync complaints to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    } catch (e) {
      console.error('Failed to save complaints to localStorage', e);
    }
  }, [complaints]);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const addNotification = (
    title: string,
    message: string,
    type: 'info' | 'assignment' | 'status' | 'emergency',
    complaintId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      complaintId,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const setCurrentRole = (role: Role, staffId?: string) => {
    setRoleState(role);
    if (role === 'staff') {
      const selectedStaff = STAFF_MEMBERS.find((s) => s.id === staffId) || STAFF_MEMBERS[0];
      setCurrentUser({
        id: selectedStaff.id,
        name: selectedStaff.name,
        email: selectedStaff.email,
        role: 'staff',
        department: selectedStaff.specialty,
        avatar: selectedStaff.avatar,
      });
      setActiveTabState('staff');
    } else if (role === 'admin') {
      setCurrentUser(DEMO_USERS.admin);
      setActiveTabState('admin');
    } else {
      setCurrentUser(DEMO_USERS.student);
      setActiveTabState('student');
    }
    showToast(`Switched perspective to ${role.toUpperCase()}`, 'info');
  };

  const setActiveTab = (tab: string, trackId?: string) => {
    setActiveTabState(tab);
    if (trackId !== undefined) {
      setSelectedTrackId(trackId);
    }
  };

  // Helper to calculate map coordinates based on building
  const getCoordinatesForBuilding = (bldgName: string) => {
    const found = CAMPUS_BUILDINGS.find((b) => b.name === bldgName);
    if (found) {
      return {
        x: found.coords.x + found.coords.width / 2 + (Math.random() * 4 - 2),
        y: found.coords.y + found.coords.height / 2 + (Math.random() * 4 - 2),
      };
    }
    return { x: 50 + (Math.random() * 20 - 10), y: 50 + (Math.random() * 20 - 10) };
  };

  // Priority 2 & 3: Create complaint
  const createComplaint = (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    location: string;
    building: string;
    room: string;
    photoUrl?: string;
    priority: IssuePriority;
  }): string => {
    // Generate sequential ID format CFX-2026-XXXX
    const nextSeq = 100 + complaints.length + 1;
    const newId = `CFX-2026-0${nextSeq}`;
    const now = new Date().toISOString();

    const initialTimeline: TimelineEvent[] = [
      {
        id: 'tl_' + Date.now(),
        title: 'Complaint Submitted',
        description: `Issue logged with ${data.priority} priority by ${currentUser.name} (${currentUser.studentId || currentUser.role}).`,
        timestamp: now,
        actor: currentUser.name,
        actorRole: currentUser.role,
        type: 'created',
      },
    ];

    const newComplaint: Complaint = {
      id: newId,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      building: data.building,
      room: data.room,
      photoUrl: data.photoUrl,
      priority: data.priority,
      status: 'Pending',
      reporter: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        studentId: currentUser.studentId || 'STU-8821',
      },
      assignedStaff: null,
      createdAt: now,
      updatedAt: now,
      progressNotes: [],
      timeline: initialTimeline,
      mapCoords: getCoordinatesForBuilding(data.building),
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Dispatch notification
    addNotification(
      `New ${data.priority} Issue Reported`,
      `[${newId}] ${data.title} reported at ${data.building} (${data.room}).`,
      data.priority === 'Emergency' ? 'emergency' : 'info',
      newId
    );

    showToast(`Issue ${newId} submitted successfully!`, 'success');
    return newId;
  };

  // Priority 5: Admin changes priority
  const updatePriority = (complaintId: string, priority: IssuePriority) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const oldPriority = c.priority;
          const newEvent: TimelineEvent = {
            id: 'tl_' + Date.now(),
            title: 'Priority Changed',
            description: `Priority updated from ${oldPriority} to ${priority} by ${currentUser.name}.`,
            timestamp: now,
            actor: currentUser.name,
            actorRole: currentUser.role,
            type: 'priority_change',
          };
          return {
            ...c,
            priority,
            updatedAt: now,
            timeline: [...c.timeline, newEvent],
          };
        }
        return c;
      })
    );

    addNotification(
      'Priority Updated',
      `[${complaintId}] Priority changed to ${priority} by Admin.`,
      priority === 'Emergency' ? 'emergency' : 'info',
      complaintId
    );
    showToast(`Updated priority of ${complaintId} to ${priority}`);
  };

  // Priority 5: Admin assigns staff
  const assignStaffToComplaint = (complaintId: string, staff: StaffMember) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const newEvent: TimelineEvent = {
            id: 'tl_' + Date.now(),
            title: `Assigned to ${staff.name}`,
            description: `Assigned to ${staff.name} (${staff.specialty}) by ${currentUser.name}.`,
            timestamp: now,
            actor: currentUser.name,
            actorRole: currentUser.role,
            type: 'assigned',
          };
          return {
            ...c,
            assignedStaff: staff,
            updatedAt: now,
            timeline: [...c.timeline, newEvent],
          };
        }
        return c;
      })
    );

    addNotification(
      'Work Order Assigned',
      `[${complaintId}] Assigned to ${staff.name} (${staff.specialty}).`,
      'assignment',
      complaintId
    );
    showToast(`Assigned ${staff.name} to ${complaintId}`);
  };

  // Admin or general status update
  const updateStatus = (complaintId: string, status: IssueStatus, note?: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const newEvents: TimelineEvent[] = [
            ...c.timeline,
            {
              id: 'tl_' + Date.now(),
              title: `Status Changed to ${status}`,
              description: note || `Status updated to ${status} by ${currentUser.name}.`,
              timestamp: now,
              actor: currentUser.name,
              actorRole: currentUser.role,
              type: status === 'Resolved' ? 'resolved' : 'started',
            },
          ];

          return {
            ...c,
            status,
            updatedAt: now,
            resolvedAt: status === 'Resolved' ? now : c.resolvedAt,
            timeline: newEvents,
          };
        }
        return c;
      })
    );

    addNotification(
      `Status: ${status}`,
      `[${complaintId}] Status updated to ${status}.`,
      'status',
      complaintId
    );
    showToast(`Issue ${complaintId} status changed to ${status}`);
  };

  // Priority 6: Staff starts work
  const staffStartWork = (complaintId: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const newEvent: TimelineEvent = {
            id: 'tl_' + Date.now(),
            title: 'Maintenance Work In Progress',
            description: `${currentUser.name} arrived on site and commenced maintenance work.`,
            timestamp: now,
            actor: currentUser.name,
            actorRole: 'Staff',
            type: 'started',
          };
          return {
            ...c,
            status: 'In Progress',
            updatedAt: now,
            timeline: [...c.timeline, newEvent],
          };
        }
        return c;
      })
    );

    addNotification(
      'Work Commenced',
      `[${complaintId}] Technician ${currentUser.name} has started work.`,
      'status',
      complaintId
    );
    showToast(`Started work on ${complaintId}! Status is now In Progress.`);
  };

  // Priority 6: Add progress note
  const addProgressNote = (complaintId: string, text: string) => {
    const now = new Date().toISOString();
    const newNote = {
      id: 'note_' + Date.now(),
      author: currentUser.name,
      role: currentUser.department || currentUser.role,
      text,
      timestamp: now,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const newEvent: TimelineEvent = {
            id: 'tl_' + Date.now(),
            title: 'Progress Note Added',
            description: `"${text}"`,
            timestamp: now,
            actor: currentUser.name,
            actorRole: currentUser.role,
            type: 'note',
          };
          return {
            ...c,
            updatedAt: now,
            progressNotes: [...c.progressNotes, newNote],
            timeline: [...c.timeline, newEvent],
          };
        }
        return c;
      })
    );

    addNotification(
      'New Progress Note',
      `[${complaintId}] ${currentUser.name}: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
      'info',
      complaintId
    );
    showToast('Progress note logged successfully.');
  };

  // Priority 6: Staff resolves complaint
  const resolveComplaint = (complaintId: string, notes: string, photoUrl?: string) => {
    const now = new Date().toISOString();
    const resolution: ResolutionInfo = {
      completedBy: `${currentUser.name} (${currentUser.department || 'Maintenance Staff'})`,
      completionDate: now,
      completionNotes: notes,
      completionPhotoUrl: photoUrl,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const newEvent: TimelineEvent = {
            id: 'tl_' + Date.now(),
            title: 'Issue Resolved & Verified',
            description: notes,
            timestamp: now,
            actor: currentUser.name,
            actorRole: 'Staff',
            type: 'resolved',
          };
          return {
            ...c,
            status: 'Resolved',
            updatedAt: now,
            resolvedAt: now,
            resolutionInfo: resolution,
            timeline: [...c.timeline, newEvent],
          };
        }
        return c;
      })
    );

    addNotification(
      'Issue Resolved',
      `[${complaintId}] Marked as Resolved by ${currentUser.name}.`,
      'status',
      complaintId
    );
    showToast(`Issue ${complaintId} marked as Resolved!`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToSeedData = () => {
    localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    setComplaints(INITIAL_COMPLAINTS);
    setNotifications([
      {
        id: 'notif_fresh_1',
        title: 'Demo Environment Reset',
        message: 'Seeded complaints and notifications have been restored.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
      },
    ]);
    showToast('Demo data reset to initial prototype state.', 'info');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        complaints,
        currentRole,
        currentUser,
        activeTab,
        selectedTrackId,
        notifications,
        unreadNotificationCount,
        toast,
        staffList: STAFF_MEMBERS,
        isChatOpen,
        setIsChatOpen,
        setCurrentRole,
        setActiveTab,
        createComplaint,
        updatePriority,
        assignStaffToComplaint,
        updateStatus,
        staffStartWork,
        addProgressNote,
        resolveComplaint,
        markNotificationRead,
        markAllNotificationsRead,
        resetToSeedData,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

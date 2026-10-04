export type Role = 'student' | 'admin' | 'staff';

export type IssueCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC & Climate'
  | 'Furniture & Carpentry'
  | 'Cleanliness & Sanitation'
  | 'Network & Wi-Fi'
  | 'Safety & Security'
  | 'Civil & Structural'
  | 'Other';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  type: 'created' | 'assigned' | 'started' | 'note' | 'priority_change' | 'resolved';
}

export interface ProgressNote {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface ResolutionInfo {
  completedBy: string;
  completionDate: string;
  completionNotes: string;
  completionPhotoUrl?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  avatar: string;
  assignedCount?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  department?: string;
  avatar: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string; // Campus zone (e.g., North Campus, Quad, Science Park)
  building: string;
  room: string;
  photoUrl?: string;
  priority: IssuePriority;
  status: IssueStatus;
  reporter: {
    id: string;
    name: string;
    email: string;
    studentId?: string;
  };
  assignedStaff?: StaffMember | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  progressNotes: ProgressNote[];
  timeline: TimelineEvent[];
  resolutionInfo?: ResolutionInfo;
  mapCoords: {
    x: number; // percentage 0-100 on campus map
    y: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  complaintId?: string;
  type: 'info' | 'assignment' | 'status' | 'emergency';
}

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  zone: string;
  description: string;
  coords: { x: number; y: number; width: number; height: number };
}

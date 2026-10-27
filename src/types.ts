export type CanonicalRole =
  | 'STEM_FACILITATOR'
  | 'OUTREACH_COORDINATOR'
  | 'VOLUNTEER_ASSISTANT'
  | 'EQUIPMENT_CUSTODIAN'
  | 'SCHOOL_MANAGEMENT'
  | 'SYSTEM_ADMIN';

export type UserRole =
  | 'STEM Facilitator / Teacher'
  | 'Outreach Coordinator'
  | 'Volunteer Assistant'
  | 'Equipment Custodian'
  | 'School Management'
  | 'System Administrator'
  | 'Teacher'
  | 'Custodian'
  | 'Manager'
  | 'Administrator';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  canonicalRole: CanonicalRole;
  stationCode: string;
  status: 'active' | 'deactivated';
  passwordHash?: string;
  lastActive: string;
  createdAt: string;
  assignedPlanIds?: string[];
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'user_created'
    | 'role_assigned'
    | 'account_deactivated'
    | 'account_activated'
    | 'password_reset'
    | 'login_failed'
    | 'login_success'
    | 'plan_created'
    | 'plan_edited'
    | 'unauthorized_attempt';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  stationCode: string;
}

export type AppTheme = 'light' | 'dark' | 'sunlight';

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'uploading' | 'conflict' | 'draft' | 'offline' | 'paused';

export interface PlanReview {
  id: string;
  planId: string;
  reviewerRole: UserRole;
  ageAppropriate: boolean;
  inclusivityChecked: boolean;
  timePractical: boolean;
  safetyReviewed: boolean;
  status: 'approved' | 'needs-refinement' | 'pending';
  comments?: string;
  reviewedAt: string;
}

export interface OutreachParticipationData {
  region: string;
  totalOutreachSessions: number;
  totalLearnersEstimated: number;
  gradeDistribution: {
    grade4To6: number;
    grade7To9: number;
  };
  genderBalance: {
    girlsEstimated: number;
    boysEstimated: number;
  };
  apparatusKitsDeployed: number;
  privacyGuarantee: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  availableCount: number;
  unit?: string;
  status: 'available' | 'low' | 'out';
  statusText: string;
}

export interface Activity {
  id: string;
  title: string;
  durationMinutes: number;
  level: string;
  topic: string;
  description: string;
  materialsSummary: string;
  kitRequired?: string;
  isOfflineReady: boolean;
  safetyAlert: string;
  inclusionPrompt: string;
  materials: MaterialItem[];
  tags: string[];
}

export interface PlanStep {
  id: string;
  stepNumber: number;
  title: string;
  durationMinutes: number;
  materialsText: string;
  safetyAlert?: string;
  inclusionPrompt?: string;
}

export interface SessionPlan {
  id: string;
  title: string;
  dateString: string;
  durationMinutes: number;
  groupAllocation: string;
  groupSizeCount?: number;
  startTime?: string;
  stationLocation: string;
  status: 'synced' | 'uploading' | 'pending' | 'conflict' | 'draft';
  uploadProgress?: number;
  activityId: string;
  templateUsed?: string;
  completedStepIds?: string[];
  steps: PlanStep[];
  review?: PlanReview;
  // Ownership & Sharing fields for strict RBAC
  ownerId: string;
  ownerName: string;
  ownerRole: UserRole;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  isSharedWithCoordinator?: boolean;
  isSharedWithManagement?: boolean;
}

export interface KitItem {
  id: string;
  boxNumber: string;
  name: string;
  location: string;
  status: 'available' | 'in-use' | 'low-stock' | 'scheduled';
  availableUnits: number;
  totalUnits: number;
  nextScheduled: string;
  category: string;
  contents?: string[];
  note?: string;
}

export interface KitRequest {
  id: string;
  kitId: string;
  boxNumber: string;
  kitName: string;
  facilitator: string;
  facilitatorRole: UserRole;
  planTitle: string;
  dateNeeded: string;
  returnDue: string;
  status: 'requested' | 'checked-out' | 'overdue' | 'returned';
}

export interface PlanFilter {
  topic: string;
  grade: string;
  duration: string;
  materials: string[];
}

export interface TemplateDefinition {
  label: string;
  defaultDuration: number;
  steps: PlanStep[];
}

export interface RemotePlanEdit {
  title: string;
  durationMinutes: number;
  editedOn: string;
  editedAt: string;
}


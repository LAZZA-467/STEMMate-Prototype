/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * STEMMate Role-Based Access Control (RBAC) & Security Architecture
 * Offline-First Permission Engine with Strict Data Minimisation
 */

import type { CanonicalRole, UserRole } from '../types';

export type { CanonicalRole, UserRole };

/**
 * Standard Granular Permission Identifiers
 */
export type StandardPermission =
  | 'activities.view'
  | 'activities.save_offline'
  | 'sessions.create'
  | 'sessions.view_own'
  | 'sessions.edit_own'
  | 'sessions.view_assigned'
  | 'sessions.review'
  | 'sessions.sync'
  | 'participation.view_aggregate'
  | 'equipment.view'
  | 'equipment.issue'
  | 'equipment.return'
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.deactivate'
  | 'roles.assign'
  | 'security.audit.view';

/**
 * Legacy Shorthand Permission Identifiers (maintained for backwards compatibility)
 */
export type LegacyPermission =
  | 'browse_activities'
  | 'save_activities_offline'
  | 'create_session_plan'
  | 'edit_session_plan'
  | 'sync_plans'
  | 'track_participation_counts'
  | 'view_volunteer_prep'
  | 'manage_kit_custody'
  | 'review_session_plans'
  | 'manage_users';

export type Permission = StandardPermission | LegacyPermission;

/**
 * Mapping of legacy permission aliases to standard dot-notation permissions
 */
export const PERMISSION_ALIASES: Record<LegacyPermission, StandardPermission> = {
  browse_activities: 'activities.view',
  save_activities_offline: 'activities.save_offline',
  create_session_plan: 'sessions.create',
  edit_session_plan: 'sessions.edit_own',
  sync_plans: 'sessions.sync',
  track_participation_counts: 'participation.view_aggregate',
  view_volunteer_prep: 'sessions.view_assigned',
  manage_kit_custody: 'equipment.issue',
  review_session_plans: 'sessions.review',
  manage_users: 'users.update',
};

export interface RoleMetadata {
  id: CanonicalRole;
  title: UserRole;
  shortLabel: string;
  badgeColor: string;
  summary: string;
  canList: string[];
  cannotList: string[];
  allowedPermissions: StandardPermission[];
  explicitDenies: StandardPermission[];
}

/**
 * Complete RBAC Role Permissions Matrix
 * Every permission not explicitly enumerated in allowedPermissions is DENIED by default.
 */
export const ROLES_METADATA: Record<CanonicalRole, RoleMetadata> = {
  STEM_FACILITATOR: {
    id: 'STEM_FACILITATOR',
    title: 'STEM Facilitator / Teacher',
    shortLabel: 'Facilitator',
    badgeColor: 'bg-teal-700 text-white border-teal-800',
    summary: 'Lead field educator delivering practical STEM lessons, creating session plans, and managing student groups.',
    canList: [
      'Browse and filter STEM activities (level, duration, topic, materials)',
      'Save activities offline for field use without network connection',
      'Create and edit their own session plans (timing, steps, safety notes, inclusion prompts)',
      'Synchronise completed plans when station connectivity returns',
      'View equipment availability where relevant to planning',
      'Work on shared mobile tablets with secure draft isolation'
    ],
    cannotList: [
      'Cannot manage user accounts or assign roles',
      'Cannot change system-wide security settings',
      'Cannot edit another facilitator\'s private session plans without explicit permission',
      'Cannot access pupil identities, photographs, profiles, or identifiable learner records'
    ],
    allowedPermissions: [
      'activities.view',
      'activities.save_offline',
      'sessions.create',
      'sessions.view_own',
      'sessions.edit_own',
      'sessions.sync',
      'sessions.view_assigned',
      'equipment.view'
    ],
    explicitDenies: [
      'sessions.review',
      'participation.view_aggregate',
      'equipment.issue',
      'equipment.return',
      'users.view',
      'users.create',
      'users.update',
      'users.deactivate',
      'roles.assign',
      'security.audit.view'
    ]
  },

  OUTREACH_COORDINATOR: {
    id: 'OUTREACH_COORDINATOR',
    title: 'Outreach Coordinator',
    shortLabel: 'Coordinator',
    badgeColor: 'bg-indigo-700 text-white border-indigo-800',
    summary: 'Administrative and operational lead coordinating multi-school outreach sessions, reviewing session plans, and tracking participation counts.',
    canList: [
      'Access the Outreach Coordinator oversight dashboard',
      'Review session plans across stations for consistency and completeness',
      'Track broad aggregate participation counts (grade bands, gender totals, session counts)',
      'Browse curriculum activities and monitor regional session progress',
      'Synchronise outreach session records when online',
      'View equipment availability for scheduling'
    ],
    cannotList: [
      'Cannot collect, store, or view pupil identities, names, profiles, or photographs (STRICTLY ENFORCED)',
      'Cannot view passwords or authentication secrets',
      'Cannot create or modify classroom teaching session plans',
      'Cannot manage user accounts or assign security roles (System Administrator responsibility)',
      'Cannot manage physical equipment custody or issue kit checkouts'
    ],
    allowedPermissions: [
      'activities.view',
      'activities.save_offline',
      'sessions.view_assigned',
      'sessions.review',
      'sessions.sync',
      'participation.view_aggregate',
      'equipment.view'
    ],
    explicitDenies: [
      'sessions.create',
      'sessions.edit_own',
      'equipment.issue',
      'equipment.return',
      'users.create',
      'users.deactivate',
      'roles.assign',
      'security.audit.view'
    ]
  },

  VOLUNTEER_ASSISTANT: {
    id: 'VOLUNTEER_ASSISTANT',
    title: 'Volunteer Assistant',
    shortLabel: 'Volunteer',
    badgeColor: 'bg-amber-600 text-white border-amber-700',
    summary: 'On-site support team member viewing concise setup steps, apparatus checklists, safety warnings, and assisting before learners arrive.',
    canList: [
      'Access dedicated Volunteer Assistant dashboard',
      'View session plans assigned to or shared with them',
      'View clear activity instructions and preparation checklists',
      'Inspect estimated durations, required materials, and safety warnings',
      'Browse curriculum activities in read-only mode for prep instructions',
      'Access assigned session information while offline'
    ],
    cannotList: [
      'Cannot create or edit session plans',
      'Cannot create, delete, or manage user accounts',
      'Cannot assign roles or change permissions',
      'Cannot trigger cloud data synchronization',
      'Cannot access private coordinator reports or system administration',
      'Cannot change equipment records or issue kits',
      'Cannot access pupil identities or identifiable learner data'
    ],
    allowedPermissions: [
      'activities.view',
      'sessions.view_assigned'
    ],
    explicitDenies: [
      'activities.save_offline',
      'sessions.create',
      'sessions.view_own',
      'sessions.edit_own',
      'sessions.review',
      'sessions.sync',
      'participation.view_aggregate',
      'equipment.view',
      'equipment.issue',
      'equipment.return',
      'users.view',
      'users.create',
      'users.update',
      'users.deactivate',
      'roles.assign',
      'security.audit.view'
    ]
  },

  EQUIPMENT_CUSTODIAN: {
    id: 'EQUIPMENT_CUSTODIAN',
    title: 'Equipment Custodian',
    shortLabel: 'Custodian',
    badgeColor: 'bg-cyan-700 text-white border-cyan-800',
    summary: 'Inventory and laboratory custodian managing shared science kits, tracking kit checkouts/returns, and resolving conflicting bookings.',
    canList: [
      'Access dedicated Equipment Custodian dashboard',
      'View shared equipment, kit inventory levels, and location compartments',
      'View kit reservations, intended dates, and responsible facilitator staff codes (e.g. F-12)',
      'Record equipment issue, return, and availability status',
      'Identify and resolve conflicting requests for the same kit',
      'Access relevant equipment information while offline'
    ],
    cannotList: [
      'Cannot manage user roles or permissions',
      'Cannot create or edit unrelated teaching session plans',
      'Cannot view or store pupil identities',
      'Cannot modify unrelated system configuration'
    ],
    allowedPermissions: [
      'activities.view',
      'equipment.view',
      'equipment.issue',
      'equipment.return'
    ],
    explicitDenies: [
      'activities.save_offline',
      'sessions.create',
      'sessions.view_own',
      'sessions.edit_own',
      'sessions.view_assigned',
      'sessions.review',
      'sessions.sync',
      'participation.view_aggregate',
      'users.view',
      'users.create',
      'users.update',
      'users.deactivate',
      'roles.assign',
      'security.audit.view'
    ]
  },

  SCHOOL_MANAGEMENT: {
    id: 'SCHOOL_MANAGEMENT',
    title: 'School Management',
    shortLabel: 'Management',
    badgeColor: 'bg-purple-700 text-white border-purple-800',
    summary: 'Administrative and pedagogical reviewer evaluating shared session plans for syllabus alignment, inclusion prompts, and safety compliance.',
    canList: [
      'Access School Management review dashboard',
      'Read-only access to session plans shared for review',
      'Assess whether plans appear practical, inclusive, and appropriate for learners',
      'Submit quality assessment rubric ratings and safety sign-off',
      'Browse curriculum activities'
    ],
    cannotList: [
      'Cannot create or edit teaching session plans without permission',
      'Cannot change user roles or security settings',
      'Cannot access private administrative data or pupil identities',
      'Cannot manage physical equipment custody or record returns'
    ],
    allowedPermissions: [
      'activities.view',
      'sessions.review'
    ],
    explicitDenies: [
      'activities.save_offline',
      'sessions.create',
      'sessions.view_own',
      'sessions.edit_own',
      'sessions.view_assigned',
      'sessions.sync',
      'participation.view_aggregate',
      'equipment.view',
      'equipment.issue',
      'equipment.return',
      'users.view',
      'users.create',
      'users.update',
      'users.deactivate',
      'roles.assign',
      'security.audit.view'
    ]
  },

  SYSTEM_ADMIN: {
    id: 'SYSTEM_ADMIN',
    title: 'System Administrator',
    shortLabel: 'Admin',
    badgeColor: 'bg-slate-800 text-white border-slate-900',
    summary: 'Technical system administrator managing user accounts, role assignments, activation status, and reviewing security audit events.',
    canList: [
      'Access dedicated System Administrator dashboard',
      'Create and provision new user accounts (including Volunteer Assistants and Coordinators)',
      'Activate, deactivate, and reactivate accounts',
      'Assign and change approved roles',
      'Trigger secure password-reset or temporary recovery PIN issuance',
      'Review security audit events and role transition logs',
      'Browse curriculum activities for administrative verification'
    ],
    cannotList: [
      'Never display passwords in plain text',
      'Never bypass privacy protections for pupil data (no pupil records permitted)',
      'Cannot modify classroom session plans or interfere with lesson execution',
      'Cannot issue or return physical laboratory equipment'
    ],
    allowedPermissions: [
      'activities.view',
      'users.view',
      'users.create',
      'users.update',
      'users.deactivate',
      'roles.assign',
      'security.audit.view'
    ],
    explicitDenies: [
      'activities.save_offline',
      'sessions.create',
      'sessions.view_own',
      'sessions.edit_own',
      'sessions.view_assigned',
      'sessions.review',
      'sessions.sync',
      'participation.view_aggregate',
      'equipment.issue',
      'equipment.return'
    ]
  }
};

/**
 * Converts any role representation (label, uppercase key, shorthand) into CanonicalRole
 */
export function toCanonicalRole(input: string | null | undefined): CanonicalRole {
  if (!input) return 'STEM_FACILITATOR';
  const val = input.trim();

  // Exact match to canonical key
  if (val in ROLES_METADATA) return val as CanonicalRole;

  const lower = val.toLowerCase();
  if (lower.includes('admin') || lower === 'system_admin' || lower === 'administrator') {
    return 'SYSTEM_ADMIN';
  }
  if (lower.includes('coordinator') || lower.includes('outreach') || lower === 'outreach_coordinator') {
    return 'OUTREACH_COORDINATOR';
  }
  if (lower.includes('volunteer') || lower.includes('assistant') || lower === 'volunteer_assistant') {
    return 'VOLUNTEER_ASSISTANT';
  }
  if (lower.includes('custodian') || lower.includes('equipment') || lower === 'equipment_custodian') {
    return 'EQUIPMENT_CUSTODIAN';
  }
  if (lower.includes('management') || lower.includes('manager') || lower.includes('principal') || lower === 'school_management') {
    return 'SCHOOL_MANAGEMENT';
  }
  if (lower.includes('facilitator') || lower.includes('teacher') || lower === 'stem_facilitator') {
    return 'STEM_FACILITATOR';
  }

  return 'STEM_FACILITATOR';
}

/**
 * Normalizes legacy or shorthand role strings into full UserRole display type
 */
export function normalizeUserRole(input: string | null | undefined): UserRole {
  const canonical = toCanonicalRole(input);
  return ROLES_METADATA[canonical].title;
}

/**
 * Resolves any permission key (standard dot-notation or legacy shorthand) to a StandardPermission
 */
export function resolveStandardPermission(permission: Permission | string): StandardPermission | null {
  if (permission in PERMISSION_ALIASES) {
    return PERMISSION_ALIASES[permission as LegacyPermission];
  }
  // Check if it is a standard permission
  const standardValues: StandardPermission[] = [
    'activities.view',
    'activities.save_offline',
    'sessions.create',
    'sessions.view_own',
    'sessions.edit_own',
    'sessions.view_assigned',
    'sessions.review',
    'sessions.sync',
    'participation.view_aggregate',
    'equipment.view',
    'equipment.issue',
    'equipment.return',
    'users.view',
    'users.create',
    'users.update',
    'users.deactivate',
    'roles.assign',
    'security.audit.view'
  ];
  if (standardValues.includes(permission as StandardPermission)) {
    return permission as StandardPermission;
  }
  return null;
}

/**
 * Synchronous, offline-ready permission check.
 * Evaluates local authorization matrix immediately without network roundtrip.
 * Default DENY: Any permission not explicitly in allowedPermissions returns false.
 */
export function hasPermission(role: string, permission: Permission | string): boolean {
  const canonical = toCanonicalRole(role);
  const metadata = ROLES_METADATA[canonical];
  if (!metadata) return false;

  const standardPerm = resolveStandardPermission(permission);
  if (!standardPerm) return false;

  return metadata.allowedPermissions.includes(standardPerm);
}

/**
 * Returns human-readable refusal reason explaining why an action is blocked
 */
export function getDeniedExplanation(role: string, permission: Permission | string): string {
  const canonical = toCanonicalRole(role);
  const metadata = ROLES_METADATA[canonical];
  const standardPerm = resolveStandardPermission(permission) || permission;

  switch (standardPerm) {
    case 'sessions.create':
      return `Session plan creation is restricted to STEM Facilitators. ${metadata.shortLabel} accounts have read or review access.`;
    case 'sessions.edit_own':
      return `Modifying session plans requires ownership and STEM Facilitator privileges.`;
    case 'sessions.sync':
      return `Station data synchronization is reserved for STEM Facilitators and Outreach Coordinators.`;
    case 'equipment.issue':
    case 'equipment.return':
      return `Equipment custody and return check-ins are restricted to Equipment Custodians.`;
    case 'sessions.review':
      return `Plan review and quality sign-off requires Outreach Coordinator or School Management authorization.`;
    case 'participation.view_aggregate':
      return `Outreach metrics and participation analytics are restricted to Outreach Coordinators.`;
    case 'sessions.view_assigned':
      return `Preparation guide is reserved for assigned Volunteer Assistants and Facilitators.`;
    case 'users.create':
    case 'users.update':
    case 'users.deactivate':
    case 'roles.assign':
      return `User account and role administration is restricted to System Administrators.`;
    case 'security.audit.view':
      return `Security audit log inspection requires System Administrator privileges.`;
    default:
      return `Action (${standardPerm}) is not permitted for ${metadata.title}.`;
  }
}

/**
 * Strict Data Minimisation Enforcer:
 * Recursively scrubs all objects to ensure zero pupil identities, names,
 * phone numbers, emails, biometric identifiers, or photographs exist in storage or memory.
 */
const FORBIDDEN_PII_KEYS = [
  'pupilname',
  'pupilid',
  'studentname',
  'studentid',
  'childname',
  'learnername',
  'photo',
  'photograph',
  'profileimage',
  'avatar',
  'face',
  'biometric',
  'pupilemail',
  'learneremail',
  'pupilphone',
  'learnerphone',
  'nationalid',
  'birthdate',
  'dob'
];

export function sanitizeDataMinimisation<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeDataMinimisation(item)) as unknown as T;
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    const isForbidden = FORBIDDEN_PII_KEYS.some(f => lowerKey.includes(f));

    if (isForbidden) {
      console.warn(`[STEMMate Security] Scrubbed forbidden pupil PII key: "${key}" to enforce strict privacy.`);
      continue;
    }

    if (typeof value === 'object') {
      sanitized[key] = sanitizeDataMinimisation(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Clears role-specific draft session state when switching accounts on a shared mobile device.
 * Ensures the next user cannot access unsaved drafts or partial inputs left in the browser.
 */
export function purgeSharedDeviceRoleDrafts(): void {
  try {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('stemmate_plan_draft_') || key.startsWith('stemmate_active_runner_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    console.info('[STEMMate Security] Shared device session drafts purged.');
  } catch (err) {
    console.error('[STEMMate Security] Error purging shared device drafts', err);
  }
}

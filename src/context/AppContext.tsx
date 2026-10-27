import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  SyncStatus,
  Activity,
  SessionPlan,
  KitItem,
  KitRequest,
  PlanFilter,
  RemotePlanEdit,
  AppTheme,
  UserAccount,
  SecurityAuditEvent,
} from '../types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_PLANS,
  INITIAL_INVENTORY,
  INITIAL_KIT_REQUESTS,
  REMOTE_PLAN_EDITS,
  STAFF_CODE,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { safeStorage } from '../data/storage';
import { notifyAction } from '../utils/audioHaptics';
import {
  Permission,
  RoleMetadata,
  ROLES_METADATA,
  hasPermission as checkRolePermission,
  normalizeUserRole,
  toCanonicalRole,
  purgeSharedDeviceRoleDrafts,
  sanitizeDataMinimisation,
  getDeniedExplanation,
} from '../security/permissions';

export interface PlanDraftData {
  title: string;
  template: string;
  groupSize: number;
  date: string;
  startTime: string;
  steps: any[];
  updatedAt: number;
}

export interface RunnerProgressData {
  completedStepIds: string[];
  minutesElapsed: number;
  timerRunning: boolean;
  updatedAt: number;
}

interface AppContextType {
  role: UserRole;
  roleMetadata: RoleMetadata;
  can: (permission: Permission | string) => boolean;
  canEditPlan: (plan: SessionPlan) => boolean;
  currentUser: UserAccount;
  users: UserAccount[];
  auditLogs: SecurityAuditEvent[];
  isOnline: boolean;
  syncState: SyncStatus;
  activeTab: 'home' | 'explore' | 'my-plans' | 'kit' | 'settings';
  activeScreen: string;
  screenHistory: string[];
  selectedActivityId: string;
  runnerPlanId: string;
  previewPlan: SessionPlan | null;
  savedSuccessPlan: SessionPlan | null;
  conflict: { plan: SessionPlan; remote: RemotePlanEdit } | null;
  activities: Activity[];
  plans: SessionPlan[];
  inventory: KitItem[];
  kitRequests: KitRequest[];
  planFilter: PlanFilter;
  selectedPlanActivity: Activity;
  simulateStorageFull: boolean;
  simulateConflict: boolean;
  autoSync: boolean;
  mobileData: boolean;
  toast: { message: string; type: 'sync' | 'offline' | 'success' | 'alert' } | null;
  devicePlatform: 'ios' | 'android' | 'responsive';
  offlineReason: string | null;

  // Accessibility & Theme features
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  liveAnnouncement: string;
  announce: (message: string) => void;

  // Navigation
  go: (screen: string) => void;
  goBack: () => void;
  setTab: (tab: 'home' | 'explore' | 'my-plans' | 'kit' | 'settings') => void;
  setDevicePlatform: (p: 'ios' | 'android' | 'responsive') => void;

  // Actions
  setRole: (role: UserRole) => void;
  loginUser: (email: string, role?: UserRole) => { success: boolean; error?: string };
  createUser: (userData: { name: string; email: string; role: UserRole; stationCode: string }) => { success: boolean; error?: string };
  updateUserRole: (userId: string, newRole: UserRole) => { success: boolean; error?: string };
  toggleUserStatus: (userId: string) => { success: boolean; error?: string };
  resetUserPassword: (userId: string) => { success: boolean; tempPin?: string; error?: string };
  toggleOnline: () => void;
  triggerSync: () => void;
  openActivityDetail: (id: string) => void;
  toggleOfflineActivity: (id: string) => void;
  setPlanFilter: React.Dispatch<React.SetStateAction<PlanFilter>>;
  resetPlanFilter: () => void;
  startPlanCreationForActivity: (act: Activity) => void;
  saveNewPlan: (plan: SessionPlan) => boolean;
  setPreviewPlan: (plan: SessionPlan | null) => void;
  setSavedSuccessPlan: (plan: SessionPlan | null) => void;
  openRunner: (planId: string) => void;
  toggleRunnerStep: (stepId: string) => void;
  setConflict: (conflict: { plan: SessionPlan; remote: RemotePlanEdit } | null) => void;
  resolveConflict: (choice: 'mine' | 'theirs' | 'both') => void;
  requestKit: (kitId: string) => void;
  approveKitRequest: (requestId: string) => void;
  returnKitRequest: (requestId: string) => void;
  cancelKitRequest: (requestId: string) => void;
  updateStock: (kitId: string, delta: number) => void;
  checkOutKitItem: (kitId: string) => void;
  returnKitItem: (kitId: string) => void;
  setSimulateStorageFull: (val: boolean | ((prev: boolean) => boolean)) => void;
  setSimulateConflict: (val: boolean | ((prev: boolean) => boolean)) => void;
  setAutoSync: (val: boolean | ((prev: boolean) => boolean)) => void;
  setMobileData: (val: boolean | ((prev: boolean) => boolean)) => void;
  clearOldAndRetryStorage: () => void;
  showToast: (message: string, type?: 'sync' | 'offline' | 'success' | 'alert') => void;
  resetState: () => void;
  signOut: () => void;

  // Zero-data-loss drafts & runner progress
  saveDraft: (activityId: string, draft: PlanDraftData) => void;
  getDraft: (activityId: string) => PlanDraftData | null;
  clearDraft: (activityId: string) => void;
  saveRunnerProgress: (planId: string, progress: RunnerProgressData) => void;
  getRunnerProgress: (planId: string) => RunnerProgressData | null;
}

const defaultFilter: PlanFilter = {
  topic: 'All Topics',
  grade: 'all',
  duration: 'all',
  materials: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() =>
    safeStorage.getItem('stemmate_users', INITIAL_USERS)
  );

  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>(() =>
    safeStorage.getItem('stemmate_audit_logs', INITIAL_AUDIT_LOGS)
  );

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = safeStorage.getItem<UserAccount | null>('stemmate_current_user', null);
    if (saved) return saved;
    return INITIAL_USERS[0];
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = safeStorage.getItem('stemmate_role', 'STEM Facilitator / Teacher');
    return normalizeUserRole(saved);
  });

  // Theme support: light, dark, or sunlight (maximum contrast)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = safeStorage.getItem<AppTheme | null>('stemmate_theme', null);
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() =>
    safeStorage.getItem('stemmate_sound_enabled', true)
  );

  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() =>
    safeStorage.getItem('stemmate_haptics_enabled', true)
  );

  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const announce = (message: string) => {
    setLiveAnnouncement('');
    // Brief timeout so identical repeat announcements re-trigger screen readers
    setTimeout(() => {
      setLiveAnnouncement(message);
    }, 50);
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    safeStorage.setItem('stemmate_theme', t);
    announce(`Theme switched to ${t} mode`);
    notifyAction('tick', soundEnabled, hapticsEnabled);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    safeStorage.setItem('stemmate_sound_enabled', enabled);
    announce(enabled ? 'Audio feedback enabled' : 'Audio feedback muted');
  };

  const setHapticsEnabled = (enabled: boolean) => {
    setHapticsEnabledState(enabled);
    safeStorage.setItem('stemmate_haptics_enabled', enabled);
    announce(enabled ? 'Haptic vibration enabled' : 'Haptic vibration disabled');
  };

  // Real browser online status detection with fallback
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [syncState, setSyncState] = useState<SyncStatus>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return 'synced';
  });

  const [offlineReason, setOfflineReason] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'my-plans' | 'kit' | 'settings'>('home');
  const [activeScreen, setActiveScreen] = useState<string>('login');
  const [screenHistory, setScreenHistory] = useState<string[]>(['login']);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('act-1');
  const [runnerPlanId, setRunnerPlanId] = useState<string>('plan-1');
  const [previewPlan, setPreviewPlan] = useState<SessionPlan | null>(null);
  const [savedSuccessPlan, setSavedSuccessPlan] = useState<SessionPlan | null>(null);
  const [conflict, setConflict] = useState<{ plan: SessionPlan; remote: RemotePlanEdit } | null>(null);

  // Persistent data state
  const [activities, setActivities] = useState<Activity[]>(() =>
    safeStorage.getItem('stemmate_activities', INITIAL_ACTIVITIES)
  );

  const [plans, setPlans] = useState<SessionPlan[]>(() =>
    safeStorage.getItem('stemmate_plans', INITIAL_PLANS)
  );

  const [inventory, setInventory] = useState<KitItem[]>(() =>
    safeStorage.getItem('stemmate_inventory', INITIAL_INVENTORY)
  );

  const [kitRequests, setKitRequests] = useState<KitRequest[]>(() =>
    safeStorage.getItem('stemmate_kit_requests', INITIAL_KIT_REQUESTS)
  );

  const [planFilter, setPlanFilter] = useState<PlanFilter>(defaultFilter);
  const [selectedPlanActivity, setSelectedPlanActivity] = useState<Activity>(INITIAL_ACTIVITIES[0]);
  const [simulateStorageFull, setSimulateStorageFull] = useState<boolean>(false);
  const [simulateConflict, setSimulateConflict] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [mobileData, setMobileData] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'sync' | 'offline' | 'success' | 'alert' } | null>(null);
  const [devicePlatform, setDevicePlatform] = useState<'ios' | 'android' | 'responsive'>('android');

  // Sync to safeStorage whenever plans, inventory, activities, or kitRequests change
  useEffect(() => {
    safeStorage.setItem('stemmate_plans', plans);
  }, [plans]);

  useEffect(() => {
    safeStorage.setItem('stemmate_activities', activities);
  }, [activities]);

  useEffect(() => {
    safeStorage.setItem('stemmate_inventory', inventory);
  }, [inventory]);

  useEffect(() => {
    safeStorage.setItem('stemmate_kit_requests', kitRequests);
  }, [kitRequests]);

  useEffect(() => {
    safeStorage.setItem('stemmate_role', role);
  }, [role]);

  useEffect(() => {
    safeStorage.setItem('stemmate_users', users);
  }, [users]);

  useEffect(() => {
    safeStorage.setItem('stemmate_audit_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    safeStorage.setItem('stemmate_current_user', currentUser);
  }, [currentUser]);

  // Real browser hardware online/offline event listeners
  useEffect(() => {
    const handleBrowserOnline = () => {
      setIsOnline(true);
      setSyncState('syncing');
      setOfflineReason(null);
      notifyAction('success', soundEnabled, hapticsEnabled);
      announce('Network connection restored. Synchronizing updates to cloud.');
      showToast('Connection restored! Synchronizing field updates...', 'sync');
      setTimeout(() => {
        completeSync();
      }, 1200);
    };

    const handleBrowserOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
      setOfflineReason('Network link dropped');
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Warning: Network connection lost. Working offline. All progress saved locally.');
      showToast('Connection lost! Working offline · All progress saved locally', 'offline');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleBrowserOnline);
      window.addEventListener('offline', handleBrowserOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleBrowserOnline);
        window.removeEventListener('offline', handleBrowserOffline);
      }
    };
  }, [plans, simulateConflict, soundEnabled, hapticsEnabled]);

  const showToast = (message: string, type: 'sync' | 'offline' | 'success' | 'alert' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const go = (screen: string) => {
    if (activeScreen === screen) return;
    setScreenHistory(prev => [...prev, screen]);
    setActiveScreen(screen);
    announce(`Navigated to ${screen}`);
    if (['home', 'explore', 'my-plans', 'kit', 'settings'].includes(screen)) {
      setActiveTab(screen as any);
    }
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setActiveScreen(prevScreen);
      announce(`Returned to ${prevScreen}`);
      if (['home', 'explore', 'my-plans', 'kit', 'settings'].includes(prevScreen)) {
        setActiveTab(prevScreen as any);
      }
    } else {
      go('home');
    }
  };

  const setTab = (tab: 'home' | 'explore' | 'my-plans' | 'kit' | 'settings') => {
    setActiveTab(tab);
    setScreenHistory([tab]);
    setActiveScreen(tab);
    announce(`Switched to tab: ${tab}`);
  };

  const normRole = normalizeUserRole(role);
  const canonicalRole = toCanonicalRole(role);
  const roleMetadata = ROLES_METADATA[canonicalRole];
  const can = (permission: Permission | string): boolean => checkRolePermission(role, permission);

  const canEditPlan = (plan: SessionPlan): boolean => {
    // Only users with 'sessions.edit_own' permission can edit plans
    if (!can('sessions.edit_own')) return false;
    // Ownership check: must match current user's ID or author name, or match facilitator
    if (plan.ownerId && plan.ownerId !== currentUser.id) {
      return false;
    }
    return true;
  };

  const setRole = (newRole: UserRole) => {
    const normalized = normalizeUserRole(newRole);
    // Purge temporary shared-device draft plans to protect educator data on shared devices
    purgeSharedDeviceRoleDrafts();
    setRoleState(normalized);

    // Also sync matching user from directory if available
    const matchedUser = users.find(u => u.role === normalized && u.status === 'active');
    if (matchedUser) {
      setCurrentUser(matchedUser);
    }

    notifyAction('tick', soundEnabled, hapticsEnabled);
    announce(`Active role changed to ${normalized}. Shared device drafts purged.`);
    showToast(`Switched to ${roleMetadata.shortLabel} View · Drafts Isolated`, 'sync');
  };

  const loginUser = (email: string, targetRole?: UserRole): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return {
        success: false,
        error: `No registered account found for "${email}". Check your staff ID or contact your System Administrator.`,
      };
    }

    if (user.status === 'deactivated') {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Login Rejected: Account deactivated by administrator.');
      return {
        success: false,
        error: 'This account has been deactivated by the System Administrator. Access is revoked.',
      };
    }

    // Shared device hygiene: wipe drafts from previous session
    purgeSharedDeviceRoleDrafts();

    setCurrentUser(user);
    setRoleState(user.role);
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce(`Logged in successfully as ${user.name} (${user.role}).`);
    showToast(`Welcome, ${user.name} (${user.role}) ✓`);

    // Record audit event
    const auditEvent: SecurityAuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'login_success',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: `Successful authenticated login at station ${user.stationCode}.`,
      stationCode: user.stationCode,
    };
    setAuditLogs(prev => [auditEvent, ...prev]);

    return { success: true };
  };

  const createUser = (userData: { name: string; email: string; role: UserRole; stationCode: string }): { success: boolean; error?: string } => {
    if (!can('users.create')) {
      return {
        success: false,
        error: 'Access Denied: Only System Administrators have permission to provision accounts.',
      };
    }

    const trimmedEmail = userData.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return {
        success: false,
        error: `An account with email "${userData.email}" already exists.`,
      };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString(36)}`,
      name: userData.name.trim(),
      email: trimmedEmail,
      role: userData.role,
      canonicalRole: toCanonicalRole(userData.role),
      stationCode: userData.stationCode || 'FIELD-STATION-01',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActive: 'Never logged in',
      assignedPlanIds: [],
    };

    setUsers(prev => [newUser, ...prev]);

    const auditEvent: SecurityAuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'user_created',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetUserId: newUser.id,
      targetUserName: newUser.name,
      details: `Provisioned account for ${newUser.name} with role ${newUser.role} at ${newUser.stationCode}.`,
      stationCode: currentUser.stationCode,
    };
    setAuditLogs(prev => [auditEvent, ...prev]);

    notifyAction('success', soundEnabled, hapticsEnabled);
    announce(`Account created for ${newUser.name} as ${newUser.role}.`);
    showToast(`Account created for ${newUser.name} (${newUser.role}) ✓`);

    return { success: true };
  };

  const updateUserRole = (userId: string, newRole: UserRole): { success: boolean; error?: string } => {
    if (!can('roles.assign')) {
      return {
        success: false,
        error: 'Access Denied: System Administrator privileges required to change user roles.',
      };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'User not found in local directory.' };
    }

    const prevRole = targetUser.role;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          canonicalRole: toCanonicalRole(newRole),
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    if (currentUser.id === userId) {
      setRoleState(newRole);
      setCurrentUser(prev => ({
        ...prev,
        role: newRole,
        canonicalRole: toCanonicalRole(newRole),
      }));
    }

    const auditEvent: SecurityAuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'role_assigned',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      details: `Reassigned ${targetUser.name} from "${prevRole}" to "${newRole}".`,
      stationCode: currentUser.stationCode,
    };
    setAuditLogs(prev => [auditEvent, ...prev]);

    notifyAction('success', soundEnabled, hapticsEnabled);
    announce(`User ${targetUser.name} reassigned to ${newRole}.`);
    showToast(`Role updated: ${targetUser.name} is now ${newRole} ✓`);

    return { success: true };
  };

  const toggleUserStatus = (userId: string): { success: boolean; error?: string } => {
    if (!can('users.deactivate')) {
      return {
        success: false,
        error: 'Access Denied: System Administrator privileges required to manage account status.',
      };
    }

    if (userId === currentUser.id) {
      return {
        success: false,
        error: 'Cannot deactivate your own active administrative session.',
      };
    }

    let nextStatus: 'active' | 'deactivated' = 'active';
    let targetName = '';

    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          nextStatus = u.status === 'active' ? 'deactivated' : 'active';
          targetName = u.name;
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );

    const auditEvent: SecurityAuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: nextStatus === 'active' ? 'account_activated' : 'account_deactivated',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetUserId: userId,
      targetUserName: targetName,
      details: `Account ${nextStatus === 'active' ? 'reactivated' : 'deactivated'} for user ${targetName}.`,
      stationCode: currentUser.stationCode,
    };
    setAuditLogs(prev => [auditEvent, ...prev]);

    notifyAction('alert', soundEnabled, hapticsEnabled);
    announce(`Account ${nextStatus} for ${targetName}.`);
    showToast(`User ${targetName} ${nextStatus} ✓`);

    return { success: true };
  };

  const resetUserPassword = (userId: string): { success: boolean; tempPin?: string; error?: string } => {
    if (!can('users.update')) {
      return {
        success: false,
        error: 'Access Denied: System Administrator privileges required to trigger password recovery.',
      };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    const tempPin = Math.floor(100000 + Math.random() * 900000).toString();

    const auditEvent: SecurityAuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'password_reset',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      details: `Generated temporary recovery PIN for ${targetUser.name}.`,
      stationCode: currentUser.stationCode,
    };
    setAuditLogs(prev => [auditEvent, ...prev]);

    notifyAction('success', soundEnabled, hapticsEnabled);
    announce(`Temporary recovery PIN generated for ${targetUser.name}.`);

    return { success: true, tempPin };
  };

  // Toggle connection state (allows manual simulation or field testing)
  const toggleOnline = () => {
    if (isOnline) {
      setIsOnline(false);
      setSyncState('offline');
      setOfflineReason('Offline mode selected');
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Offline mode activated. All progress will be saved safely on device.');
      showToast('Connection lost! Offline mode active · Current progress saved locally', 'offline');
    } else {
      setIsOnline(true);
      setSyncState('syncing');
      setOfflineReason(null);
      notifyAction('syncing', soundEnabled, hapticsEnabled);
      announce('Connecting to school station network.');
      showToast('Connecting to school station network...', 'sync');
      setTimeout(() => {
        completeSync();
      }, 1200);
    }
  };

  const completeSync = () => {
    // Action Guard: Only Facilitator & Coordinator can perform cloud sync
    if (!can('sync_plans')) {
      setSyncState('synced');
      return;
    }

    setSyncState('synced');
    const pending = plans.filter(p => p.status === 'pending' || p.status === 'uploading');
    let conflictsFound = 0;
    let syncedCount = 0;

    const updated = plans.map(p => {
      if (p.status !== 'pending' && p.status !== 'uploading') return p;
      if (simulateConflict && REMOTE_PLAN_EDITS[p.id]) {
        conflictsFound++;
        return { ...p, status: 'conflict' as const, uploadProgress: undefined };
      }
      syncedCount++;
      return { ...p, status: 'synced' as const, uploadProgress: undefined };
    });

    setPlans(updated);
    if (conflictsFound > 0) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce(`Sync finished with conflicts: ${conflictsFound} plans require manual review.`);
      showToast(`${syncedCount} synced · ${conflictsFound} need review`, 'alert');
    } else if (pending.length > 0) {
      notifyAction('success', soundEnabled, hapticsEnabled);
      announce(`Sync successful. ${syncedCount} plans uploaded and synchronized.`);
      showToast(`${syncedCount} plans uploaded and synchronized ✓`, 'sync');
    } else {
      notifyAction('success', soundEnabled, hapticsEnabled);
      announce('Station data is completely synchronized with school cloud.');
      showToast('Station up to date with cloud archive', 'sync');
    }
  };

  const triggerSync = () => {
    // Action Guard: Only Facilitators and Coordinators can trigger station sync
    if (!can('sync_plans')) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce(`Permission Denied: ${roleMetadata.shortLabel}s cannot synchronize station cloud data.`);
      showToast('Access Restricted: Facilitator or Coordinator role required to sync', 'alert');
      return;
    }

    if (!isOnline) {
      setIsOnline(true);
      setOfflineReason(null);
    }
    setSyncState('syncing');
    notifyAction('syncing', soundEnabled, hapticsEnabled);
    announce('Initiating data synchronization.');
    showToast('Pushing field updates to server...', 'sync');
    setTimeout(completeSync, 1200);
  };

  const openActivityDetail = (id: string) => {
    setSelectedActivityId(id);
    go('activity-detail');
  };

  const toggleOfflineActivity = (id: string) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === id) {
          const nextVal = !act.isOfflineReady;
          notifyAction(nextVal ? 'success' : 'alert', soundEnabled, hapticsEnabled);
          announce(nextVal ? `Activity ${act.title} cached for offline use.` : `Activity ${act.title} removed from offline storage.`);
          showToast(nextVal ? `"${act.title}" cached for offline use` : 'Removed from offline storage');
          return { ...act, isOfflineReady: nextVal };
        }
        return act;
      })
    );
  };

  const resetPlanFilter = () => {
    setPlanFilter(defaultFilter);
    announce('Filters reset to show all topics, grades, and materials.');
  };

  const startPlanCreationForActivity = (act: Activity) => {
    // Action Guard: Only STEM Facilitator can create plans
    if (!can('create_session_plan')) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Permission Denied: Session plan creation is restricted to STEM Facilitators.');
      showToast('Access Restricted: Only Facilitators can create session plans', 'alert');
      return;
    }
    setSelectedPlanActivity(act);
    go('plan-form');
  };

  const saveNewPlan = (newPlan: SessionPlan): boolean => {
    // Action Guard: Only STEM Facilitator can save new plans
    if (!can('create_session_plan')) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Permission Denied: Session plan creation is restricted to STEM Facilitators.');
      showToast('Access Restricted: Only Facilitators can save session plans', 'alert');
      return false;
    }

    if (simulateStorageFull) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Alert: Device storage full. Please review purge options.');
      go('storage-error');
      return false;
    }

    // Strict Data Minimisation: Strip any accidental pupil identifiable attributes
    const sanitizedPlan = sanitizeDataMinimisation({
      ...newPlan,
      ownerId: newPlan.ownerId || currentUser.id,
      ownerName: newPlan.ownerName || currentUser.name,
      ownerRole: newPlan.ownerRole || currentUser.role,
    });

    setPlans(prev => [sanitizedPlan, ...prev]);
    clearDraft(newPlan.activityId);
    setSavedSuccessPlan(sanitizedPlan);
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce(`Session plan "${sanitizedPlan.title}" saved safely offline (Data Minimised).`);
    return true;
  };

  const clearOldAndRetryStorage = () => {
    setPlans(prev => prev.filter(p => p.status !== 'synced'));
    setSimulateStorageFull(false);
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce('Synced plans cleared. Storage space recovered.');
    showToast('Cleared synced plans. Space recovered!');
    go('my-plans');
  };

  const openRunner = (planId: string) => {
    setRunnerPlanId(planId);
    setPreviewPlan(null);
    go('plan-runner');
  };

  const toggleRunnerStep = (stepId: string) => {
    setPlans(prev =>
      prev.map(p => {
        if (p.id === runnerPlanId) {
          const completed = p.completedStepIds || [];
          const nextCompleted = completed.includes(stepId)
            ? completed.filter(s => s !== stepId)
            : [...completed, stepId];
          const isNowCompleted = nextCompleted.includes(stepId);
          notifyAction(isNowCompleted ? 'success' : 'tick', soundEnabled, hapticsEnabled);
          announce(isNowCompleted ? 'Step marked as complete' : 'Step marked as incomplete');
          return { ...p, completedStepIds: nextCompleted };
        }
        return p;
      })
    );
  };

  const resolveConflict = (choice: 'mine' | 'theirs' | 'both') => {
    if (!conflict) return;
    const { plan, remote } = conflict;
    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === plan.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      const remotePlan: SessionPlan = {
        ...plan,
        title: remote.title,
        durationMinutes: remote.durationMinutes,
        status: 'synced',
      };
      if (choice === 'mine') {
        copy[idx] = { ...plan, status: 'synced' };
        announce('Kept local version.');
        showToast('Kept your version. Broadcast on next sync.');
      } else if (choice === 'theirs') {
        copy[idx] = remotePlan;
        announce('Adopted remote tablet version.');
        showToast('Adopted other station tablet version.');
      } else {
        copy[idx] = { ...plan, status: 'synced' };
        copy.splice(idx + 1, 0, {
          ...remotePlan,
          id: `${plan.id}-copy-${Date.now()}`,
          title: `${remote.title} (Copy from ${remote.editedOn})`,
        });
        announce('Preserved both versions as distinct copies.');
        showToast('Kept both versions! Copy preserved.');
      }
      return copy;
    });
    setConflict(null);
    notifyAction('success', soundEnabled, hapticsEnabled);
  };

  const requestKit = (kitId: string) => {
    const item = inventory.find(i => i.id === kitId);
    if (!item) return;
    const newReq: KitRequest = {
      id: `req-${Date.now()}`,
      kitId,
      boxNumber: item.boxNumber,
      kitName: item.name,
      facilitator: STAFF_CODE[role] || 'F-12',
      facilitatorRole: role,
      planTitle: 'Session Kit Allocation',
      dateNeeded: 'Mon 19 Oct 2026',
      returnDue: 'Tue 20 Oct 2026',
      status: 'requested',
    };
    setKitRequests(prev => [newReq, ...prev]);
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce(`Kit request submitted for ${item.name}.`);
    showToast(`Requested ${item.name} (${item.boxNumber}) for custody approval`);
  };

  const approveKitRequest = (requestId: string) => {
    setKitRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'checked-out' as const } : r))
    );
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce('Kit request approved and marked checked-out.');
    showToast('Kit request approved and marked checked-out');
  };

  const returnKitRequest = (requestId: string) => {
    setKitRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'returned' as const } : r))
    );
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce('Kit logged as returned.');
    showToast('Kit return recorded into central inventory log');
  };

  const cancelKitRequest = (requestId: string) => {
    setKitRequests(prev => prev.filter(r => r.id !== requestId));
    announce('Kit request cancelled.');
    showToast('Kit request cancelled');
  };

  const updateStock = (kitId: string, delta: number) => {
    if (!can('manage_kit_custody')) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Permission Denied: Equipment custody changes require Equipment Custodian role.');
      showToast('Access Restricted: Equipment Custodian authorization required', 'alert');
      return;
    }
    setInventory(prev =>
      prev.map(item => {
        if (item.id === kitId) {
          const nextVal = Math.max(0, Math.min(item.totalUnits, item.availableUnits + delta));
          notifyAction('tick', soundEnabled, hapticsEnabled);
          return { ...item, availableUnits: nextVal };
        }
        return item;
      })
    );
  };

  const checkOutKitItem = (kitId: string) => {
    if (!can('manage_kit_custody')) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Permission Denied: Only Equipment Custodians can authorize kit checkouts.');
      showToast('Access Restricted: Equipment Custodian authorization required', 'alert');
      return;
    }
    setInventory(prev =>
      prev.map(item =>
        item.id === kitId
          ? {
              ...item,
              status: 'in-use' as const,
              availableUnits: Math.max(0, item.availableUnits - 1),
              nextScheduled: 'Today 14:30 (Room 5)',
            }
          : item
      )
    );
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce('Kit checked out to classroom.');
    showToast('Box checked out to Classroom Room 5');
  };

  const returnKitItem = (kitId: string) => {
    if (!can('manage_kit_custody')) {
      notifyAction('alert', soundEnabled, hapticsEnabled);
      announce('Permission Denied: Only Equipment Custodians can record kit returns.');
      showToast('Access Restricted: Equipment Custodian authorization required', 'alert');
      return;
    }
    setInventory(prev =>
      prev.map(item =>
        item.id === kitId
          ? {
              ...item,
              status: 'available' as const,
              availableUnits: item.totalUnits,
              nextScheduled: '14 Oct',
            }
          : item
      )
    );
    notifyAction('success', soundEnabled, hapticsEnabled);
    announce('Kit returned and confirmed in storage.');
    showToast('Box returned and verified in cupboard');
  };

  // Drafts zero-data-loss persistence
  const saveDraft = (activityId: string, draft: PlanDraftData) => {
    safeStorage.setItem(`stemmate_draft_${activityId}`, draft);
    safeStorage.setItem('stemmate_last_active_draft_id', activityId);
  };

  const getDraft = (activityId: string): PlanDraftData | null => {
    return safeStorage.getItem<PlanDraftData | null>(`stemmate_draft_${activityId}`, null);
  };

  const clearDraft = (activityId: string) => {
    safeStorage.removeItem(`stemmate_draft_${activityId}`);
  };

  // Live runner progress persistence
  const saveRunnerProgress = (planId: string, progress: RunnerProgressData) => {
    safeStorage.setItem(`stemmate_runner_${planId}`, progress);
  };

  const getRunnerProgress = (planId: string): RunnerProgressData | null => {
    return safeStorage.getItem<RunnerProgressData | null>(`stemmate_runner_${planId}`, null);
  };

  const resetState = () => {
    safeStorage.removeItem('stemmate_plans');
    safeStorage.removeItem('stemmate_activities');
    safeStorage.removeItem('stemmate_inventory');
    safeStorage.removeItem('stemmate_kit_requests');
    safeStorage.removeItem('stemmate_users');
    safeStorage.removeItem('stemmate_audit_logs');
    safeStorage.removeItem('stemmate_current_user');
    setRoleState('STEM Facilitator / Teacher');
    setCurrentUser(INITIAL_USERS[0]);
    setUsers(INITIAL_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsOnline(true);
    setSyncState('synced');
    setOfflineReason(null);
    setActivities(INITIAL_ACTIVITIES);
    setPlans(INITIAL_PLANS);
    setInventory(INITIAL_INVENTORY);
    setKitRequests(INITIAL_KIT_REQUESTS);
    setPlanFilter(defaultFilter);
    setSimulateStorageFull(false);
    setSimulateConflict(false);
    setPreviewPlan(null);
    setSavedSuccessPlan(null);
    setConflict(null);
    setActiveScreen('login');
    setScreenHistory(['login']);
    announce('Application prototype reset to initial state.');
    showToast('Prototype state reset to defaults');
  };

  const signOut = () => {
    purgeSharedDeviceRoleDrafts();
    safeStorage.removeItem('stemmate_current_user');
    setRoleState('STEM Facilitator / Teacher');
    setCurrentUser(INITIAL_USERS[0]);
    setActiveScreen('login');
    setScreenHistory(['login']);
    announce('Signed out. Local session drafts cleared.');
    showToast('Signed out. In-progress drafts deleted from this tablet.');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        roleMetadata,
        can,
        canEditPlan,
        currentUser,
        users,
        auditLogs,
        loginUser,
        createUser,
        updateUserRole,
        toggleUserStatus,
        resetUserPassword,
        isOnline,
        syncState,
        activeTab,
        activeScreen,
        screenHistory,
        selectedActivityId,
        runnerPlanId,
        previewPlan,
        savedSuccessPlan,
        conflict,
        activities,
        plans,
        inventory,
        kitRequests,
        planFilter,
        selectedPlanActivity,
        simulateStorageFull,
        simulateConflict,
        autoSync,
        mobileData,
        toast,
        devicePlatform,
        offlineReason,
        theme,
        setTheme,
        soundEnabled,
        setSoundEnabled,
        hapticsEnabled,
        setHapticsEnabled,
        liveAnnouncement,
        announce,
        go,
        goBack,
        setTab,
        setDevicePlatform,
        setRole,
        toggleOnline,
        triggerSync,
        openActivityDetail,
        toggleOfflineActivity,
        setPlanFilter,
        resetPlanFilter,
        startPlanCreationForActivity,
        saveNewPlan,
        setPreviewPlan,
        setSavedSuccessPlan,
        openRunner,
        toggleRunnerStep,
        setConflict,
        resolveConflict,
        requestKit,
        approveKitRequest,
        returnKitRequest,
        cancelKitRequest,
        updateStock,
        checkOutKitItem,
        returnKitItem,
        setSimulateStorageFull,
        setSimulateConflict,
        setAutoSync,
        setMobileData,
        clearOldAndRetryStorage,
        showToast,
        resetState,
        signOut,
        saveDraft,
        getDraft,
        clearDraft,
        saveRunnerProgress,
        getRunnerProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

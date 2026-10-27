import React from 'react';
import {
  Home,
  Compass,
  BookOpen,
  Wrench,
  Settings,
  School,
  RefreshCw,
  CheckCircle2,
  CloudOff,
  ArrowLeft,
  AlertCircle,
  BarChart3,
  CheckSquare,
  ClipboardCheck,
  Shield,
  Lock,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from './TouchButton';

/**
 * TopAppBar: Accessible Header with high-contrast text, >= 48x48px touch targets,
 * active role badge, and programmatic Sync Status with aria-live and explicit color-independent iconography.
 */
export const TopAppBar: React.FC<{
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ title, subtitle, showBack, onBack, rightSlot }) => {
  const { isOnline, syncState, toggleOnline, triggerSync, theme, role, roleMetadata, can } = useApp();

  // Accessible Sync Status Indicator:
  // - Color independent (icons + explicit text + status badges)
  // - Meets WCAG AA (4.5:1) in all themes
  // - Programmatically announced via role="status" and aria-live="polite"
  // - RBAC enforced: Only Facilitators and Coordinators have sync capability.
  const renderAccessibleSyncIndicator = () => {
    // If the active role does not have permission to sync plans:
    if (!can('sync_plans')) {
      return (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center"
        >
          <span className="sr-only">Role: {roleMetadata.shortLabel}. Station cloud sync disabled for this profile.</span>
          <div
            title={`Station cloud sync is restricted to Facilitators & Coordinators.`}
            className={`min-h-[44px] px-2.5 py-1 rounded-xl border flex items-center gap-1.5 select-none font-bold text-[11px] ${
              theme === 'sunlight'
                ? 'bg-white text-black border-black'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" aria-hidden="true" />
            <span className="tracking-tight">Local Cache</span>
          </div>
        </div>
      );
    }

    if (!isOnline || syncState === 'offline') {
      return (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center"
        >
          <span className="sr-only">Network status: Offline Mode. All drafts saved locally.</span>
          <TouchButton
            onPress={toggleOnline}
            aria-label="Offline Mode. Tap to attempt reconnecting to station network."
            debounceMs={400}
            className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl border-2 flex items-center gap-1.5 cursor-pointer font-bold text-xs select-none transition-colors ${
              theme === 'sunlight'
                ? 'bg-black text-white border-black'
                : 'bg-amber-100 border-amber-800 text-amber-950 dark:bg-amber-950 dark:border-amber-400 dark:text-amber-100'
            }`}
          >
            <CloudOff className="w-4 h-4 shrink-0 stroke-[2.4]" aria-hidden="true" />
            <span className="tracking-tight uppercase text-[11px]">Offline</span>
            <span className="sr-only">(tap to reconnect)</span>
          </TouchButton>
        </div>
      );
    }

    if (syncState === 'syncing') {
      return (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center"
        >
          <span className="sr-only">Syncing session data with station cloud...</span>
          <div
            aria-label="Syncing session data with station cloud"
            className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl border-2 flex items-center gap-1.5 font-bold text-xs select-none ${
              theme === 'sunlight'
                ? 'bg-white text-black border-black'
                : 'bg-teal-100 border-teal-800 text-teal-950 dark:bg-teal-950 dark:border-teal-300 dark:text-teal-100'
            }`}
          >
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin stroke-[2.4]" aria-hidden="true" />
            <span className="tracking-tight text-[11px]">Syncing...</span>
          </div>
        </div>
      );
    }

    if (syncState === 'conflict') {
      return (
        <div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          className="flex items-center"
        >
          <span className="sr-only">Sync conflict detected. Attention needed.</span>
          <TouchButton
            onPress={triggerSync}
            aria-label="Sync conflict detected. Tap to review conflict."
            debounceMs={500}
            className="min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl border-2 bg-rose-100 border-rose-800 text-rose-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4 text-rose-700 stroke-[2.4]" aria-hidden="true" />
            <span className="tracking-tight text-[11px]">Conflict</span>
          </TouchButton>
        </div>
      );
    }

    // Default: Synced state
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex items-center"
      >
        <span className="sr-only">Status: Fully synced with station database.</span>
        <TouchButton
          onPress={triggerSync}
          aria-label="Fully synced with station database. Tap to force manual re-sync."
          debounceMs={500}
          className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl border-2 flex items-center gap-1.5 cursor-pointer font-bold text-xs select-none transition-colors ${
            theme === 'sunlight'
              ? 'bg-white text-black border-black'
              : 'bg-emerald-100 border-emerald-800 text-emerald-950 dark:bg-emerald-950 dark:border-emerald-300 dark:text-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.4]" aria-hidden="true" />
          <span className="tracking-tight text-[11px]">Synced ✓</span>
        </TouchButton>
      </div>
    );
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-gray-200 dark:border-slate-800 px-3.5 h-16 flex items-center justify-between shadow-xs shrink-0 select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {showBack ? (
          <TouchButton
            onPress={onBack}
            aria-label="Navigate back to previous screen"
            pressScale="scale-90"
            className="min-h-[48px] min-w-[48px] -ml-1 rounded-xl flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent focus-visible:border-gray-900"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.4]" aria-hidden="true" />
          </TouchButton>
        ) : (
          <div
            className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs shrink-0 border border-teal-800"
            aria-hidden="true"
          >
            <School className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}

        <div className="flex flex-col min-w-0 flex-1 pr-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-[15.5px] font-extrabold text-gray-950 dark:text-white leading-tight truncate tracking-tight">
              {title}
            </h1>
            <span
              className={`shrink-0 text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${roleMetadata.badgeColor}`}
            >
              {roleMetadata.shortLabel}
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 leading-tight truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {rightSlot || renderAccessibleSyncIndicator()}
      </div>
    </header>
  );
};

/**
 * BottomTabBar: Role-Adaptive Accessible Tab Navigation with >= 48x48px touch targets,
 * aria-current="page", screen reader labels, and high contrast active indicators.
 */
export const BottomTabBar: React.FC = () => {
  const { activeScreen, setTab, go, theme, roleMetadata } = useApp();

  // Role-Specific Navigation Tabs Configuration
  const getTabsForRole = () => {
    switch (roleMetadata.id) {
      case 'SYSTEM_ADMIN':
        return [
          { id: 'home', label: 'Home', icon: Home, a11yLabel: 'System Administrator home dashboard' },
          { id: 'admin-users', label: 'Users', icon: Users, a11yLabel: 'User account and access control' },
          { id: 'explore', label: 'Curriculum', icon: Compass, a11yLabel: 'Curriculum library' },
          { id: 'settings', label: 'Settings', icon: Settings, a11yLabel: 'Settings and audit configuration' },
        ];

      case 'OUTREACH_COORDINATOR':
      case 'coordinator' as any:
        return [
          { id: 'home', label: 'Home', icon: Home, a11yLabel: 'Home dashboard' },
          { id: 'outreach', label: 'Outreach', icon: BarChart3, a11yLabel: 'Outreach participation category metrics' },
          { id: 'explore', label: 'Curriculum', icon: Compass, a11yLabel: 'Explore curriculum activities' },
          { id: 'my-plans', label: 'Plans', icon: BookOpen, a11yLabel: 'Outreach session plans overview' },
          { id: 'settings', label: 'Settings', icon: Settings, a11yLabel: 'Settings and RBAC profile' },
        ];

      case 'VOLUNTEER_ASSISTANT':
      case 'volunteer' as any:
        return [
          { id: 'home', label: 'Home', icon: Home, a11yLabel: 'Home dashboard' },
          { id: 'volunteer-prep', label: 'Prep Guide', icon: CheckSquare, a11yLabel: 'Apparatus prep guide for volunteers' },
          { id: 'explore', label: 'Activities', icon: Compass, a11yLabel: 'Browse activity procedures' },
          { id: 'settings', label: 'Settings', icon: Settings, a11yLabel: 'Settings and RBAC profile' },
        ];

      case 'EQUIPMENT_CUSTODIAN':
      case 'custodian' as any:
        return [
          { id: 'home', label: 'Home', icon: Home, a11yLabel: 'Home dashboard' },
          { id: 'kit', label: 'Kit Custody', icon: Wrench, a11yLabel: 'Kit custody, inventory and returns' },
          { id: 'explore', label: 'Apparatus', icon: Compass, a11yLabel: 'Curriculum apparatus reference' },
          { id: 'settings', label: 'Settings', icon: Settings, a11yLabel: 'Settings and RBAC profile' },
        ];

      case 'SCHOOL_MANAGEMENT':
      case 'management' as any:
        return [
          { id: 'home', label: 'Home', icon: Home, a11yLabel: 'Home dashboard' },
          { id: 'plan-review', label: 'Plan Review', icon: ClipboardCheck, a11yLabel: 'Review and sign off session plans' },
          { id: 'my-plans', label: 'Plans', icon: BookOpen, a11yLabel: 'Review active session plans' },
          { id: 'settings', label: 'Settings', icon: Settings, a11yLabel: 'Settings and RBAC profile' },
        ];

      case 'STEM_FACILITATOR':
      case 'facilitator' as any:
      default:
        return [
          { id: 'home', label: 'Home', icon: Home, a11yLabel: 'Home dashboard and activities' },
          { id: 'explore', label: 'Explore', icon: Compass, a11yLabel: 'Explore curriculum library' },
          { id: 'my-plans', label: 'My Plans', icon: BookOpen, a11yLabel: 'My Plans, saved session plans' },
          { id: 'kit', label: 'Kit', icon: Wrench, a11yLabel: 'Kit, science apparatus inventory' },
          { id: 'settings', label: 'Settings', icon: Settings, a11yLabel: 'Settings and accessibility options' },
        ];
    }
  };

  const tabs = getTabsForRole();

  const handleTabPress = (tabId: string) => {
    if (['home', 'explore', 'my-plans', 'kit', 'settings'].includes(tabId)) {
      setTab(tabId as any);
    } else {
      go(tabId);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className={`absolute bottom-0 left-0 right-0 z-40 border-t-2 shadow-lg flex justify-around items-center px-1 py-1.5 pb-safe ${
        theme === 'sunlight'
          ? 'bg-white border-black text-black'
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-gray-200 dark:border-slate-800'
      }`}
    >
      {tabs.map(t => {
        const isActive = activeScreen === t.id;
        const Icon = t.icon;

        return (
          <TouchButton
            key={t.id}
            id={`nav-tab-${t.id}`}
            onPress={() => handleTabPress(t.id)}
            aria-label={`${t.label} tab${isActive ? ', currently selected' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            pressScale="scale-90"
            debounceMs={300}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[54px] rounded-xl px-1.5 py-1 transition-all cursor-pointer relative ${
              isActive
                ? theme === 'sunlight'
                  ? 'bg-black text-white font-black'
                  : 'text-[#0F766E] dark:text-[#2DD4BF] font-extrabold bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            {/* Visual indicator for active tab (color-blind accessibility) */}
            {isActive && (
              <span
                aria-hidden="true"
                className={`absolute -top-1 w-6 h-1 rounded-full ${
                  theme === 'sunlight' ? 'bg-black' : 'bg-[#0F766E] dark:bg-[#2DD4BF]'
                }`}
              />
            )}
            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive ? 'scale-110 stroke-[2.6]' : 'stroke-[2]'
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-[10.5px] mt-0.5 tracking-tight ${
                isActive ? 'font-black' : 'font-semibold'
              }`}
            >
              {t.label}
            </span>
          </TouchButton>
        );
      })}
    </nav>
  );
};


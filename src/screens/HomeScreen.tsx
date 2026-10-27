import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  X,
  Clock,
  CheckCircle2,
  Play,
  Timer,
  CheckSquare,
  Users,
  MapPin,
  Lock,
  BarChart3,
  Wrench,
  ClipboardCheck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FILTER_CHIPS } from '../data/mockData';
import { TouchButton } from '../components/TouchButton';
import { TouchCard } from '../components/TouchCard';
import { UserRole } from '../types';

export const HomeScreen: React.FC = () => {
  const { role, roleMetadata, can, setRole, activities, go, openActivityDetail, openRunner, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const filteredActivities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activities.filter(act => {
      const matchesQ =
        !q ||
        act.title.toLowerCase().includes(q) ||
        act.topic.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.materialsSummary.toLowerCase().includes(q);

      const matchesChips =
        selectedChips.length === 0 ||
        selectedChips.every(chip => {
          if (chip === 'Grade 4-6') return act.level.includes('4-6') || act.level.includes('5-7');
          if (chip === 'Physics') return act.topic.toLowerCase().includes('physic') || act.tags.includes('Physics');
          if (chip === 'Outdoor') return act.tags.includes('Outdoor') || act.description.toLowerCase().includes('outdoor');
          if (chip === 'Under 60 min') return act.durationMinutes <= 60;
          if (chip === 'Low Cost') return act.tags.includes('Low Cost');
          return true;
        });

      return matchesQ && matchesChips;
    });
  }, [activities, searchQuery, selectedChips]);

  // Render role-specific primary CTA based on strict RBAC permissions
  const renderPrimaryAction = () => {
    if (can('create_session_plan')) {
      return (
        <TouchButton
          id="home-create-session-plan-btn"
          onPress={() => go('plan-filter')}
          aria-label="Create new STEM Session Plan"
          loadingText="Opening Session Planner..."
          debounceMs={600}
          className="w-full min-h-[52px] bg-[#0F766E] hover:bg-[#0c625b] dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-extrabold text-[15px] rounded-2xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer select-none border-2 border-teal-900 dark:border-teal-400 active:scale-98 transition-all"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.6]" aria-hidden="true" />
          <span>Create Session Plan</span>
        </TouchButton>
      );
    }

    if (roleMetadata.id === 'coordinator') {
      return (
        <TouchButton
          id="home-outreach-metrics-btn"
          onPress={() => go('outreach')}
          aria-label="Open Outreach Participation Metrics"
          loadingText="Opening Outreach..."
          debounceMs={500}
          className="w-full min-h-[52px] bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-[15px] rounded-2xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer select-none border-2 border-indigo-950 active:scale-98 transition-all"
        >
          <BarChart3 className="w-5 h-5 stroke-[2.6]" aria-hidden="true" />
          <span>Outreach Participation Metrics</span>
        </TouchButton>
      );
    }

    if (roleMetadata.id === 'volunteer') {
      return (
        <TouchButton
          id="home-volunteer-prep-btn"
          onPress={() => go('volunteer-prep')}
          aria-label="Open Volunteer Apparatus Prep Guide"
          loadingText="Opening Prep Guide..."
          debounceMs={500}
          className="w-full min-h-[52px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[15px] rounded-2xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer select-none border-2 border-amber-800 active:scale-98 transition-all"
        >
          <CheckSquare className="w-5 h-5 stroke-[2.6]" aria-hidden="true" />
          <span>Volunteer Apparatus Prep Guide</span>
        </TouchButton>
      );
    }

    if (roleMetadata.id === 'custodian') {
      return (
        <TouchButton
          id="home-custody-btn"
          onPress={() => go('kit')}
          aria-label="Manage Kit Custody & Returns"
          loadingText="Opening Kit Log..."
          debounceMs={500}
          className="w-full min-h-[52px] bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-[15px] rounded-2xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer select-none border-2 border-cyan-900 active:scale-98 transition-all"
        >
          <Wrench className="w-5 h-5 stroke-[2.6]" aria-hidden="true" />
          <span>Manage Kit Custody &amp; Returns</span>
        </TouchButton>
      );
    }

    if (roleMetadata.id === 'management') {
      return (
        <TouchButton
          id="home-management-review-btn"
          onPress={() => go('plan-review')}
          aria-label="Review Session Plans & Quality Sign-Off"
          loadingText="Opening Review..."
          debounceMs={500}
          className="w-full min-h-[52px] bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-[15px] rounded-2xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer select-none border-2 border-purple-950 active:scale-98 transition-all"
        >
          <ClipboardCheck className="w-5 h-5 stroke-[2.6]" aria-hidden="true" />
          <span>Review Plans &amp; Sign-Off</span>
        </TouchButton>
      );
    }

    if (roleMetadata.id === 'SYSTEM_ADMIN' || roleMetadata.id === ('admin' as any) || can('users.view')) {
      return (
        <TouchButton
          id="home-admin-users-btn"
          onPress={() => go('admin-users')}
          aria-label="Manage Users & Access Control"
          loadingText="Opening Users..."
          debounceMs={500}
          className="w-full min-h-[52px] bg-slate-900 hover:bg-black text-white font-extrabold text-[15px] rounded-2xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer select-none border-2 border-slate-950 active:scale-98 transition-all"
        >
          <Shield className="w-5 h-5 text-amber-300 stroke-[2.6]" aria-hidden="true" />
          <span>User &amp; Access Control</span>
        </TouchButton>
      );
    }

    return null;
  };

  const allRoles: UserRole[] = [
    'STEM Facilitator / Teacher',
    'Outreach Coordinator',
    'Volunteer Assistant',
    'Equipment Custodian',
    'School Management',
    'System Administrator',
  ];

  return (
    <div id="screen-home" className="flex-1 px-4 pt-3 pb-24 overflow-y-auto space-y-4 bg-[#F8FAF9]">
      {/* Header Greeting & Shared Device Role Selector */}
      <section className="flex items-center justify-between">
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-[18px] font-extrabold text-gray-950 tracking-tight leading-snug">
              Good day, {roleMetadata.shortLabel}
            </h2>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${roleMetadata.badgeColor}`}
            >
              Active
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-[11.5px] mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Station 04 · Field Lab Unit</span>
          </div>
        </div>

        {/* Quick Shared Device Role Switcher Pill */}
        <TouchButton
          onPress={() => setShowRolePicker(prev => !prev)}
          aria-label="Switch evaluator user role"
          className="shrink-0 min-h-[44px] px-3 py-1 bg-white border-2 border-gray-300 hover:border-gray-500 rounded-xl flex items-center gap-1.5 text-xs font-bold text-gray-800 cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
          <span>Switch Role</span>
        </TouchButton>
      </section>

      {/* Role Picker Drawer/Modal (When opened from header) */}
      {showRolePicker && (
        <section
          role="region"
          aria-label="Role Switcher for Shared Device"
          className="bg-white border-2 border-teal-800 rounded-2xl p-3.5 shadow-md space-y-2 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
            <span className="text-xs font-black uppercase tracking-wider text-teal-900">
              Select Device Profile:
            </span>
            <TouchButton
              onPress={() => setShowRolePicker(false)}
              className="p-1 text-gray-500 hover:text-gray-900"
              aria-label="Close role picker"
            >
              <X className="w-4 h-4" />
            </TouchButton>
          </div>
          <div className="space-y-1.5">
            {allRoles.map(r => {
              const isCur = role === r;
              return (
                <TouchButton
                  key={r}
                  onPress={() => {
                    setRole(r);
                    setShowRolePicker(false);
                  }}
                  className={`w-full min-h-[46px] p-2.5 rounded-xl border text-left flex items-center justify-between text-xs cursor-pointer ${
                    isCur
                      ? 'bg-teal-50 border-teal-800 font-extrabold text-teal-950'
                      : 'bg-gray-50 border-gray-200 text-gray-800 font-semibold hover:bg-gray-100'
                  }`}
                >
                  <span>{r}</span>
                  {isCur && <CheckCircle2 className="w-4 h-4 text-teal-700 stroke-[3]" />}
                </TouchButton>
              );
            })}
          </div>
          <p className="text-[10.5px] text-gray-500 pt-1">
            * Shared device protection: Switching roles safely resets temporary session drafts.
          </p>
        </section>
      )}

      {/* Role-Specific Primary CTA */}
      <section className="pt-1">
        {renderPrimaryAction()}
      </section>

      {/* Accessible Search Input with Screen Reader Label & 48px Touch Target */}
      <section role="search">
        <label htmlFor="home-search-input" className="sr-only">
          Search STEM activities, kits, or science topics
        </label>
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" aria-hidden="true" />
          <input
            id="home-search-input"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search activities, kits, or topics..."
            aria-label="Search activities, kits, or topics"
            className="w-full h-12 pl-11 pr-12 bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-300 dark:border-slate-700 text-[14px] text-gray-950 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0F766E] dark:focus:border-teal-400 shadow-2xs transition-all touch-manipulation font-medium"
          />
          {searchQuery && (
            <TouchButton
              onPress={() => setSearchQuery('')}
              aria-label="Clear search query"
              pressScale="scale-90"
              debounceMs={200}
              className="absolute right-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
            </TouchButton>
          )}
        </div>
      </section>

      {/* Accessible Filter Row with >= 48x48px Touch Targets, Explicit Checkmarks, and aria-checked */}
      <section aria-label="Curriculum Filter Options" className="-mx-4 px-4 overflow-x-auto no-scrollbar py-1">
        <div role="group" aria-label="Filter activities by category" className="flex gap-2 items-center whitespace-nowrap">
          {FILTER_CHIPS.map(chip => {
            const isSelected = selectedChips.includes(chip);
            return (
              <TouchButton
                key={chip}
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Filter by ${chip}. ${isSelected ? 'Selected' : 'Not selected'}`}
                onPress={() => toggleChip(chip)}
                pressScale="scale-95"
                debounceMs={250}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full text-[13px] font-bold min-h-[48px] border-2 transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#0F766E] text-white border-teal-900 shadow-sm dark:bg-teal-700 dark:border-teal-400'
                    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-gray-500'
                }`}
              >
                {/* Visual Checkmark for Color-Blind Independence (WCAG 1.4.1) */}
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-white stroke-[2.8] shrink-0" aria-hidden="true" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 shrink-0 inline-block"
                  />
                )}
                <span>{chip}</span>
              </TouchButton>
            );
          })}
        </div>
      </section>

      {/* Screen Reader Result Count Announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {filteredActivities.length} activities matching current filters
      </div>

      {/* Suggested Activities Feed */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-extrabold text-gray-950 dark:text-white tracking-tight">Suggested Activities</h3>
          <span className="text-[11.5px] font-bold text-[#0F766E] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 px-2.5 py-1 rounded-full">

            {filteredActivities.length} available
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-gray-900">No matching activities</p>
              <p className="text-[12px] text-gray-500 mt-0.5">Try clearing filters or search terms</p>
            </div>
            <TouchButton
              onPress={() => {
                setSearchQuery('');
                setSelectedChips([]);
              }}
              className="px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0c625b]"
            >
              Reset Filters
            </TouchButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredActivities.slice(0, 4).map(act => {
              const firstMat = act.materials[0];
              return (
                <TouchCard
                  key={act.id}
                  onPress={() => openActivityDetail(act.id)}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-2.5 hover:border-[#0F766E]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{act.durationMinutes}m</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{act.level}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-teal-800">{act.topic}</span>
                      </div>
                      <h4 className="text-[15.5px] font-bold text-gray-900 leading-snug">
                        {act.title}
                      </h4>
                    </div>

                    {act.isOfflineReady && (
                      <div
                        className="inline-flex items-center gap-1 bg-emerald-50 text-[#15803D] border border-emerald-200 px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0"
                        title="Offline ready"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Offline</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="bg-[#F8FAF9] rounded-xl p-2.5 border border-gray-200/70 text-[11.5px] text-gray-600">
                    <span className="font-semibold text-gray-800">Materials: </span>
                    <span>{act.materialsSummary}</span>
                    {firstMat && (
                      <div className="flex items-center gap-1 mt-1 text-[#0F766E] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{firstMat.name} ({firstMat.statusText})</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <TouchButton
                      onPress={(e) => {
                        e.stopPropagation();
                        openActivityDetail(act.id);
                      }}
                      className="min-h-[44px] bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:border-[#0F766E] cursor-pointer"
                    >
                      <span>View Blueprint</span>
                    </TouchButton>

                    <TouchButton
                      onPress={(e) => {
                        e.stopPropagation();
                        openActivityDetail(act.id);
                      }}
                      loadingText="Opening..."
                      debounceMs={500}
                      className="min-h-[44px] bg-[#0F766E] hover:bg-[#0c625b] text-white rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch</span>
                    </TouchButton>
                  </div>
                </TouchCard>
              );
            })}
          </div>
        )}
      </section>

      {/* Field Utilities Section with Instant Tactile Feedback */}
      <section className="pt-2">
        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Field Utilities</h3>
        <div className="grid grid-cols-3 gap-2">
          <TouchButton
            onPress={() => openRunner('plan-1')}
            loadingText="Opening..."
            pressScale="scale-95"
            debounceMs={500}
            className="min-h-[68px] bg-white rounded-xl p-2 border border-gray-200 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0F766E] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-1">
              <Timer className="w-4 h-4" />
            </div>
            <span className="text-[11.5px] font-semibold text-gray-800 leading-tight">Field Timer</span>
          </TouchButton>

          <TouchButton
            onPress={() => openActivityDetail('act-1')}
            loadingText="Loading..."
            pressScale="scale-95"
            debounceMs={500}
            className="min-h-[68px] bg-white rounded-xl p-2 border border-gray-200 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0F766E] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-1">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-[11.5px] font-semibold text-gray-800 leading-tight">Kit Checklist</span>
          </TouchButton>

          <TouchButton
            onPress={() => openRunner('plan-1')}
            loadingText="Opening..."
            pressScale="scale-95"
            debounceMs={500}
            className="min-h-[68px] bg-white rounded-xl p-2 border border-gray-200 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0F766E] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-1">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11.5px] font-semibold text-gray-800 leading-tight">Squad Counter</span>
          </TouchButton>
        </div>
      </section>

      {/* Anonymous Data Notice */}
      <footer className="pt-2 pb-4 flex items-center justify-center gap-1.5 text-gray-500 border-t border-gray-200/70">
        <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
        <p className="text-[11px] font-medium text-center">
          No pupil data is collected or stored. All records local.
        </p>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  School,
  Sparkles,
  Layers,
  AlertTriangle,
  Accessibility,
  Download,
  CheckCircle2,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from '../components/TouchButton';

export const ActivityDetailScreen: React.FC = () => {
  const {
    selectedActivityId,
    activities,
    role,
    goBack,
    toggleOfflineActivity,
    startPlanCreationForActivity,
  } = useApp();

  const activity = activities.find(a => a.id === selectedActivityId) || activities[0];
  const canCreate = role === 'Teacher' || role === 'Administrator';
  const [isOfflineSaving, setIsOfflineSaving] = useState(false);

  const handleToggleOffline = () => {
    setIsOfflineSaving(true);
    toggleOfflineActivity(activity.id);
    setTimeout(() => {
      setIsOfflineSaving(false);
    }, 300);
  };

  const renderMaterialBadge = (status: 'available' | 'low' | 'out', text: string) => {
    let style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'low') style = 'bg-amber-50 text-amber-800 border-amber-200';
    if (status === 'out') style = 'bg-rose-50 text-rose-800 border-rose-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style}`}>
        {text}
      </span>
    );
  };

  return (
    <div id="screen-activity-detail" className="flex-1 flex flex-col bg-[#F8FAF9] relative overflow-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-2 flex items-center justify-between min-h-[56px] shadow-xs shrink-0">
        <TouchButton
          onPress={goBack}
          aria-label="Go back"
          pressScale="scale-90"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </TouchButton>

        <div className="flex-1 mx-2 overflow-hidden text-center">
          <h2 className="text-[15px] font-bold text-gray-900 truncate tracking-tight">
            {activity.title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${
              activity.isOfflineReady ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-[11px] font-semibold text-gray-700">
            {activity.isOfflineReady ? 'Offline Ready' : 'Online Only'}
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 px-4 pt-4 pb-44 overflow-y-auto space-y-4">
        {/* Title & Metadata */}
        <section className="space-y-2">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#0F766E] font-bold">
              Investigation Blueprint
            </span>
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight mt-0.5">
              {activity.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-gray-600">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-semibold text-gray-800">{activity.durationMinutes} min</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-2xs">
              <School className="w-3.5 h-3.5 text-gray-500" />
              <span>{activity.level}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E]">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="font-bold">{activity.topic}</span>
            </div>
          </div>

          <p className="text-[13.5px] text-gray-600 leading-relaxed pt-1">
            {activity.description}
          </p>
        </section>

        {/* Materials & Equipment List */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Materials &amp; Kit Inventory</h3>
              <p className="text-[11px] text-gray-500">Real-time local stock status</p>
            </div>
            <Layers className="w-5 h-5 text-gray-400" />
          </div>

          <div className="divide-y divide-gray-100 pt-1">
            {activity.materials.map(m => (
              <div
                key={m.id}
                className="min-h-[48px] py-2 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-[13.5px] font-medium text-gray-900 truncate">{m.name}</span>
                </div>
                {renderMaterialBadge(m.status, m.statusText)}
              </div>
            ))}
          </div>
        </section>

        {/* Safety Alert Precaution */}
        <section className="bg-amber-50 rounded-2xl border border-amber-200 p-4 shadow-2xs space-y-1.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-amber-900">Safety Field Precaution</h4>
              <p className="text-[12px] text-amber-800 leading-snug mt-0.5">
                {activity.safetyAlert}
              </p>
            </div>
          </div>
        </section>

        {/* Inclusion Adaptation Prompts */}
        <section className="bg-blue-50 rounded-2xl border border-blue-200 p-4 shadow-2xs space-y-1.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-blue-100 text-blue-800 shrink-0 mt-0.5">
              <Accessibility className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-blue-900">Inclusion Adaptation Prompt</h4>
              <p className="text-[12px] text-blue-800 leading-snug mt-0.5">
                {activity.inclusionPrompt}
              </p>
            </div>
          </div>
        </section>

        {/* Anonymous Guarantee */}
        <div className="flex items-center justify-center gap-1.5 py-2 text-gray-500">
          <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
          <span className="text-[11px]">No pupil data is collected or stored. Fully offline.</span>
        </div>
      </div>

      {/* Sticky Bottom Actions with Instant Feedback & Debouncing */}
      <footer className="absolute bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg space-y-2">
        <TouchButton
          onPress={handleToggleOffline}
          loading={isOfflineSaving}
          loadingText="Updating offline storage..."
          debounceMs={400}
          className="w-full min-h-[46px] py-2.5 px-4 rounded-xl border border-[#0F766E] text-[#0F766E] hover:bg-teal-50 font-semibold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer"
        >
          {activity.isOfflineReady ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved for Offline Use ✓</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save for Offline Fieldwork</span>
            </>
          )}
        </TouchButton>

        {canCreate && (
          <TouchButton
            onPress={() => startPlanCreationForActivity(activity)}
            loadingText="Opening Planner..."
            debounceMs={600}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0c625b] text-white shadow-sm font-semibold text-[14px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Session Plan</span>
          </TouchButton>
        )}
      </footer>
    </div>
  );
};

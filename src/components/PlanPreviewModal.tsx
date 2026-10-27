import React, { useState } from 'react';
import { X, Play, Share2, Check, AlertTriangle, Accessibility, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from './TouchButton';

export const PlanPreviewModal: React.FC = () => {
  const { previewPlan, setPreviewPlan, openRunner, activities, showToast } = useApp();
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({});

  if (!previewPlan) return null;

  const activity = activities.find(a => a.id === previewPlan.activityId) || activities[0];
  const checklist = activity.materials.slice(0, 5);
  const packedCount = checklist.filter(m => checkedMaterials[m.id]).length;

  const toggleMaterialCheck = (id: string) => {
    setCheckedMaterials(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = () => {
    showToast('Plan ready for offline export & sharing');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-preview-title"
      className="absolute inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={() => setPreviewPlan(null)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Sheet Container */}
      <div className="relative z-10 w-full h-[88%] bg-white rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden border-t border-gray-200 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div
          onClick={() => setPreviewPlan(null)}
          className="w-full pt-3 pb-1 flex justify-center items-center cursor-pointer"
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
          <div>
            <h2 id="plan-preview-title" className="text-[17px] font-bold text-gray-900 tracking-tight">
              Session Plan Preview
            </h2>
            <p className="text-[11px] text-gray-500">{previewPlan.stationLocation}</p>
          </div>
          <TouchButton
            onPress={() => setPreviewPlan(null)}
            aria-label="Close preview"
            pressScale="scale-90"
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </TouchButton>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div className="space-y-1">
            <h3 className="text-[16px] font-bold text-gray-900 leading-snug">{previewPlan.title}</h3>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-gray-600">
              <span className="font-semibold text-teal-800">{activity.topic}</span>
              <span aria-hidden="true">·</span>
              <span>{activity.level}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-gray-700">{previewPlan.durationMinutes} min total</span>
            </div>
          </div>

          {/* Steps Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Investigation Steps
              </span>
              <span className="text-[11px] font-bold text-[#0F766E]">
                {previewPlan.steps.length} steps planned
              </span>
            </div>

            <div className="space-y-2">
              {previewPlan.steps.map((st, i) => (
                <div
                  key={st.id || i}
                  className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-md bg-[#0F766E] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <h4 className="text-[13px] font-bold text-gray-900 truncate">{st.title}</h4>
                      <span className="text-[11px] font-semibold text-[#0F766E] shrink-0">
                        {st.durationMinutes}m
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{st.materialsText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials Packing Checklist with Instant Toggle Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-[13px] font-bold text-gray-900">Materials Packed Checklist</span>
              <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {packedCount} of {checklist.length} packed
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-2xs">
              {checklist.map(m => {
                const isPacked = !!checkedMaterials[m.id];
                return (
                  <TouchButton
                    key={m.id}
                    onPress={() => toggleMaterialCheck(m.id)}
                    pressScale="scale-[0.985]"
                    debounceMs={150}
                    className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[46px] text-left hover:bg-gray-50 cursor-pointer select-none"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                        isPacked ? 'bg-[#0F766E] text-white' : 'border-2 border-gray-300 bg-white'
                      }`}
                    >
                      {isPacked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-[13px] flex-1 min-w-0 ${
                        isPacked ? 'text-gray-900 font-semibold line-through' : 'text-gray-800'
                      }`}
                    >
                      {m.name}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500">
                      {m.availableCount} available
                    </span>
                  </TouchButton>
                );
              })}
            </div>
          </div>

          {/* Safety Warning */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[12px] font-bold text-amber-900">Safety Field Precaution</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">{activity.safetyAlert}</p>
            </div>
          </div>

          {/* Inclusion Prompt */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
            <Accessibility className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[12px] font-bold text-blue-900">Inclusion Adaptation</p>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-snug">{activity.inclusionPrompt}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-1 text-gray-500">
            <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
            <span className="text-[11px]">No pupil data is collected. Fully functional offline.</span>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3.5 bg-white border-t border-gray-200 flex items-center gap-2.5 shadow-lg shrink-0">
          <TouchButton
            onPress={handleShare}
            aria-label="Share plan"
            pressScale="scale-90"
            debounceMs={300}
            className="h-12 w-12 flex items-center justify-center rounded-xl border border-gray-300 text-gray-700 hover:border-[#0F766E] cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </TouchButton>

          <TouchButton
            onPress={() => openRunner(previewPlan.id)}
            loadingText="Starting Session..."
            debounceMs={600}
            className="flex-1 h-12 rounded-xl bg-[#0F766E] hover:bg-[#0c625b] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Session Runner</span>
          </TouchButton>
        </div>
      </div>
    </div>
  );
};

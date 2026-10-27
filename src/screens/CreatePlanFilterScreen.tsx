import React from 'react';
import { Layers, School, Clock, Filter, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOPICS, GRADE_OPTIONS, DURATION_OPTIONS, COMMON_MATERIALS } from '../data/mockData';
import { TouchButton } from '../components/TouchButton';

export const CreatePlanFilterScreen: React.FC = () => {
  const { planFilter, setPlanFilter, resetPlanFilter, go } = useApp();

  const hasActive =
    planFilter.topic !== 'All Topics' ||
    planFilter.grade !== 'all' ||
    planFilter.duration !== 'all' ||
    planFilter.materials.length > 0;

  const toggleMaterial = (mat: string) => {
    setPlanFilter(prev => {
      const exists = prev.materials.includes(mat);
      return {
        ...prev,
        materials: exists ? prev.materials.filter(m => m !== mat) : [...prev.materials, mat],
      };
    });
  };

  return (
    <div id="screen-create-plan-filter" className="flex-1 flex flex-col bg-[#F8FAF9] relative overflow-hidden">
      {/* Sticky Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div>
          <h1 className="text-[16px] font-bold text-gray-900 leading-tight">Create Session Plan</h1>
          <p className="text-[11px] text-gray-500">Step 1 of 3 · Match criteria</p>
        </div>
        {hasActive && (
          <TouchButton
            onPress={resetPlanFilter}
            debounceMs={200}
            className="text-[12px] font-semibold text-[#0F766E] hover:underline cursor-pointer"
          >
            Reset
          </TouchButton>
        )}
      </header>

      {/* Filter Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-36">
        <section className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-[12px] text-teal-950">
            <span className="font-bold">Find an activity: </span>
            Filter by topic, grade level, time limit, and available kit supplies. Leave any field open if flexible.
          </div>
        </section>

        {/* Subject / Topic */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-2xs">
          <label htmlFor="filter-topic-select" className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0F766E]" />
            <span>Subject / Topic</span>
          </label>
          <div className="relative">
            <select
              id="filter-topic-select"
              value={planFilter.topic}
              onChange={e => setPlanFilter(prev => ({ ...prev, topic: e.target.value }))}
              className="w-full min-h-[46px] px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 text-[13px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#0F766E] cursor-pointer touch-manipulation"
            >
              {TOPICS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Grade Level */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-2xs">
          <label htmlFor="filter-grade-select" className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
            <School className="w-4 h-4 text-[#0F766E]" />
            <span>Target Grade Level</span>
          </label>
          <div className="relative">
            <select
              id="filter-grade-select"
              value={planFilter.grade}
              onChange={e => setPlanFilter(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full min-h-[46px] px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 text-[13px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#0F766E] cursor-pointer touch-manipulation"
            >
              {GRADE_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Target Duration Radio Buttons with Instant Press State */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2.5 shadow-2xs">
          <span className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0F766E]" />
            <span>Target Session Duration</span>
          </span>
          <div role="radiogroup" aria-label="Target duration" className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
            {DURATION_OPTIONS.map(o => {
              const isSelected = planFilter.duration === o.id;
              return (
                <TouchButton
                  key={o.id}
                  onPress={() => setPlanFilter(prev => ({ ...prev, duration: o.id }))}
                  aria-checked={isSelected}
                  pressScale="scale-95"
                  debounceMs={150}
                  className={`min-h-[40px] rounded-lg text-[12px] font-bold flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#0F766E] shadow-2xs border border-gray-200 font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {o.label}
                </TouchButton>
              );
            })}
          </div>
        </section>

        {/* Materials Available on Hand */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#0F766E]" />
              <span>Available Materials on Hand</span>
            </span>
            {planFilter.materials.length > 0 && (
              <span className="text-[11px] font-bold text-[#0F766E]">
                {planFilter.materials.length} selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {COMMON_MATERIALS.map(m => {
              const isSelected = planFilter.materials.includes(m);
              return (
                <TouchButton
                  key={m}
                  onPress={() => toggleMaterial(m)}
                  aria-pressed={isSelected}
                  pressScale="scale-95"
                  debounceMs={150}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#0F766E] text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span>{m}</span>
                  {isSelected && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                </TouchButton>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Sticky Action with Instant Visual Touch Feedback */}
      <footer className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-200 p-3.5 shadow-lg z-20">
        <TouchButton
          onPress={() => go('plan-filter-results')}
          loadingText="Filtering activities..."
          debounceMs={500}
          className="w-full min-h-[48px] bg-[#0F766E] hover:bg-[#0c625b] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Filter className="w-4 h-4 stroke-[2.5]" />
          <span>Find Matching Activities</span>
        </TouchButton>
      </footer>
    </div>
  );
};

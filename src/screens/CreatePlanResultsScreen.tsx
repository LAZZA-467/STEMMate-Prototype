import React, { useMemo } from 'react';
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, SlidersHorizontal, SearchX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from '../components/TouchButton';
import { TouchCard } from '../components/TouchCard';

export const CreatePlanResultsScreen: React.FC = () => {
  const { activities, planFilter, resetPlanFilter, go, goBack, startPlanCreationForActivity } = useApp();

  const filteredList = useMemo(() => {
    return activities.filter(act => {
      // Grade filter
      if (planFilter.grade && planFilter.grade !== 'all') {
        const nums = (act.level.match(/\d+/g) || []).map(Number);
        const [lo, hi] = nums.length ? [nums[0], nums[nums.length - 1]] : [0, 99];
        const g = Number(planFilter.grade);
        if (g < lo || g > hi) return false;
      }

      // Topic filter
      if (planFilter.topic && planFilter.topic !== 'All Topics') {
        const actTopic = act.topic.toLowerCase();
        const fTopic = planFilter.topic.toLowerCase();
        if (!actTopic.includes(fTopic) && !fTopic.includes(actTopic)) return false;
      }

      // Duration filter
      if (planFilter.duration === 'under-30') {
        if (act.durationMinutes >= 30) return false;
      } else if (planFilter.duration === '30-60') {
        if (act.durationMinutes < 30 || act.durationMinutes > 60) return false;
      } else if (planFilter.duration === 'over-60') {
        if (act.durationMinutes <= 60) return false;
      }

      // Materials filter
      if (planFilter.materials && planFilter.materials.length > 0) {
        const combined = (
          act.materialsSummary +
          ' ' +
          act.title +
          ' ' +
          act.tags.join(' ') +
          ' ' +
          act.materials.map(m => m.name).join(' ')
        ).toLowerCase();

        if (!planFilter.materials.every(m => combined.includes(m.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [activities, planFilter]);

  return (
    <div id="screen-create-plan-results" className="flex-1 flex flex-col bg-[#F8FAF9] relative overflow-hidden">
      {/* Sticky Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-2.5">
          <TouchButton
            onPress={goBack}
            aria-label="Back to filter criteria"
            pressScale="scale-90"
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </TouchButton>
          <div>
            <h1 className="text-[15.5px] font-bold text-gray-900 leading-tight">
              Filtered Activities
            </h1>
            <p className="text-[11px] text-gray-500">
              Step 2 of 3 · {filteredList.length} matching {filteredList.length === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        </div>

        <TouchButton
          onPress={() => go('plan-filter')}
          aria-label="Edit filters"
          pressScale="scale-90"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 border border-gray-200 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </TouchButton>
      </header>

      {/* Results Feed with TouchCard */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-8">
        {filteredList.length > 0 ? (
          filteredList.map(act => (
            <TouchCard
              key={act.id}
              onPress={() => startPlanCreationForActivity(act)}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-[#0F766E] transition-all space-y-2.5 cursor-pointer select-none"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-gray-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{act.durationMinutes}m</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{act.level}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-teal-800">{act.topic}</span>
                </div>

                {act.isOfflineReady && (
                  <div className="flex items-center gap-1 text-[#15803D] text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Cached</span>
                  </div>
                )}
              </div>

              <h3 className="text-[16px] font-bold text-gray-900 leading-snug">{act.title}</h3>
              <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">
                {act.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-500 truncate max-w-[180px]">
                  Kit: {act.materialsSummary}
                </span>

                <TouchButton
                  onPress={(e) => {
                    e.stopPropagation();
                    startPlanCreationForActivity(act);
                  }}
                  loadingText="Selecting..."
                  debounceMs={500}
                  className="min-h-[40px] px-3 bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-bold text-[12.5px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Select for Plan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </TouchButton>
              </div>
            </TouchCard>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center flex flex-col items-center justify-center my-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
              <SearchX className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900">No activities match your filters</h3>
            <p className="text-[12px] text-gray-500 max-w-[240px] leading-relaxed">
              Try broadening duration limits or removing material constraints.
            </p>
            <div className="pt-2">
              <TouchButton
                onPress={resetPlanFilter}
                className="min-h-[44px] px-4 py-2 bg-teal-50 border border-teal-200 text-[#0F766E] font-bold text-[13px] rounded-xl hover:bg-teal-100 cursor-pointer"
              >
                Clear all filters
              </TouchButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

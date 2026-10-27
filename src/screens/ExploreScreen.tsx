import React, { useState, useMemo } from 'react';
import { Search, X, Clock, CheckCircle2, Download, Eye, ArrowRight, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FILTER_CHIPS } from '../data/mockData';
import { TouchButton } from '../components/TouchButton';
import { TouchCard } from '../components/TouchCard';

export const ExploreScreen: React.FC = () => {
  const { activities, role, openActivityDetail, startPlanCreationForActivity } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const canCreate = role === 'Teacher' || role === 'Administrator';

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const filteredList = useMemo(() => {
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

  return (
    <div id="screen-explore" className="flex-1 flex flex-col bg-[#F8FAF9] pb-24 overflow-y-auto">
      {/* Top Search & Filter Bar */}
      <section className="px-4 pt-3 pb-2.5 bg-white border-b border-gray-200 flex flex-col gap-2.5 shrink-0 sticky top-0 z-20 shadow-2xs">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            id="explore-search-input"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search labs, topics, tools..."
            aria-label="Search STEM activities"
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-gray-50 border border-gray-300 text-[13.5px] text-gray-900 placeholder:text-gray-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E] focus:outline-none transition-all touch-manipulation"
          />
          {searchQuery && (
            <TouchButton
              onPress={() => setSearchQuery('')}
              aria-label="Clear search input"
              pressScale="scale-90"
              debounceMs={200}
              className="absolute right-2 p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </TouchButton>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 whitespace-nowrap">
          {FILTER_CHIPS.map(chip => {
            const isSelected = selectedChips.includes(chip);
            return (
              <TouchButton
                key={chip}
                onPress={() => toggleChip(chip)}
                aria-pressed={isSelected}
                pressScale="scale-95"
                debounceMs={250}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-[#0F766E]'
                }`}
              >
                <span>{chip}</span>
              </TouchButton>
            );
          })}
        </div>
      </section>

      {/* Main List */}
      <div className="px-4 pt-3 space-y-3 flex-1">
        <div className="flex items-center justify-between text-xs text-gray-500 py-0.5">
          <span className="font-semibold text-gray-800">{filteredList.length} activities found</span>
          <span className="text-[11px] text-teal-800 font-medium">Cached on-device</span>
        </div>

        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs my-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-gray-900">No matching activities</p>
              <p className="text-[12px] text-gray-500 mt-0.5">Try adjusting your search criteria</p>
            </div>
            <TouchButton
              onPress={() => {
                setSearchQuery('');
                setSelectedChips([]);
              }}
              className="px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0c625b]"
            >
              Clear Filters
            </TouchButton>
          </div>
        ) : (
          filteredList.map(act => (
            <TouchCard
              key={act.id}
              onPress={() => openActivityDetail(act.id)}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3 hover:border-[#0F766E]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{act.durationMinutes}m</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{act.level}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-teal-800">{act.topic}</span>
                </div>

                {act.isOfflineReady ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10.5px] font-bold border border-[#BBF7D0]">
                    <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                    <span>Offline Ready</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10.5px] font-medium border border-gray-200">
                    <Download className="w-3 h-3 text-gray-500" />
                    <span>Not cached</span>
                  </div>
                )}
              </div>

              <h3 className="text-[16px] font-bold text-gray-900 tracking-tight leading-snug">
                {act.title}
              </h3>

              <div className="bg-[#F8FAF9] rounded-xl p-2.5 flex flex-col gap-1 border border-gray-200/60 text-xs">
                <p className="text-gray-600 leading-relaxed line-clamp-2">{act.description}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[11.5px] text-gray-500 border-t border-gray-200/60">
                  <span className="font-semibold text-gray-700">Supplies: </span>
                  <span className="truncate">{act.materialsSummary}</span>
                </div>
              </div>

              <div className={canCreate ? 'grid grid-cols-2 gap-2 pt-0.5' : 'w-full pt-0.5'}>
                <TouchButton
                  onPress={(e) => {
                    e.stopPropagation();
                    openActivityDetail(act.id);
                  }}
                  className="h-11 w-full rounded-xl bg-white border border-gray-300 text-gray-800 text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:border-[#0F766E] cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>View Details</span>
                </TouchButton>

                {canCreate && (
                  <TouchButton
                    onPress={(e) => {
                      e.stopPropagation();
                      startPlanCreationForActivity(act);
                    }}
                    loadingText="Opening..."
                    debounceMs={500}
                    className="h-11 w-full rounded-xl bg-[#0F766E] hover:bg-[#0c625b] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Use in Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </TouchButton>
                )}
              </div>
            </TouchCard>
          ))
        )}

        <footer className="pt-2 pb-4 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 text-gray-500 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Fieldwork mode · Fully usable without signal</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

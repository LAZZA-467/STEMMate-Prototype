import React from 'react';
import { AlertTriangle, HardDrive, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from '../components/TouchButton';

export const StorageErrorScreen: React.FC = () => {
  const { plans, clearOldAndRetryStorage, goBack } = useApp();
  const syncedCount = plans.filter(p => p.status === 'synced').length;

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#F8FAF9] p-5 relative overflow-y-auto">
      <div className="flex items-center justify-between text-gray-500 text-[11px] pt-1">
        <span className="font-bold text-amber-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
          STORAGE FULL
        </span>
        <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
          Your draft is safe
        </span>
      </div>

      <div className="my-auto py-6 flex flex-col items-center text-center space-y-4 max-w-[310px] mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border-2 border-amber-200 shadow-sm">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-tight">Storage Limit Reached</h1>
          <p className="text-[13px] text-gray-600 leading-relaxed font-normal">
            Your tablet storage is currently full. Your in-progress session plan draft is preserved in volatile memory.
          </p>
        </div>

        <div className="w-full bg-white rounded-xl border border-gray-200 p-3.5 text-left space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-700">
            <HardDrive className="w-4 h-4 text-amber-700" />
            <span className="text-[12px] font-bold">Recommended Recovery Action</span>
          </div>
          <p className="text-[11.5px] text-gray-600 leading-normal">
            Remove cached plans that have already been securely synced to the central school server. Unsynced local drafts will remain safe.
          </p>
          <div className="pt-1 text-[11px] font-semibold text-[#0F766E] flex items-center justify-between border-t border-gray-100">
            <span>Synced plans eligible for purge:</span>
            <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
              {syncedCount} plans
            </span>
          </div>
        </div>
      </div>

      <footer className="space-y-2.5 pt-2 pb-1">
        <TouchButton
          onPress={clearOldAndRetryStorage}
          loadingText="Purging synced plans..."
          debounceMs={600}
          className="w-full min-h-[48px] bg-[#0F766E] hover:bg-[#0c625b] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Purge Synced &amp; Save Draft</span>
        </TouchButton>

        <TouchButton
          onPress={goBack}
          pressScale="scale-95"
          debounceMs={300}
          className="w-full min-h-[46px] bg-white hover:bg-gray-50 text-gray-700 font-semibold text-[13px] rounded-xl border border-gray-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Plan Editor</span>
        </TouchButton>
      </footer>
    </div>
  );
};

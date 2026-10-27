import React from 'react';
import { CheckCircle2, Eye, Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from './TouchButton';

export const SaveSuccessModal: React.FC = () => {
  const { savedSuccessPlan, setSavedSuccessPlan, setTab, showToast } = useApp();

  if (!savedSuccessPlan) return null;

  const handleView = () => {
    setSavedSuccessPlan(null);
    setTab('my-plans');
  };

  const handleDownload = () => {
    showToast('Plan summary exported to local device storage');
    setSavedSuccessPlan(null);
    setTab('my-plans');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-success-title"
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-[340px] bg-white rounded-2xl p-5 shadow-2xl border border-gray-200 flex flex-col items-center text-center space-y-3 relative animate-in zoom-in-95">
        <TouchButton
          onPress={() => setSavedSuccessPlan(null)}
          aria-label="Close"
          pressScale="scale-90"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </TouchButton>

        <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mb-0.5 border-2 border-emerald-100">
          <CheckCircle2 className="w-8 h-8 stroke-[2.4]" />
        </div>

        <div className="space-y-1">
          <h3 id="save-success-title" className="text-[18px] font-bold text-gray-900">
            Plan Saved on Device
          </h3>
          <p className="text-[12.5px] text-gray-600 leading-relaxed font-normal">
            Ready to run offline immediately. Will synchronize automatically to school cloud archive when online.
          </p>
        </div>

        <div className="w-full bg-gray-50 border border-gray-200/80 rounded-xl p-2.5 text-left text-[12px] text-gray-700">
          <p className="font-bold text-gray-900 truncate">{savedSuccessPlan.title}</p>
          <p className="text-gray-500 text-[11px] mt-0.5">
            {savedSuccessPlan.dateString} · {savedSuccessPlan.durationMinutes} min · {savedSuccessPlan.groupAllocation}
          </p>
        </div>

        <div className="w-full space-y-2 pt-1">
          <TouchButton
            onPress={handleView}
            loadingText="Opening My Plans..."
            debounceMs={500}
            className="w-full min-h-[46px] bg-[#0F766E] hover:bg-[#0c625b] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Eye className="w-4 h-4 stroke-[2.2]" />
            <span>View in My Plans</span>
          </TouchButton>

          <TouchButton
            onPress={handleDownload}
            loadingText="Exporting..."
            debounceMs={500}
            className="w-full min-h-[46px] bg-white hover:bg-gray-50 text-gray-800 font-semibold text-[13px] rounded-xl border border-gray-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0F766E]" />
            <span>Export Offline Copy</span>
          </TouchButton>
        </div>
      </div>
    </div>
  );
};

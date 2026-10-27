import React from 'react';
import { AlertTriangle, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from './TouchButton';

export const ConflictModal: React.FC = () => {
  const { conflict, setConflict, resolveConflict } = useApp();

  if (!conflict) return null;
  const { plan, remote } = conflict;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-title"
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in"
    >
      <div className="bg-white w-full max-w-[340px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 p-4 shadow-2xl space-y-3 animate-in zoom-in-95">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="conflict-title" className="text-[15px] font-bold text-gray-900 leading-snug">
              Sync Conflict Detected
            </h2>
            <p className="text-[11.5px] text-gray-600 mt-0.5">
              Modified here and on another device. Nothing has been overwritten yet.
            </p>
          </div>
        </div>

        <table className="w-full text-[12px] border-y border-gray-200 divide-y divide-gray-100">
          <caption className="sr-only">Version comparison</caption>
          <thead>
            <tr className="text-[10px] uppercase font-bold text-gray-500">
              <th scope="col" className="text-left py-1.5">Property</th>
              <th scope="col" className="text-left py-1.5 text-teal-800">This Device</th>
              <th scope="col" className="text-left py-1.5 text-slate-700">Remote Tablet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <th scope="row" className="text-left font-semibold text-gray-500 py-1.5 pr-1">Title</th>
              <td className="py-1.5 pr-1 text-gray-900 font-medium truncate max-w-[90px]">{plan.title}</td>
              <td className="py-1.5 text-gray-700 font-medium truncate max-w-[90px]">{remote.title}</td>
            </tr>
            <tr>
              <th scope="row" className="text-left font-semibold text-gray-500 py-1.5 pr-1">Duration</th>
              <td className="py-1.5 pr-1 text-gray-900 font-bold">{plan.durationMinutes}m</td>
              <td className="py-1.5 text-amber-800 font-bold">{remote.durationMinutes}m</td>
            </tr>
            <tr>
              <th scope="row" className="text-left font-semibold text-gray-500 py-1.5 pr-1">Edited At</th>
              <td className="py-1.5 pr-1 text-gray-600">Local save</td>
              <td className="py-1.5 text-gray-600">{remote.editedAt}</td>
            </tr>
          </tbody>
        </table>

        <div className="space-y-2 pt-1">
          <TouchButton
            onPress={() => resolveConflict('both')}
            loadingText="Saving both versions..."
            debounceMs={600}
            className="w-full min-h-[48px] px-3 py-2 rounded-xl text-left flex flex-col justify-center bg-[#0F766E] hover:bg-[#0c625b] text-white cursor-pointer shadow-sm"
          >
            <span className="text-[13px] font-bold flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              <span>Keep Both Versions (Safest)</span>
            </span>
            <span className="text-[10.5px] text-teal-100">Preserves remote tablet edits as a separate copy</span>
          </TouchButton>

          <TouchButton
            onPress={() => resolveConflict('mine')}
            loadingText="Applying local version..."
            debounceMs={600}
            className="w-full min-h-[44px] px-3 py-1.5 rounded-xl text-left flex flex-col justify-center bg-white border border-gray-300 hover:border-gray-400 text-gray-800 cursor-pointer"
          >
            <span className="text-[12.5px] font-bold">Keep My Local Version</span>
            <span className="text-[10px] text-gray-500">Overwrites cloud on next upload</span>
          </TouchButton>

          <TouchButton
            onPress={() => resolveConflict('theirs')}
            loadingText="Adopting remote version..."
            debounceMs={600}
            className="w-full min-h-[44px] px-3 py-1.5 rounded-xl text-left flex flex-col justify-center bg-white border border-gray-300 hover:border-gray-400 text-gray-800 cursor-pointer"
          >
            <span className="text-[12.5px] font-bold">Adopt Remote Tablet Version</span>
            <span className="text-[10px] text-gray-500">Replaces local version with {remote.editedOn}</span>
          </TouchButton>
        </div>

        <TouchButton
          onPress={() => setConflict(null)}
          debounceMs={200}
          className="w-full py-2 text-center text-xs text-[#0F766E] hover:underline font-semibold cursor-pointer"
        >
          Decide Later (Keep Pending)
        </TouchButton>
      </div>
    </div>
  );
};

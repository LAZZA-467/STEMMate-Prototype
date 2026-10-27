/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Volunteer Assistant Dashboard & Apparatus Preparation Guide:
 * Concise steps, estimated durations, safety alerts, and required materials checklist
 * to prepare field tables and apparatus kits before learners arrive.
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Package,
  CheckCircle2,
  ListOrdered,
  ChevronRight,
  Info,
  Shield,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from '../components/TouchButton';
import { TouchCard } from '../components/TouchCard';

export const VolunteerPrepScreen: React.FC = () => {
  const { plans, activities, openActivityDetail, showToast, announce, theme } = useApp();

  // Find the primary upcoming session plan to prep for
  const activePlan = plans[0];
  const activity = activities.find(a => a.id === activePlan?.activityId) || activities[0];

  // Track checked-off table prep items in local component state
  const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleMaterial = (id: string, name: string) => {
    const isNowChecked = !checkedMaterials.includes(id);
    setCheckedMaterials(prev =>
      isNowChecked ? [...prev, id] : prev.filter(m => m !== id)
    );
    announce(`${name} marked ${isNowChecked ? 'ready on bench' : 'not ready'}`);
  };

  const toggleStepPrep = (stepId: string, title: string) => {
    const isNowDone = !completedSteps.includes(stepId);
    setCompletedSteps(prev =>
      isNowDone ? [...prev, stepId] : prev.filter(s => s !== stepId)
    );
    announce(`Step: ${title} marked ${isNowDone ? 'prepped' : 'unprepped'}`);
  };

  return (
    <div
      id="screen-volunteer-prep"
      className={`flex-1 px-4 pt-3 pb-24 overflow-y-auto space-y-4 ${
        theme === 'sunlight' ? 'bg-white text-black' : 'bg-[#F8FAF9] dark:bg-slate-900 text-gray-950 dark:text-white'
      }`}
    >
      {/* Header Greeting */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            Volunteer Assistant View
          </span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Before Learners Arrive</span>
          </div>
        </div>
        <h2 className="text-[20px] font-extrabold tracking-tight">
          Bench Setup Guide
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Prepare apparatus, safety stations, and materials before session starts.
        </p>
      </section>

      {/* Target Session Card */}
      {activePlan && (
        <section className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                Session in Prep
              </span>
              <h3 className="text-base font-extrabold text-gray-950 dark:text-white leading-snug">
                {activePlan.title}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 text-xs font-black shrink-0 border border-teal-200 dark:border-teal-800">
              {activePlan.durationMinutes} min
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-slate-700">
            <span className="font-semibold">Station: {activePlan.stationLocation}</span>
            <span>·</span>
            <span>Squads: {activePlan.groupAllocation}</span>
          </div>
        </section>
      )}

      {/* Mandatory Safety Alert Callout */}
      {activity?.safetyAlert && (
        <section
          role="region"
          aria-label="Safety Alert for Apparatus Setup"
          className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-2xl p-4 shadow-2xs space-y-1.5"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.4]" aria-hidden="true" />
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-100">
              Apparatus Safety Warning
            </h3>
          </div>
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
            {activity.safetyAlert}
          </p>
        </section>
      )}

      {/* Required Materials Pre-Flight Checklist */}
      <section className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-extrabold text-gray-950 dark:text-white">
              Required Materials Checklist
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-500">
            {checkedMaterials.length}/{activity?.materials.length || 0} ready
          </span>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          Tap each material as you place it on the learner workbenches:
        </p>

        <div className="space-y-2 pt-1">
          {activity?.materials.map(mat => {
            const isChecked = checkedMaterials.includes(mat.id);
            return (
              <TouchButton
                key={mat.id}
                role="checkbox"
                aria-checked={isChecked}
                aria-label={`Mark ${mat.name} as ready on work table`}
                onPress={() => toggleMaterial(mat.id, mat.name)}
                pressScale="scale-98"
                debounceMs={200}
                className={`w-full min-h-[50px] p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold'
                    : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : 'border-gray-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <span className="text-xs truncate">{mat.name}</span>
                </div>
                <span className="text-[11px] shrink-0 text-gray-500 dark:text-gray-400 font-semibold">
                  {mat.statusText}
                </span>
              </TouchButton>
            );
          })}
        </div>
      </section>

      {/* Short Steps & Timings Preview */}
      <section className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-extrabold text-gray-950 dark:text-white">
              Investigation Steps & Timing
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-500">
            {activePlan?.steps.length || 0} steps
          </span>
        </div>

        <div className="space-y-2.5">
          {activePlan?.steps.map((st, idx) => {
            const isDone = completedSteps.includes(st.id);
            return (
              <div
                key={st.id}
                className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-teal-700 dark:text-teal-400 uppercase tracking-tight">
                    Step {idx + 1} ({st.durationMinutes} min)
                  </span>
                  <TouchButton
                    onPress={() => toggleStepPrep(st.id, st.title)}
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300'
                    }`}
                  >
                    {isDone ? 'Bench Prepped ✓' : 'Mark Bench Prepped'}
                  </TouchButton>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {st.title}
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Bench supplies: {st.materialsText}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role Limitation Notice */}
      <footer className="pt-2 pb-4 text-center text-xs text-gray-500 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-400">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>Volunteer Read-Only Mode · No Pupil Data</span>
        </div>
        <p className="text-[11px] max-w-xs">
          Plan modifications and apparatus return logging are restricted to Facilitator and Custodian accounts.
        </p>
      </footer>
    </div>
  );
};

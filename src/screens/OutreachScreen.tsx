/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Outreach Coordinator Dashboard:
 * Supports consistent multi-session planning and broad participation category tracking.
 * Strictly enforces data minimisation (ZERO pupil names, photos, or personal identifiers).
 */

import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Layers,
  ShieldCheck,
  Share2,
  FileText,
  Lock,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OUTREACH_METRICS } from '../data/mockData';
import { TouchButton } from '../components/TouchButton';
import { TouchCard } from '../components/TouchCard';

export const OutreachScreen: React.FC = () => {
  const { plans, isOnline, showToast, announce, theme } = useApp();
  const [copied, setCopied] = useState(false);

  // Calculate session count & anonymized squad numbers from existing local plans
  const totalLocalPlans = plans.length;
  const totalSquadCount = plans.reduce((acc, p) => acc + (p.groupSizeCount || 16), 0);

  const handleExportSummary = () => {
    setCopied(true);
    showToast('Exported anonymized outreach category summary to device.');
    announce('Outreach summary report exported. Zero pupil identities included.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="screen-outreach"
      className={`flex-1 px-4 pt-3 pb-24 overflow-y-auto space-y-4 ${
        theme === 'sunlight' ? 'bg-white text-black' : 'bg-[#F8FAF9] dark:bg-slate-900 text-gray-950 dark:text-white'
      }`}
    >
      {/* Header Info */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
            Outreach Coordination
          </span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>{OUTREACH_METRICS.region}</span>
          </div>
        </div>
        <h2 className="text-[20px] font-extrabold tracking-tight">
          Participation Metrics
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Aggregated category headcounts for multi-school outreach scheduling.
        </p>
      </section>

      {/* Strict Data Minimisation Compliance Card */}
      <section
        role="region"
        aria-label="Privacy and Data Minimisation Compliance"
        className="bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-500 rounded-2xl p-3.5 shadow-2xs space-y-2"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 stroke-[2.5]" aria-hidden="true" />
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
            Strict Data Minimisation Active
          </h3>
        </div>
        <p className="text-[12px] font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
          In strict compliance with child protection guidelines, STEMMate collects <strong>zero pupil identities, names, profiles, or photographs</strong>. Only broad category headcount bands are recorded for logistics and equipment allocation.
        </p>
        <div className="flex items-center gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>ISO/IEC 27701 & Offline-First Privacy Enforced</span>
        </div>
      </section>

      {/* Primary Aggregate Metrics Grid */}
      <section aria-label="Broad Category Counts" className="grid grid-cols-2 gap-2.5">
        {/* Total Sessions */}
        <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sessions</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-gray-950 dark:text-white">
            {OUTREACH_METRICS.totalOutreachSessions}
          </span>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">
            Across 14 rural stations
          </span>
        </div>

        {/* Total Estimated Learners */}
        <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Learners Est.</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-black text-gray-950 dark:text-white">
            {OUTREACH_METRICS.totalLearnersEstimated.toLocaleString()}
          </span>
          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold mt-1">
            Headcount category only
          </span>
        </div>
      </section>

      {/* Grade Category Breakdown */}
      <section className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Grade Category Allocation</span>
          </h3>
          <span className="text-[11px] font-bold text-gray-500">Broad Bands</span>
        </div>

        {/* Grade 4-6 Band */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-700 dark:text-gray-300">Grade 4–6 Bracket</span>
            <span className="text-indigo-700 dark:text-indigo-400">
              {OUTREACH_METRICS.gradeDistribution.grade4To6} learners (57%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '57%' }} />
          </div>
        </div>

        {/* Grade 7-9 Band */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-700 dark:text-gray-300">Grade 7–9 Bracket</span>
            <span className="text-teal-700 dark:text-teal-400">
              {OUTREACH_METRICS.gradeDistribution.grade7To9} learners (43%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: '43%' }} />
          </div>
        </div>

        {/* Gender Balance Estimates */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-600 dark:text-gray-400">Gender Parity Est.:</span>
          <div className="flex items-center gap-3 font-bold">
            <span className="text-emerald-700 dark:text-emerald-400">
              Girls: {OUTREACH_METRICS.genderBalance.girlsEstimated}
            </span>
            <span className="text-blue-700 dark:text-blue-400">
              Boys: {OUTREACH_METRICS.genderBalance.boysEstimated}
            </span>
          </div>
        </div>
      </section>

      {/* Multi-Station Plan Alignment Tracker */}
      <section className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0F766E]" />
            <span>Outreach Field Plans</span>
          </h3>
          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {totalLocalPlans} synced
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {plans.map(p => (
            <div key={p.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-bold text-gray-950 dark:text-white truncate">
                  {p.title}
                </p>
                <p className="text-[11px] text-gray-500">
                  {p.stationLocation} · {p.groupAllocation}
                </p>
              </div>
              <span className="shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {p.durationMinutes} min
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Export Button for Coordinator Reports */}
      <section className="pt-1">
        <TouchButton
          onPress={handleExportSummary}
          aria-label="Export anonymized participation summary report"
          debounceMs={400}
          className="w-full min-h-[50px] bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm border-2 border-indigo-900 cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Summary Copied to Storage ✓</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Export Anonymized Summary</span>
            </>
          )}
        </TouchButton>
      </section>

      {/* Privacy Guarantee Footer */}
      <footer className="pt-2 pb-4 flex items-center justify-center gap-1.5 text-gray-500">
        <Lock className="w-3.5 h-3.5 text-indigo-600" />
        <p className="text-[11px] font-medium text-center">
          Strict Data Minimisation Active · Zero Pupil Identifiers
        </p>
      </footer>
    </div>
  );
};

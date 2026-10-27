/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * School Management Review Dashboard:
 * Simple plan review workflow before sessions commence.
 * Evaluates age-appropriateness, inclusivity prompts, time/materials practicality, and records sign-off.
 */

import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  BadgeCheck,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SessionPlan } from '../types';
import { TouchButton } from '../components/TouchButton';
import { TouchCard } from '../components/TouchCard';

export const ManagementReviewScreen: React.FC = () => {
  const { plans, showToast, announce, theme } = useApp();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');

  // Review states map by plan id
  const [reviews, setReviews] = useState<Record<string, {
    ageAppropriate: boolean;
    inclusivityChecked: boolean;
    practicalityChecked: boolean;
    safetyChecked: boolean;
    isApproved: boolean;
  }>>({
    'plan-1': {
      ageAppropriate: true,
      inclusivityChecked: true,
      practicalityChecked: true,
      safetyChecked: true,
      isApproved: true,
    },
    'plan-2': {
      ageAppropriate: true,
      inclusivityChecked: true,
      practicalityChecked: false,
      safetyChecked: true,
      isApproved: false,
    },
  });

  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const currentReview = activePlan ? (reviews[activePlan.id] || {
    ageAppropriate: false,
    inclusivityChecked: false,
    practicalityChecked: false,
    safetyChecked: false,
    isApproved: false,
  }) : null;

  const toggleReviewItem = (field: 'ageAppropriate' | 'inclusivityChecked' | 'practicalityChecked' | 'safetyChecked') => {
    if (!activePlan) return;
    const prev = currentReview!;
    const updated = {
      ...prev,
      [field]: !prev[field],
      // If unchecking any item, reset approval
      isApproved: prev[field] ? false : prev.isApproved,
    };
    setReviews({ ...reviews, [activePlan.id]: updated });
    announce(`Review criteria ${field} toggled`);
  };

  const handleSignOff = () => {
    if (!activePlan || !currentReview) return;
    const allChecked =
      currentReview.ageAppropriate &&
      currentReview.inclusivityChecked &&
      currentReview.practicalityChecked &&
      currentReview.safetyChecked;

    if (!allChecked) {
      showToast('Please verify all 4 criteria before signing off.');
      announce('Cannot sign off: All 4 review checks must be satisfied.');
      return;
    }

    const nextApproved = !currentReview.isApproved;
    setReviews({
      ...reviews,
      [activePlan.id]: {
        ...currentReview,
        isApproved: nextApproved,
      },
    });

    if (nextApproved) {
      showToast(`Session Plan "${activePlan.title}" approved and signed off!`);
      announce(`Session plan approved by School Management.`);
    } else {
      showToast('Sign-off status removed.');
      announce('Sign-off status cleared.');
    }
  };

  return (
    <div
      id="screen-management-review"
      className={`flex-1 px-4 pt-3 pb-24 overflow-y-auto space-y-4 ${
        theme === 'sunlight' ? 'bg-white text-black' : 'bg-[#F8FAF9] dark:bg-slate-900 text-gray-950 dark:text-white'
      }`}
    >
      {/* Header Info */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            School Management View
          </span>
          <span className="text-[11px] font-bold text-gray-500">
            Quality &amp; Inclusivity Review
          </span>
        </div>
        <h2 className="text-[20px] font-extrabold tracking-tight">
          Session Plan Review
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Verify curriculum age-appropriateness, practical safety, and inclusivity prompts before teaching begins.
        </p>
      </section>

      {/* Plan Selector Carousel/List */}
      <section className="space-y-1.5">
        <label htmlFor="management-plan-select" className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Select Plan to Audit:
        </label>
        <select
          id="management-plan-select"
          value={selectedPlanId}
          onChange={e => {
            setSelectedPlanId(e.target.value);
            announce(`Loaded review details for plan`);
          }}
          className="w-full min-h-[46px] px-3.5 bg-white dark:bg-slate-800 rounded-xl border-2 border-gray-300 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white cursor-pointer"
        >
          {plans.map(p => {
            const isAppr = reviews[p.id]?.isApproved;
            return (
              <option key={p.id} value={p.id}>
                {isAppr ? '✓ [Approved] ' : '⏳ [Pending] '} {p.title} ({p.durationMinutes}m)
              </option>
            );
          })}
        </select>
      </section>

      {/* Plan Summary Card */}
      {activePlan && (
        <section className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10.5px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                Audited Lesson Plan
              </span>
              <h3 className="text-base font-extrabold text-gray-950 dark:text-white leading-snug">
                {activePlan.title}
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 border ${
                currentReview?.isApproved
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {currentReview?.isApproved ? 'Approved ✓' : 'Awaiting Review'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-slate-700">
            <span>Duration: {activePlan.durationMinutes} min</span>
            <span>·</span>
            <span>Squads: {activePlan.groupAllocation}</span>
            <span>·</span>
            <span>Steps: {activePlan.steps.length}</span>
          </div>
        </section>
      )}

      {/* Review Checklist Section */}
      <section className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-extrabold text-gray-950 dark:text-white">
              Management Sign-Off Rubric
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-500">4 Items</span>
        </div>

        <div className="space-y-2 pt-1">
          {/* Check 1: Age Appropriateness */}
          <TouchButton
            role="checkbox"
            aria-checked={currentReview?.ageAppropriate}
            aria-label="Verify age-appropriateness for Grade curriculum"
            onPress={() => toggleReviewItem('ageAppropriate')}
            pressScale="scale-98"
            debounceMs={200}
            className={`w-full min-h-[52px] p-3 rounded-xl border-2 flex items-start gap-3 text-left transition-all cursor-pointer ${
              currentReview?.ageAppropriate
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-950 dark:text-purple-100'
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                currentReview?.ageAppropriate
                  ? 'bg-purple-600 border-purple-700 text-white'
                  : 'border-gray-400 bg-white dark:bg-slate-800'
              }`}
            >
              {currentReview?.ageAppropriate && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            </div>
            <div>
              <p className="text-xs font-bold">1. Age-Appropriateness Confirmed</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                Concepts, math calculations, and reading levels fit learners' grade bracket.
              </p>
            </div>
          </TouchButton>

          {/* Check 2: Inclusivity Prompts */}
          <TouchButton
            role="checkbox"
            aria-checked={currentReview?.inclusivityChecked}
            aria-label="Verify tactile adaptations and inclusion prompts"
            onPress={() => toggleReviewItem('inclusivityChecked')}
            pressScale="scale-98"
            debounceMs={200}
            className={`w-full min-h-[52px] p-3 rounded-xl border-2 flex items-start gap-3 text-left transition-all cursor-pointer ${
              currentReview?.inclusivityChecked
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-950 dark:text-purple-100'
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                currentReview?.inclusivityChecked
                  ? 'bg-purple-600 border-purple-700 text-white'
                  : 'border-gray-400 bg-white dark:bg-slate-800'
              }`}
            >
              {currentReview?.inclusivityChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            </div>
            <div>
              <p className="text-xs font-bold">2. Inclusivity &amp; Adaptation Prompts</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                Tactile materials and multi-format reporting available for all learners.
              </p>
            </div>
          </TouchButton>

          {/* Check 3: Practicality & Apparatus Timings */}
          <TouchButton
            role="checkbox"
            aria-checked={currentReview?.practicalityChecked}
            aria-label="Verify time and apparatus practicality"
            onPress={() => toggleReviewItem('practicalityChecked')}
            pressScale="scale-98"
            debounceMs={200}
            className={`w-full min-h-[52px] p-3 rounded-xl border-2 flex items-start gap-3 text-left transition-all cursor-pointer ${
              currentReview?.practicalityChecked
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-950 dark:text-purple-100'
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                currentReview?.practicalityChecked
                  ? 'bg-purple-600 border-purple-700 text-white'
                  : 'border-gray-400 bg-white dark:bg-slate-800'
              }`}
            >
              {currentReview?.practicalityChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            </div>
            <div>
              <p className="text-xs font-bold">3. Time &amp; Material Practicality</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                Realistic pacing ({activePlan?.durationMinutes}m) and materials available locally.
              </p>
            </div>
          </TouchButton>

          {/* Check 4: Safety Reviewed */}
          <TouchButton
            role="checkbox"
            aria-checked={currentReview?.safetyChecked}
            aria-label="Verify safety warnings and hazards"
            onPress={() => toggleReviewItem('safetyChecked')}
            pressScale="scale-98"
            debounceMs={200}
            className={`w-full min-h-[52px] p-3 rounded-xl border-2 flex items-start gap-3 text-left transition-all cursor-pointer ${
              currentReview?.safetyChecked
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-950 dark:text-purple-100'
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                currentReview?.safetyChecked
                  ? 'bg-purple-600 border-purple-700 text-white'
                  : 'border-gray-400 bg-white dark:bg-slate-800'
              }`}
            >
              {currentReview?.safetyChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            </div>
            <div>
              <p className="text-xs font-bold">4. Safety Precautions Reviewed</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                Eye protection, non-potable liquids, and hand-wash procedures approved.
              </p>
            </div>
          </TouchButton>
        </div>
      </section>

      {/* Primary Sign-Off Action Button */}
      <section className="pt-1">
        <TouchButton
          onPress={handleSignOff}
          aria-label={
            currentReview?.isApproved
              ? 'Revoke School Management Sign-Off'
              : 'Sign Off and Approve Session Plan'
          }
          debounceMs={400}
          className={`w-full min-h-[52px] font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm border-2 cursor-pointer transition-all ${
            currentReview?.isApproved
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-900'
              : 'bg-purple-700 hover:bg-purple-800 text-white border-purple-900'
          }`}
        >
          {currentReview?.isApproved ? (
            <>
              <BadgeCheck className="w-5 h-5 text-emerald-200 stroke-[2.4]" />
              <span>Signed Off by School Management ✓</span>
            </>
          ) : (
            <>
              <ClipboardCheck className="w-5 h-5" />
              <span>Sign Off &amp; Approve Plan</span>
            </>
          )}
        </TouchButton>
      </section>

      {/* Role Limitation Notice */}
      <footer className="pt-2 pb-4 text-center text-xs text-gray-500 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>Management Reviewer Role · Zero Pupil Data</span>
        </div>
        <p className="text-[11px] max-w-xs">
          School Management does not author or edit plans directly, preserving facilitator ownership.
        </p>
      </footer>
    </div>
  );
};

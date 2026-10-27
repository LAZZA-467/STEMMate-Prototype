import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  Users,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Save,
  AlertTriangle,
  Info,
  Clock,
  CloudOff,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEMPLATES } from '../data/mockData';
import { PlanStep, SessionPlan } from '../types';

export const CreatePlanFormScreen: React.FC = () => {
  const {
    selectedPlanActivity,
    saveNewPlan,
    goBack,
    isOnline,
    saveDraft,
    getDraft,
    showToast,
    currentUser,
  } = useApp();

  const activityId = selectedPlanActivity.id;

  // Initialize from saved draft if available, otherwise default
  const [title, setTitle] = useState(() => {
    const existing = getDraft(activityId);
    return existing?.title || `${selectedPlanActivity.title} Field Session`;
  });

  const [template, setTemplate] = useState(() => {
    const existing = getDraft(activityId);
    return existing?.template || '60-min investigation';
  });

  const [groupSize, setGroupSize] = useState(() => {
    const existing = getDraft(activityId);
    return existing?.groupSize ?? 16;
  });

  const [date, setDate] = useState(() => {
    const existing = getDraft(activityId);
    return existing?.date || '2026-10-15';
  });

  const [startTime, setStartTime] = useState(() => {
    const existing = getDraft(activityId);
    return existing?.startTime || '10:00';
  });

  const [station] = useState('Outdoor Lab Station 04');

  const [steps, setSteps] = useState<PlanStep[]>(() => {
    const existing = getDraft(activityId);
    if (existing?.steps && existing.steps.length > 0) {
      return existing.steps;
    }
    return TEMPLATES['60-min investigation'] ? TEMPLATES['60-min investigation'].steps : [];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isFirstMount = useRef(true);

  // Inform user if restored from offline draft
  useEffect(() => {
    const existing = getDraft(activityId);
    if (existing && isFirstMount.current) {
      showToast('Restored draft from device memory · Zero data loss', 'success');
      isFirstMount.current = false;
    }
  }, [activityId]);

  // Continuous Auto-Save on any change
  useEffect(() => {
    saveDraft(activityId, {
      title,
      template,
      groupSize,
      date,
      startTime,
      steps,
      updatedAt: Date.now(),
    });
  }, [activityId, title, template, groupSize, date, startTime, steps]);

  // Auto-switch steps when template changes
  const handleTemplateChange = (tmplKey: string) => {
    setTemplate(tmplKey);
    const tmpl = TEMPLATES[tmplKey];
    if (tmpl) {
      setSteps(tmpl.steps.map((s, idx) => ({ ...s, id: `step-${Date.now()}-${idx}` })));
    }
  };

  const handleStepChange = (idx: number, field: keyof PlanStep, val: any) => {
    setSteps(prev =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleMoveStep = (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= steps.length) return;
    const copy = [...steps];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setSteps(copy.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  const handleDeleteStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps(prev =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    const newStep: PlanStep = {
      id: `step-${Date.now()}`,
      stepNumber: nextNum,
      title: `Step ${nextNum}: Field Observation & Recording`,
      durationMinutes: 15,
      materialsText: selectedPlanActivity.materialsSummary || 'Kit materials',
      safetyAlert: 'Ensure field perimeter is clear and dry.',
      inclusionPrompt: 'Audio timer intervals for observation segments.',
    };
    setSteps(prev => [...prev, newStep]);
  };

  const totalMinutes = steps.reduce(
    (acc, s) => acc + (Number(s.durationMinutes) || 0),
    0
  );

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Please enter a session title';
    if (!groupSize || groupSize < 1 || groupSize > 100)
      errs.groupSize = 'Enter group count (1 to 100)';
    if (!date) errs.date = 'Select a session date';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);

    const newPlan: SessionPlan = {
      id: `plan-${Date.now()}`,
      title: title.trim(),
      dateString: date,
      durationMinutes: totalMinutes,
      groupAllocation: `${groupSize} pupils (anonymous)`,
      groupSizeCount: groupSize,
      startTime,
      stationLocation: station,
      status: 'pending',
      activityId: selectedPlanActivity.id,
      templateUsed: template,
      steps,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerRole: currentUser.role,
    };

    saveNewPlan(newPlan);
  };

  return (
    <div id="screen-create-plan-form" className="flex-1 flex flex-col bg-[#F8FAF9] relative overflow-hidden">
      {/* Sticky Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back to filtered activities"
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-[15.5px] font-bold text-gray-900 leading-tight truncate max-w-[170px]">
              Plan Session
            </h1>
            <p className="text-[11px] text-gray-500">Step 3 of 3 · Details &amp; steps</p>
          </div>
        </div>

        {/* Real-time Offline Safe Autosave Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isOnline ? 'Autosaved ✓' : 'Offline Saved ✓'}</span>
        </div>
      </header>

      {/* Connection Notice Callout inside the Form */}
      {!isOnline && (
        <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Connection lost · Every keystroke is saved on this device.</span>
          </div>
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Protected
          </span>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        {/* Selected Activity Blueprint Card */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-[#0F766E] uppercase tracking-wider text-[10.5px]">
              Blueprint Selected
            </span>
            <span className="font-semibold text-teal-800">{selectedPlanActivity.topic}</span>
          </div>

          <h2 className="text-[17px] font-bold text-gray-900 leading-snug">
            {selectedPlanActivity.title}
          </h2>

          <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Standard {selectedPlanActivity.durationMinutes}m</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{selectedPlanActivity.level}</span>
            {selectedPlanActivity.kitRequired && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-teal-800">
                  {selectedPlanActivity.kitRequired}
                </span>
              </>
            )}
          </div>
        </section>

        {/* Template Selector */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-2xs">
          <label
            htmlFor="plan-template-dropdown"
            className="text-[13px] font-bold text-gray-900 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0F766E]" />
              <span>Session Structure Template</span>
            </span>
            <span className="text-[11px] text-gray-500 font-normal">Pre-fills step list</span>
          </label>

          <select
            id="plan-template-dropdown"
            value={template}
            onChange={e => handleTemplateChange(e.target.value)}
            className="w-full min-h-[46px] px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 text-[13px] font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-[#0F766E] cursor-pointer"
          >
            {Object.keys(TEMPLATES).map(k => (
              <option key={k} value={k}>
                {k} ({TEMPLATES[k].defaultDuration} min)
              </option>
            ))}
          </select>
        </section>

        {/* Title & Group Size */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3.5 shadow-2xs">
          <div className="space-y-1">
            <label htmlFor="plan-title-input" className="text-[12px] font-bold text-gray-700">
              Session Title
            </label>
            <input
              id="plan-title-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Water Filtration Column Challenge"
              className="w-full min-h-[44px] px-3 bg-white rounded-xl border border-gray-300 text-[13px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
            {errors.title && <p className="text-[11px] text-rose-600 font-semibold">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="group-size-count-input" className="text-[12px] font-bold text-gray-700">
                Pupil Group Size (Count Only)
              </label>
              <span className="text-[10px] text-teal-800 font-medium">Anonymous · No names</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">
                <Users className="w-4 h-4" />
              </span>
              <input
                id="group-size-count-input"
                type="number"
                min="1"
                max="100"
                value={groupSize}
                onChange={e => setGroupSize(parseInt(e.target.value, 10) || 0)}
                placeholder="16"
                className="w-full min-h-[44px] pl-10 pr-3 bg-white rounded-xl border border-gray-300 text-[13.5px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
            {errors.groupSize && <p className="text-[11px] text-rose-600 font-semibold">{errors.groupSize}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label htmlFor="plan-date-input" className="text-[12px] font-bold text-gray-700">
                Session Date
              </label>
              <input
                id="plan-date-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3 bg-white rounded-xl border border-gray-300 text-[12px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="plan-time-input" className="text-[12px] font-bold text-gray-700">
                Start Time
              </label>
              <input
                id="plan-time-input"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full min-h-[44px] px-3 bg-white rounded-xl border border-gray-300 text-[12px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>
        </section>

        {/* Step Cards with Move & Edit */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
              Investigation Steps ({steps.length})
            </h3>
            <span className="text-[12px] font-bold text-[#0F766E]">
              {totalMinutes} min planned
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((s, idx) => (
              <div
                key={s.id || idx}
                className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs space-y-3 transition-all"
              >
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="text-[12px] font-bold text-gray-700">Step {idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, 'up')}
                      disabled={idx === 0}
                      aria-label="Move step up"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, 'down')}
                      disabled={idx === steps.length - 1}
                      aria-label="Move step down"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStep(idx)}
                      disabled={steps.length <= 1}
                      aria-label="Delete step"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 disabled:opacity-20 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10.5px] font-semibold text-gray-500">Step Title</label>
                    <input
                      type="text"
                      value={s.title}
                      onChange={e => handleStepChange(idx, 'title', e.target.value)}
                      className="w-full min-h-[40px] px-3 bg-gray-50 rounded-xl border border-gray-300 text-[12px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-gray-500">Duration (m)</label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={s.durationMinutes}
                      onChange={e =>
                        handleStepChange(idx, 'durationMinutes', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full min-h-[40px] px-3 bg-gray-50 rounded-xl border border-gray-300 text-[12px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-semibold text-gray-500">Step Materials</label>
                  <input
                    type="text"
                    value={s.materialsText}
                    onChange={e => handleStepChange(idx, 'materialsText', e.target.value)}
                    placeholder="List required items for this step..."
                    className="w-full min-h-[40px] px-3 bg-gray-50 rounded-xl border border-gray-300 text-[12px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-semibold text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Safety Alert</span>
                  </label>
                  <input
                    type="text"
                    value={s.safetyAlert || ''}
                    onChange={e => handleStepChange(idx, 'safetyAlert', e.target.value)}
                    placeholder="e.g. Mandatory eye protection..."
                    className="w-full min-h-[38px] px-3 bg-amber-50/50 rounded-xl border border-amber-200 text-[11px] text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-semibold text-blue-800 flex items-center gap-1">
                    <Info className="w-3 h-3 text-blue-600" />
                    <span>Inclusion Prompt</span>
                  </label>
                  <input
                    type="text"
                    value={s.inclusionPrompt || ''}
                    onChange={e => handleStepChange(idx, 'inclusionPrompt', e.target.value)}
                    placeholder="e.g. Tactile adaptation, color contrast..."
                    className="w-full min-h-[38px] px-3 bg-blue-50/50 rounded-xl border border-blue-200 text-[11px] text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddStep}
            className="w-full min-h-[46px] rounded-2xl border-2 border-dashed border-teal-600/40 hover:border-teal-700 bg-teal-50/40 hover:bg-teal-50 text-[#0F766E] font-bold text-[13px] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Investigation Step</span>
          </button>
        </section>
      </div>

      {/* Sticky Bottom Actions */}
      <footer className="h-16 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Total Time
          </span>
          <span className="text-[16px] font-extrabold text-[#0F766E] leading-tight">
            {totalMinutes} min
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[46px] px-6 bg-[#0F766E] hover:bg-[#0c625b] active:scale-[0.98] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Plan Offline</span>
        </button>
      </footer>
    </div>
  );
};

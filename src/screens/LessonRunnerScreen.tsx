import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  School,
  Clock,
  AlertTriangle,
  Accessibility,
  Users,
  CheckCircle2,
  CheckSquare,
  Check,
  Pause,
  Play,
  Lock,
  ShieldCheck,
  CloudOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TouchButton } from '../components/TouchButton';

export const LessonRunnerScreen: React.FC = () => {
  const {
    runnerPlanId,
    plans,
    activities,
    goBack,
    setTab,
    toggleRunnerStep,
    showToast,
    isOnline,
    saveRunnerProgress,
    getRunnerProgress,
  } = useApp();

  const plan = plans.find(p => p.id === runnerPlanId) || plans[0];
  const activity = activities.find(a => a.id === plan.activityId) || activities[0];

  // Restore timer state and minutes elapsed from local safe storage
  const [timerRunning, setTimerRunning] = useState(() => {
    const saved = getRunnerProgress(plan.id);
    return saved?.timerRunning ?? true;
  });

  const [minutesElapsed, setMinutesElapsed] = useState(() => {
    const saved = getRunnerProgress(plan.id);
    return saved?.minutesElapsed ?? 0;
  });

  const [seconds, setSeconds] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const completedSteps = plan.completedStepIds || [];
  const doneCount = completedSteps.length;

  // Active seconds ticking for the timer
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev >= 59) {
            setMinutesElapsed(m => m + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  // Continuously persist runner progress to local storage so connection loss never loses state
  useEffect(() => {
    saveRunnerProgress(plan.id, {
      completedStepIds: completedSteps,
      minutesElapsed,
      timerRunning,
      updatedAt: Date.now(),
    });
  }, [plan.id, completedSteps, minutesElapsed, timerRunning]);

  const handleToggleTimer = () => {
    setTimerRunning(prev => !prev);
    showToast(timerRunning ? 'Field timer paused' : 'Field timer running');
  };

  const handleComplete = () => {
    setIsCompleting(true);
    showToast(`Session "${plan.title}" marked completed! Logged locally.`);
    setTimeout(() => {
      setTab('my-plans');
      setIsCompleting(false);
    }, 250);
  };

  const formattedSeconds = String(seconds).padStart(2, '0');

  return (
    <div id="screen-lesson-runner" className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-28 overflow-y-auto">
      {/* Runner Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200 shrink-0">
        <div className="flex justify-between items-center w-full px-3 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <TouchButton
              onPress={goBack}
              aria-label="Go back"
              pressScale="scale-90"
              className="w-10 h-10 -ml-1 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </TouchButton>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-gray-900 leading-tight truncate">
                Lesson Runner
              </h1>
              <p className="text-[11px] text-gray-500 truncate">{plan.stationLocation}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-gray-100 border border-gray-200 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#0F766E]">Active Field Run</span>
          </div>
        </div>

        {/* Offline Protection Notice Bar */}
        <div className={`px-4 py-1.5 flex items-center justify-between text-[11px] border-t transition-colors ${
          isOnline
            ? 'bg-gray-100/80 border-gray-200/60 text-gray-700'
            : 'bg-amber-100/90 border-amber-300 text-amber-900 font-medium'
        }`}>
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span>
              {isOnline
                ? 'Working offline-ready · Session progress cached on tablet'
                : 'Connection lost · Running 100% offline with zero data loss'}
            </span>
          </div>
          <span className="font-mono font-bold text-[#0F766E]">
            {minutesElapsed}:{formattedSeconds}
          </span>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="px-4 pt-3.5 space-y-3.5 flex-1">
        {/* Session Card */}
        <section className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F766E] font-bold">
              <School className="w-3 h-3" />
              <span>{activity.level}</span>
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{plan.durationMinutes} min planned</span>
            </span>
          </div>

          <h2 className="text-[17px] font-bold text-gray-900 leading-snug">{plan.title}</h2>
          <p className="text-[13px] text-gray-600 leading-relaxed">{activity.description}</p>
        </section>

        {/* Safety Alert Precaution */}
        <section className="bg-[#FFFBEB] border-l-4 border-[#D97706] rounded-r-2xl p-3.5 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-[#92400E] font-bold block">
                Safety Field Precaution
              </span>
              <p className="text-[12px] text-[#92400E] font-medium leading-snug">
                {activity.safetyAlert}
              </p>
            </div>
          </div>
        </section>

        {/* Inclusion Prompt Note */}
        <section className="bg-[#EFF6FF] border-l-4 border-[#2563EB] rounded-r-2xl p-3.5 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Accessibility className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-[#1E40AF] font-bold block">
                Inclusion Adaptation Note
              </span>
              <p className="text-[12px] text-[#1E40AF] font-medium leading-snug">
                {activity.inclusionPrompt}
              </p>
            </div>
          </div>
        </section>

        {/* Field Squad Tracking */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-[14px] font-bold text-gray-900">Field Squad Progress</h3>
            </div>
            <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              4 Stations
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>Squads are numbered anonymously · No pupil personal names stored.</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-900">Squad 1</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Station A</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-[#15803D] rounded-md text-[10.5px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                <span>Complete</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-900">Squad 2</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Station B</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10.5px] font-bold border border-blue-200">
                <span>Step 2: Testing</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-900">Squad 3</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Station C</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10.5px] font-bold border border-blue-200">
                <span>Step 1: Setup</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-900">Squad 4</span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Station D</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10.5px] font-bold border border-gray-200">
                <span>Ready to start</span>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Field Guide Checklist with Instant Toggle Response */}
        <section className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-[#0F766E]" />
              <span>Step-by-Step Field Guide</span>
            </h3>
            <span className="text-[11.5px] font-bold text-[#0F766E]">
              {doneCount} of {plan.steps.length} done
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
            {plan.steps.map((st, i) => {
              const isDone = completedSteps.includes(st.id);
              return (
                <TouchButton
                  key={st.id || i}
                  onPress={() => toggleRunnerStep(st.id)}
                  pressScale="scale-[0.985]"
                  debounceMs={200}
                  className={`w-full flex items-center justify-between min-h-[56px] px-3.5 py-2.5 text-left cursor-pointer transition-colors ${
                    isDone ? 'bg-white' : 'bg-gray-50/60 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isDone ? 'bg-[#0F766E] text-white' : 'border-2 border-gray-300 bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] font-semibold leading-snug ${
                          isDone ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        Step {i + 1}: {st.title}
                      </p>
                      <span className="text-[11px] text-gray-500 block truncate">
                        {st.durationMinutes} min · {st.materialsText}
                      </span>
                    </div>
                  </div>
                </TouchButton>
              );
            })}
          </div>
        </section>

        {/* Runner Bottom Controls with Instant Touch Feedback */}
        <section className="pt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2.5">
            <TouchButton
              onPress={handleToggleTimer}
              pressScale="scale-95"
              debounceMs={250}
              className="min-h-[48px] px-3 bg-white border-2 border-gray-300 hover:border-[#0F766E] rounded-xl text-gray-900 flex items-center justify-center gap-2 cursor-pointer"
            >
              {timerRunning ? (
                <Pause className="w-4 h-4 text-[#0F766E]" />
              ) : (
                <Play className="w-4 h-4 text-[#0F766E] fill-[#0F766E]" />
              )}
              <div className="text-left leading-tight">
                <div className="text-[10px] text-gray-500">
                  {timerRunning ? 'Pause Timer' : 'Resume Timer'}
                </div>
                <div className="font-mono text-[12px] font-bold text-[#0F766E]">
                  {minutesElapsed}m {formattedSeconds}s
                </div>
              </div>
            </TouchButton>

            <TouchButton
              onPress={handleComplete}
              loading={isCompleting}
              loadingText="Completing..."
              debounceMs={600}
              className="min-h-[48px] px-4 bg-[#0F766E] hover:bg-[#0c625b] text-white rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-bold shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Session</span>
            </TouchButton>
          </div>
        </section>
      </div>
    </div>
  );
};

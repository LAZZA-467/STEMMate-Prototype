import React, { useState } from 'react';
import {
  User,
  RefreshCw,
  HardDrive,
  DownloadCloud,
  Info,
  Shield,
  Wifi,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  LogOut,
  ChevronRight,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  BookOpen,
  FileText,
  Package,
  Database,
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Vibrate,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, AppTheme } from '../types';
import { TouchButton } from '../components/TouchButton';
import { ROLES_METADATA } from '../security/permissions';

export const SettingsScreen: React.FC = () => {
  const {
    role,
    roleMetadata,
    setRole,
    isOnline,
    toggleOnline,
    autoSync,
    setAutoSync,
    mobileData,
    setMobileData,
    simulateStorageFull,
    setSimulateStorageFull,
    simulateConflict,
    setSimulateConflict,
    triggerSync,
    resetState,
    signOut,
    activities,
    showToast,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    hapticsEnabled,
    setHapticsEnabled,
    announce,
  } = useApp();


  const [subscreen, setSubscreen] = useState<
    'none' | 'sync-preferences' | 'storage-used' | 'offline-content' | 'about' | 'privacy'
  >('none');

  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [offlineSearch] = useState('');

  const cachedActivities = activities.filter(a => a.isOfflineReady);

  const renderSectionHeader = (title: string) => (
    <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-1.5 px-1">
      {title}
    </h3>
  );

  // Subscreen: Sync Preferences
  if (subscreen === 'sync-preferences') {
    return (
      <div className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-24 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3.5 h-14 flex items-center gap-2.5 shrink-0 shadow-2xs">
          <TouchButton
            onPress={() => setSubscreen('none')}
            aria-label="Back to settings"
            pressScale="scale-90"
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </TouchButton>
          <h2 className="text-[16px] font-bold text-gray-900">Sync Preferences</h2>
        </header>

        <div className="flex-1 px-4 py-3 space-y-4">
          <section className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-3.5 min-h-[56px]">
              <div>
                <p className="text-[14px] font-bold text-gray-900">Auto-sync when online</p>
                <p className="text-[11.5px] text-gray-500">
                  {autoSync ? 'Active · Push updates on network' : 'Paused · Manual sync only'}
                </p>
              </div>
              <TouchButton
                role="switch"
                aria-checked={autoSync}
                onPress={() => setAutoSync(prev => !prev)}
                pressScale="scale-95"
                debounceMs={200}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  autoSync ? 'bg-[#0F766E]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    autoSync ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </TouchButton>
            </div>

            <div className="flex items-center justify-between p-3.5 min-h-[56px]">
              <div>
                <p className="text-[14px] font-bold text-gray-900">Sync over mobile data</p>
                <p className="text-[11.5px] text-gray-500">
                  {mobileData ? 'Permitted for cellular data' : 'Disabled to conserve data bundle'}
                </p>
              </div>
              <TouchButton
                role="switch"
                aria-checked={mobileData}
                onPress={() => setMobileData(prev => !prev)}
                pressScale="scale-95"
                debounceMs={200}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  mobileData ? 'bg-[#0F766E]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    mobileData ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </TouchButton>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Last Cloud Backup:</span>
              <span className="font-semibold text-gray-800">Today 08:15</span>
            </div>

            <TouchButton
              onPress={triggerSync}
              loadingText="Synchronizing with station..."
              debounceMs={600}
              className="w-full min-h-[44px] bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Force Synchronize Now</span>
            </TouchButton>
          </section>
        </div>
      </div>
    );
  }

  // Subscreen: Storage Used
  if (subscreen === 'storage-used') {
    const total = 100;
    const used = 42;
    const breakdown = [
      { id: 'activities', label: 'Activities & Media', mb: 18, color: 'bg-[#0F766E]', icon: BookOpen },
      { id: 'session-plans', label: 'Session Plans', mb: 12, color: 'bg-emerald-600', icon: FileText },
      { id: 'cached-kit-data', label: 'Cached Kit Registry', mb: 6, color: 'bg-amber-500', icon: Package },
      { id: 'other', label: 'System Schemas', mb: 6, color: 'bg-slate-500', icon: Database },
    ];

    return (
      <div className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-24 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3.5 h-14 flex items-center gap-2.5 shrink-0 shadow-2xs">
          <TouchButton
            onPress={() => setSubscreen('none')}
            aria-label="Back to settings"
            pressScale="scale-90"
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </TouchButton>
          <h2 className="text-[16px] font-bold text-gray-900">Storage Used</h2>
        </header>

        <div className="flex-1 px-4 py-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Tablet Local Budget
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[30px] font-extrabold text-gray-900 leading-none">
                    {used} MB
                  </span>
                  <span className="text-[13px] text-gray-500">of {total} MB allocated</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F766E]">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                {breakdown.map(b => (
                  <div key={b.id} style={{ width: `${b.mb}%` }} className={`h-full ${b.color}`} />
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span>{used}% used</span>
                <span>{total - used} MB remaining</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
            {breakdown.map(b => {
              const Icon = b.icon;
              return (
                <div key={b.id} className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${b.color}`} />
                      <span className="text-[13px] font-semibold text-gray-800">{b.label}</span>
                    </div>
                    <span className="text-[13px] font-bold text-gray-900">{b.mb} MB</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${b.color}`} style={{ width: `${(b.mb / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <TouchButton
            onPress={() => showToast('Kit image cache purged (6 MB recovered)')}
            loadingText="Purging temporary media..."
            debounceMs={500}
            className="w-full min-h-[46px] rounded-xl border border-gray-300 text-gray-700 font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
            <span>Clear Cached Temporary Media</span>
          </TouchButton>
        </div>
      </div>
    );
  }

  // Subscreen: Offline Content
  if (subscreen === 'offline-content') {
    const list = cachedActivities.filter(a =>
      a.title.toLowerCase().includes(offlineSearch.toLowerCase())
    );

    return (
      <div className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-24 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3.5 h-14 flex items-center gap-2.5 shrink-0 shadow-2xs">
          <TouchButton
            onPress={() => setSubscreen('none')}
            aria-label="Back to settings"
            pressScale="scale-90"
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </TouchButton>
          <h2 className="text-[16px] font-bold text-gray-900">Offline Content</h2>
        </header>

        <div className="flex-1 px-4 py-3 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F766E]">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">
                  {cachedActivities.length} activities cached offline
                </p>
                <p className="text-[11px] text-gray-500">Ready for fieldwork without cell coverage</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
              Ready
            </span>
          </div>

          <div className="space-y-2">
            {list.map(a => (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{a.title}</p>
                  <p className="text-[11px] text-gray-500">{a.durationMinutes} min · {a.topic}</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cached</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Subscreen: About
  if (subscreen === 'about') {
    return (
      <div className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-24 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3.5 h-14 flex items-center gap-2.5 shrink-0 shadow-2xs">
          <TouchButton
            onPress={() => setSubscreen('none')}
            aria-label="Back to settings"
            pressScale="scale-90"
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </TouchButton>
          <h2 className="text-[16px] font-bold text-gray-900">About STEMMATE</h2>
        </header>

        <div className="flex-1 px-4 py-4 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-md mx-auto">
            <Info className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-gray-900">STEMMATE Namibia</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold text-[11px]">
              Prototype v1.1.0 (Low-Spec Optimized)
            </span>
          </div>

          <p className="text-[13px] text-gray-600 leading-relaxed max-w-[280px] mx-auto">
            A privacy-first mobile planning tool for Namibian STEM educators and kit custodians working in low-connectivity rural environments.
          </p>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-left space-y-2 text-xs text-gray-600 shadow-2xs">
            <p className="font-bold text-gray-900">Low-Spec Mobile Optimizations:</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Instant zero-latency visual press states on all touch targets</li>
              <li>Double-tap debounce locks preventing accidental duplicate actions</li>
              <li>Touch action manipulation bypassing mobile 300ms browser delay</li>
              <li>Zero telemetry &amp; zero pupil personal identifiable information</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Subscreen: Privacy
  if (subscreen === 'privacy') {
    return (
      <div className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-24 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3.5 h-14 flex items-center gap-2.5 shrink-0 shadow-2xs">
          <TouchButton
            onPress={() => setSubscreen('none')}
            aria-label="Back to settings"
            pressScale="scale-90"
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </TouchButton>
          <h2 className="text-[16px] font-bold text-gray-900">Privacy Guarantees</h2>
        </header>

        <div className="flex-1 px-4 py-4 space-y-3.5">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-teal-800 font-bold">
              <Shield className="w-5 h-5 text-[#0F766E]" />
              <h3 className="text-[15px]">Zero Pupil Identification (PR-01)</h3>
            </div>
            <p className="text-[12.5px] text-gray-600 leading-relaxed">
              STEMMATE Namibia strictly prohibits storing pupil names, rosters, or personal records.
              All squad tracking uses anonymous numbers only.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-teal-800 font-bold">
              <Lock className="w-5 h-5 text-[#0F766E]" />
              <h3 className="text-[15px]">Local Device Storage (SEC-01)</h3>
            </div>
            <p className="text-[12.5px] text-gray-600 leading-relaxed">
              Plan drafts stay encrypted in device memory. When signing out, drafts are purged so
              subsequent teachers on shared tablets cannot see them.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Primary Settings Screen
  return (
    <div id="screen-settings" className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-28 overflow-y-auto">
      <div className="flex-1 px-4 py-3 space-y-4">
        {/* Account & Station */}
        <section>
          {renderSectionHeader('Account & Station')}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F766E]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">{role}</p>
                <p className="text-[11.5px] text-gray-500">Station 04 · Field Lab Unit</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
        </section>

        {/* Sync & Storage Menu */}
        <section>
          {renderSectionHeader('Sync & Storage')}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
            <TouchButton
              onPress={() => setSubscreen('sync-preferences')}
              debounceMs={300}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900">Sync preferences</p>
                  <p className="text-[11px] text-gray-500">
                    {isOnline ? 'Online · Auto-sync active' : 'Offline · Local mode'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </TouchButton>

            <TouchButton
              onPress={() => setSubscreen('storage-used')}
              debounceMs={300}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900">Storage used</p>
                  <p className="text-[11px] text-gray-500">Local database &amp; field kits</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                42 MB
              </span>
            </TouchButton>

            <TouchButton
              onPress={() => setSubscreen('offline-content')}
              debounceMs={300}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900">Offline content</p>
                  <p className="text-[11px] text-gray-500">{cachedActivities.length} activities cached</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </TouchButton>
          </div>
        </section>

        {/* Accessibility, Themes & Feedback */}
        <section aria-labelledby="settings-a11y-heading">
          {renderSectionHeader('Accessibility & Display')}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700 shadow-2xs divide-y divide-gray-100 dark:divide-slate-700 overflow-hidden">
            {/* Visual Theme Selection */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0F766E] dark:text-teal-400" aria-hidden="true" />
                <p id="theme-selection-label" className="text-[13.5px] font-bold text-gray-900 dark:text-white">
                  Visual Theme & Contrast
                </p>
              </div>
              <p className="text-[11.5px] text-gray-600 dark:text-gray-400">
                Choose Sunlight Mode for direct Namibian sunlight (WCAG AAA 7:1+ contrast).
              </p>

              <div
                role="radiogroup"
                aria-labelledby="theme-selection-label"
                className="grid grid-cols-3 gap-2 pt-1"
              >
                {(
                  [
                    { id: 'light', label: 'Light', desc: 'Standard AA', icon: Sun },
                    { id: 'dark', label: 'Dark', desc: 'Low Glare', icon: Moon },
                    { id: 'sunlight', label: 'Sunlight', desc: 'Outdoor AAA', icon: Sparkles },
                  ] as const
                ).map(t => {
                  const isCur = theme === t.id;
                  const Icon = t.icon;
                  return (
                    <TouchButton
                      key={t.id}
                      role="radio"
                      aria-checked={isCur}
                      aria-label={`${t.label} mode, ${t.desc}`}
                      onPress={() => {
                        setTheme(t.id);
                        announce(`Switched to ${t.label} theme`);
                      }}
                      className={`min-h-[50px] p-2 rounded-xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isCur
                          ? 'border-[#0F766E] bg-teal-50 text-[#0F766E] font-bold dark:bg-teal-950 dark:border-teal-400 dark:text-teal-200'
                          : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-0.5" aria-hidden="true" />
                      <span className="text-[11.5px] font-bold leading-tight">{t.label}</span>
                      <span className="text-[9.5px] opacity-75">{t.desc}</span>
                    </TouchButton>
                  );
                })}
              </div>
            </div>

            {/* Audio Feedback Toggle */}
            <div className="flex items-center justify-between p-3.5 min-h-[52px]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400 flex items-center justify-center">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900 dark:text-white">Audio Feedback</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {soundEnabled ? 'Synthesized chimes on sync & save' : 'Muted'}
                  </p>
                </div>
              </div>
              <TouchButton
                role="switch"
                aria-checked={soundEnabled}
                aria-label="Toggle synthesized audio feedback tones"
                onPress={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  announce(next ? 'Audio feedback enabled' : 'Audio feedback muted');
                }}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors cursor-pointer border-2 ${
                  soundEnabled ? 'bg-[#0F766E] border-teal-800' : 'bg-gray-300 border-gray-400'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </TouchButton>
            </div>

            {/* Haptic Vibration Toggle */}
            <div className="flex items-center justify-between p-3.5 min-h-[52px]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400 flex items-center justify-center">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900 dark:text-white">Haptic Vibration</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {hapticsEnabled ? 'Tactile vibration on tap & sync' : 'Disabled'}
                  </p>
                </div>
              </div>
              <TouchButton
                role="switch"
                aria-checked={hapticsEnabled}
                aria-label="Toggle haptic vibration feedback"
                onPress={() => {
                  const next = !hapticsEnabled;
                  setHapticsEnabled(next);
                  announce(next ? 'Haptic feedback enabled' : 'Haptic feedback disabled');
                }}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors cursor-pointer border-2 ${
                  hapticsEnabled ? 'bg-[#0F766E] border-teal-800' : 'bg-gray-300 border-gray-400'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </TouchButton>
            </div>
          </div>
        </section>

        {/* Compliance & System */}
        <section>
          {renderSectionHeader('Compliance & System')}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
            <TouchButton
              onPress={() => setSubscreen('about')}
              debounceMs={300}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900">About STEMMATE</p>
                  <p className="text-[11px] text-gray-500">Prototype v1.1.0 (Low-Spec Optimized)</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </TouchButton>

            <TouchButton
              onPress={() => setSubscreen('privacy')}
              debounceMs={300}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900">Privacy Guarantees</p>
                  <p className="text-[11px] text-gray-500">Zero pupil data · Local retention</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </TouchButton>
          </div>
        </section>

        {/* Demo Controls Panel (For Prototype Evaluation) */}
        <section>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
              Evaluator Demo Controls
            </span>
          </div>

          <div className="bg-gray-100/90 rounded-2xl border border-gray-300 p-3 space-y-3">
            {/* Role Switcher */}
            <div className="space-y-1">
              <label htmlFor="evaluator-role-select" className="text-[11.5px] font-semibold text-gray-700">
                Switch Active Role
              </label>
              <select
                id="evaluator-role-select"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full min-h-[44px] px-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 touch-manipulation cursor-pointer"
              >
                {[
                  'STEM Facilitator / Teacher',
                  'Outreach Coordinator',
                  'Volunteer Assistant',
                  'Equipment Custodian',
                  'School Management',
                  'System Administrator',
                ].map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Role Capabilities & Enforced Limitations Card */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 text-xs space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-gray-900">{roleMetadata.title}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${roleMetadata.badgeColor}`}>
                  {roleMetadata.shortLabel}
                </span>
              </div>
              <p className="text-[11.5px] text-gray-600 leading-snug">{roleMetadata.summary}</p>

              <div className="pt-1.5 border-t border-gray-100 space-y-1">
                <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-wider block">
                  ✓ What this role CAN do:
                </span>
                <ul className="space-y-1 text-[11px] text-gray-700 pl-3 list-disc">
                  {roleMetadata.canList.map((item, idx) => (
                    <li key={idx} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-1.5 border-t border-gray-100 space-y-1">
                <span className="text-[10.5px] font-black text-rose-800 uppercase tracking-wider block">
                  ✕ What this role CANNOT do:
                </span>
                <ul className="space-y-1 text-[11px] text-gray-700 pl-3 list-disc">
                  {roleMetadata.cannotList.map((item, idx) => (
                    <li key={idx} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Network Simulator Toggle with Instant Touch Feedback */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <div>
                <p className="text-[12px] font-semibold text-gray-800">Connection State</p>
                <p className="text-[10.5px] text-gray-500">Simulate field offline mode</p>
              </div>
              <TouchButton
                onPress={toggleOnline}
                pressScale="scale-95"
                debounceMs={300}
                className="min-h-[38px] px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer"
              >
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                    Offline
                  </span>
                )}
              </TouchButton>
            </div>

            {/* Storage Full Simulation */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <div>
                <p className="text-[12px] font-semibold text-gray-800">Simulate Storage Full</p>
                <p className="text-[10.5px] text-gray-500">Tests plan save recovery</p>
              </div>
              <TouchButton
                onPress={() => setSimulateStorageFull(prev => !prev)}
                pressScale="scale-95"
                debounceMs={200}
                className="min-h-[38px] px-3 py-1 rounded-full flex items-center cursor-pointer"
              >
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    simulateStorageFull
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {simulateStorageFull ? 'Full' : 'Normal'}
                </span>
              </TouchButton>
            </div>

            {/* Sync Conflict Simulation */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <div>
                <p className="text-[12px] font-semibold text-gray-800">Simulate Sync Conflict</p>
                <p className="text-[10.5px] text-gray-500">Flags multi-device edits</p>
              </div>
              <TouchButton
                onPress={() => setSimulateConflict(prev => !prev)}
                pressScale="scale-95"
                debounceMs={200}
                className="min-h-[38px] px-3 py-1 rounded-full flex items-center cursor-pointer"
              >
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    simulateConflict
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {simulateConflict ? 'On' : 'Off'}
                </span>
              </TouchButton>
            </div>

            {/* Reset Prototype */}
            <div className="pt-1 border-t border-gray-200">
              <TouchButton
                onPress={resetState}
                loadingText="Resetting..."
                debounceMs={600}
                className="w-full min-h-[40px] px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-[12.5px] font-semibold text-gray-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Prototype State</span>
              </TouchButton>
            </div>
          </div>
        </section>

        {/* Sign Out Action */}
        <section className="pt-1">
          <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-1">
            <TouchButton
              onPress={() => setSignOutConfirm(true)}
              debounceMs={300}
              className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl hover:bg-rose-100/60 text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-rose-700">Sign Out</p>
                  <p className="text-[11px] text-rose-600">Clears local drafts on this tablet</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </TouchButton>
          </div>
        </section>
      </div>

      {/* Sign Out Confirmation Modal */}
      {signOutConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center px-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-[340px] rounded-2xl border border-gray-200 p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-snug">
                  Sign out of this tablet?
                </h3>
                <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                  In-progress plan drafts will be deleted so other facilitators sharing this device
                  cannot inspect them. Finished plans waiting to sync will remain.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <TouchButton
                onPress={() => setSignOutConfirm(false)}
                className="flex-1 min-h-[44px] rounded-xl border border-gray-300 text-gray-700 font-semibold text-[13px] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </TouchButton>
              <TouchButton
                onPress={() => {
                  setSignOutConfirm(false);
                  signOut();
                }}
                loadingText="Signing out..."
                debounceMs={600}
                className="flex-1 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[13px] cursor-pointer"
              >
                Sign Out
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

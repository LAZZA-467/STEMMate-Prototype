import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Smartphone, Monitor, CloudOff, ShieldCheck, Sun, Moon, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Toast } from './Toast';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isOnline,
    toggleOnline,
    devicePlatform,
    setDevicePlatform,
    theme,
    setTheme,
    liveAnnouncement,
  } = useApp();
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isFluid = devicePlatform === 'responsive';

  const themeClass =
    theme === 'dark' ? 'dark' : theme === 'sunlight' ? 'sunlight-mode' : '';

  return (
    <div
      className={`min-h-screen w-full bg-slate-900 text-slate-800 flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 font-sans select-none antialiased ${themeClass}`}
    >
      {/* Screen Reader Live Announcement Region (WCAG 4.1.3) */}
      <div
        id="a11y-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Top Device Bar (Switcher for Evaluator & Accessibility Theme) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[390px] mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-200 font-semibold">STEMMATE Namibia</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher for Field Evaluator: Light, Dark, Sunlight (AAA Outdoor) */}
          <div
            role="group"
            aria-label="Display Theme"
            className="flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700"
          >
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-label="Light mode"
              title="Light Mode (WCAG AA)"
              className={`p-1 rounded cursor-pointer transition-colors ${
                theme === 'light' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
              title="Dark Mode (Low glare)"
              className={`p-1 rounded cursor-pointer transition-colors ${
                theme === 'dark' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('sunlight')}
              aria-label="Sunlight high contrast mode"
              title="Sunlight Mode (WCAG AAA 7:1+ for bright outdoor sun)"
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors ${
                theme === 'sunlight' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Sun</span>
            </button>
          </div>

          {/* Quick Offline Simulator Button for instant evaluation */}
          <button
            type="button"
            onClick={toggleOnline}
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900'
                : 'bg-amber-950 text-amber-300 border border-amber-600/80 hover:bg-amber-900 animate-pulse'
            }`}
            title="Click to simulate losing or restoring network connection"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Simulate Drop</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>Simulate Connect</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Device Chassis */}
      <div
        id="mobile-device-frame"
        className={`w-full ${
          isFluid ? 'max-w-none min-h-screen rounded-none border-0' : 'max-w-[380px] h-[100dvh] max-h-[780px] rounded-[36px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
        } shrink-0 bg-[#F8FAF9] dark:bg-slate-900 relative flex flex-col overflow-hidden text-[13px]`}
      >

        {/* Mobile Status Bar (iOS dynamic island or Android punch hole) */}
        <div
          aria-hidden="true"
          className="w-full h-8 bg-white flex items-center justify-between px-5 pt-1 text-[11px] font-semibold text-gray-800 shrink-0 select-none z-50 border-b border-gray-100"
        >
          <span className="font-semibold tabular-nums">{currentTime}</span>

          {devicePlatform === 'ios' ? (
            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 bg-black rounded-full" />
          )}

          <div
            onClick={toggleOnline}
            className="flex items-center gap-1.5 text-gray-700 font-medium cursor-pointer"
            title={isOnline ? 'Online (Tap to simulate offline)' : 'Offline (Tap to reconnect)'}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-[#0F766E]" />
            ) : (
              <div className="flex items-center gap-1 text-amber-700">
                <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span className="text-[9px] uppercase font-bold tracking-tight">Offline</span>
              </div>
            )}
            <span className="text-[10px] font-mono">100%</span>
          </div>
        </div>

        {/* Global Prominent Connection Loss Notification Banner */}
        {!isOnline && (
          <div
            id="system-offline-indicator-banner"
            role="status"
            aria-live="polite"
            className="w-full bg-[#FFFBEB] border-b-2 border-amber-300 px-3.5 py-2 flex items-center justify-between text-[#92400E] z-40 shrink-0 select-none shadow-2xs animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
              <div className="p-1 rounded-md bg-amber-100/90 text-amber-800 shrink-0 mt-0.5">
                <CloudOff className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-amber-950 leading-tight">
                    Connection Lost — Offline Mode Active
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-[10.5px] text-amber-800 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#0F766E] shrink-0" />
                  <span className="truncate">
                    Current progress &amp; form data safely saved locally
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              id="system-offline-reconnect-btn"
              onClick={toggleOnline}
              className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-[11px] font-bold active:scale-95 transition-all cursor-pointer shrink-0 border border-amber-300"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* App Main Body Viewport */}
        <main id="app-main" className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAF9]">
          {children}
        </main>

        {/* Bottom Gesture / Home Indicator for iOS */}
        {devicePlatform === 'ios' && !isFluid && (
          <div className="w-full h-4 bg-white flex items-center justify-center pointer-events-none z-50">
            <div className="w-28 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Global Toast Layer */}
        <Toast />
      </div>
    </div>
  );
};

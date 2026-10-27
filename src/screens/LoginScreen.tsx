import React, { useState } from 'react';
import {
  FlaskConical,
  GraduationCap,
  Wrench,
  ClipboardCheck,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ROLES } from '../data/mockData';
import { TouchButton } from '../components/TouchButton';

export const LoginScreen: React.FC = () => {
  const { role, setRole, loginUser, go } = useApp();
  const [email, setEmail] = useState('f.namibia@fieldlab.org');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setLoginError(null);
    const rConfig = ROLES.find(r => r.id === selectedRole);
    if (rConfig) {
      setEmail(rConfig.defaultEmail);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const result = loginUser(email, role);
      setIsLoggingIn(false);
      if (result.success) {
        go('home');
      } else {
        setLoginError(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 250);
  };

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'BarChart3':
        return <BarChart3 className="w-4 h-4" />;
      case 'CheckSquare':
        return <CheckSquare className="w-4 h-4" />;
      case 'Shield':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#F8FAF9] overflow-y-auto">
      {/* Top Protocol Notice */}
      <header className="w-full pt-1 pb-2 shrink-0">
        <div className="flex items-center justify-between text-gray-500 text-[10.5px]">
          <span className="flex items-center gap-1.5 font-bold text-[#0F766E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
            FIELD LAB READY
          </span>
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-200">
            <CheckCircle2 className="w-3 h-3 text-[#0F766E]" />
            <span className="text-gray-700 font-semibold">Offline Verified</span>
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <div className="w-full flex-1 flex flex-col justify-center py-2 max-w-[340px] mx-auto">
        <div className="text-center mb-4 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center mb-2 shadow-sm">
            <FlaskConical className="w-7 h-7 stroke-[2]" />
          </div>
          <h1 className="text-[21px] font-bold text-gray-900 tracking-tight leading-tight">
            STEMMATE Namibia
          </h1>
          <p className="text-[12px] text-gray-600 mt-0.5">
            Offline-first STEM activity &amp; kit planner
          </p>
        </div>

        {/* Form Card */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {loginError && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in"
              >
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-bold">Authentication Rejected</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug">{loginError}</p>
                </div>
              </div>
            )}

            {/* Role Radio Group */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                  Select Role
                </label>
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Active: {role}
                </span>
              </div>

              <div role="radiogroup" aria-label="Select role" className="grid grid-cols-2 gap-2">
                {ROLES.map(r => {
                  const isSelected = role === r.id;
                  return (
                    <TouchButton
                      key={r.id}
                      onPress={() => handleRoleSelect(r.id)}
                      pressScale="scale-95"
                      debounceMs={200}
                      className={`min-h-[46px] p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/90 text-teal-900 ring-1 ring-teal-700 shadow-2xs'
                          : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#0F766E] text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {getRoleIcon(r.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold leading-tight truncate">{r.label}</p>
                        <p className="text-[10px] text-gray-500 leading-tight truncate">
                          {r.roleDesc}
                        </p>
                      </div>
                    </TouchButton>
                  );
                })}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-[11px] font-semibold text-gray-700">
                Staff ID or Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400 pointer-events-none">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="teacher@school.org"
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-gray-300 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] touch-manipulation"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-[11px] font-semibold text-gray-700">
                Local PIN or Passphrase
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400 pointer-events-none">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full h-11 pl-9 pr-11 bg-white border border-gray-300 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] touch-manipulation"
                />
                <TouchButton
                  type="button"
                  onPress={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                  pressScale="scale-90"
                  debounceMs={200}
                  className="absolute right-0 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </TouchButton>
              </div>
            </div>

            {/* Submit CTA with Instant Debouncing & Loading Feedback */}
            <TouchButton
              type="submit"
              loading={isLoggingIn}
              loadingText={`Entering as ${role}...`}
              debounceMs={600}
              className="w-full h-11 bg-[#0F766E] hover:bg-[#0c625b] text-white font-semibold text-[13.5px] rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Enter as {role}</span>
              <ArrowRight className="w-4 h-4" />
            </TouchButton>
          </form>
        </section>
      </div>

      {/* Privacy Guarantee Footer */}
      <footer className="w-full pt-1 pb-1 text-center shrink-0">
        <div className="flex items-center justify-center gap-1.5 text-gray-500">
          <Lock className="w-3 h-3 text-[#0F766E]" />
          <span className="text-[10px] font-semibold text-gray-700">Privacy Protocol 4.2</span>
        </div>
        <p className="text-[10.5px] text-gray-500 mt-0.5">
          Strictly no pupil data or personal names collected or stored.
        </p>
      </footer>
    </div>
  );
};

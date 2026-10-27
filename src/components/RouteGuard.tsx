/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Accessible Route Guard for Role-Based Access Control
 * Enforces local offline authorization checks and displays high-contrast WCAG AAA alert banners.
 */

import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Permission, hasPermission, getDeniedExplanation, ROLES_METADATA, normalizeUserRole, toCanonicalRole, UserRole } from '../security/permissions';
import { TouchButton } from './TouchButton';

interface RouteGuardProps {
  requiredPermission: Permission;
  children: React.ReactNode;
  fallbackScreen?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  requiredPermission,
  children,
  fallbackScreen = 'home',
}) => {
  const { role, setRole, go, theme, announce } = useApp();
  const canonicalRole = toCanonicalRole(role);
  const normRole = normalizeUserRole(role);
  const isAllowed = hasPermission(role, requiredPermission);

  if (isAllowed) {
    return <>{children}</>;
  }

  const roleMeta = ROLES_METADATA[canonicalRole];
  const explanation = getDeniedExplanation(role, requiredPermission);

  const handleReturn = () => {
    announce(`Returning to ${fallbackScreen}`);
    go(fallbackScreen);
  };

  const handleSwitchToFacilitator = () => {
    setRole('STEM Facilitator / Teacher');
    announce('Switched role to STEM Facilitator. Access granted.');
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex-1 flex flex-col justify-center items-center px-5 py-8 text-center overflow-y-auto select-none ${
        theme === 'sunlight'
          ? 'bg-white text-black'
          : 'bg-[#F8FAF9] dark:bg-slate-900 text-gray-950 dark:text-white'
      }`}
    >
      <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-500 text-amber-900 dark:text-amber-200 flex items-center justify-center mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8 stroke-[2.4]" aria-hidden="true" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-950 border border-rose-300 mb-2">
        Access Restricted by Role
      </span>

      <h2 className="text-xl font-extrabold tracking-tight mb-2">
        Permission Denied
      </h2>

      <div className="max-w-xs bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-left shadow-2xs space-y-2.5 mb-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-700">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Current Role:</span>
          <span className={`text-xs font-black px-2 py-0.5 rounded-md ${roleMeta.badgeColor}`}>
            {roleMeta.shortLabel}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-0.5">Restriction Reason:</span>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
            {explanation}
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
          <span>Local offline security policy enforced.</span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2.5">
        <TouchButton
          onPress={handleReturn}
          aria-label={`Return to ${fallbackScreen} screen`}
          pressScale="scale-95"
          className="w-full min-h-[48px] bg-[#0F766E] hover:bg-[#0c625b] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 border-2 border-teal-900 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>Return to {fallbackScreen === 'home' ? 'Home Dashboard' : fallbackScreen}</span>
        </TouchButton>

        <TouchButton
          onPress={handleSwitchToFacilitator}
          aria-label="Switch active role to STEM Facilitator for evaluation"
          pressScale="scale-95"
          className="w-full min-h-[48px] bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
          <span>Switch to STEM Facilitator</span>
        </TouchButton>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, CloudOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'sync':
        return <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />;
      case 'offline':
        return <CloudOff className="w-4 h-4 text-amber-300 shrink-0" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />;
    }
  };

  const getBg = () => {
    switch (toast.type) {
      case 'offline':
        return 'bg-amber-900/95 text-amber-100 border-amber-700/60';
      case 'alert':
        return 'bg-rose-950/95 text-rose-100 border-rose-800/60';
      case 'sync':
        return 'bg-emerald-950/95 text-emerald-100 border-emerald-800/60';
      default:
        return 'bg-teal-950/95 text-teal-100 border-teal-800/60';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[340px] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl border text-xs font-semibold backdrop-blur-md ${getBg()}`}>
        {getIcon()}
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
};

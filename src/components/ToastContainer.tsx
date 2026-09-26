import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="h-4 w-4 text-blue-500" />;
        let borderClass = 'border-blue-200 dark:border-blue-800 bg-blue-50/95 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="h-4 w-4 text-teal-500" />;
          borderClass = 'border-teal-200 dark:border-teal-800 bg-teal-50/95 dark:bg-teal-950/90 text-teal-900 dark:text-teal-100';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="h-4 w-4 text-rose-500" />;
          borderClass = 'border-rose-200 dark:border-rose-800 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
          borderClass = 'border-amber-200 dark:border-amber-800 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition-all ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

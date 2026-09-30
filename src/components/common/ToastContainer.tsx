import React from 'react';
import { useAlerts } from '../../context/AlertContext';
import { AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAlerts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((toast) => {
        const isCritical = toast.type === 'alerte' || toast.level === 'critique';
        const isPriseEnCharge = toast.type === 'prise_en_charge';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto shadow-xl rounded-xl p-4 border transition-all duration-300 transform translate-y-0 ${
              isCritical
                ? 'bg-red-900/95 text-white border-red-700 backdrop-blur-md'
                : isPriseEnCharge
                ? 'bg-emerald-900/95 text-white border-emerald-700 backdrop-blur-md'
                : 'bg-slate-900/95 text-white border-slate-700 backdrop-blur-md'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isCritical ? (
                    <AlertOctagon className="w-5 h-5 text-red-300 animate-pulse" />
                  ) : isPriseEnCharge ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wide">{toast.title}</span>
                    <span className="text-[11px] opacity-75 font-mono">{toast.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-md"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

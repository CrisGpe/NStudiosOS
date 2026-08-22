import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, durationMs?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, durationMs: number = 3500) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
      const newToast: ToastItem = { id, type, message, title, durationMs };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => showToast(message, 'success', title), [showToast]);
  const error = useCallback((message: string, title?: string) => showToast(message, 'error', title, 5000), [showToast]);
  const warning = useCallback((message: string, title?: string) => showToast(message, 'warning', title), [showToast]);
  const info = useCallback((message: string, title?: string) => showToast(message, 'info', title), [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container Component rendered globally
const ToastContainer: React.FC<{ toasts: ToastItem[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />,
        };

        const borders = {
          success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100 shadow-emerald-950/20',
          error: 'border-rose-500/30 bg-slate-900/95 text-slate-100 shadow-rose-950/20',
          warning: 'border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-amber-950/20',
          info: 'border-indigo-500/30 bg-slate-900/95 text-slate-100 shadow-indigo-950/20',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-3.5 border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-xs space-y-0.5 pr-1">
              {toast.title && <h4 className="font-bold text-white text-[12px]">{toast.title}</h4>}
              <p className="text-slate-300 leading-relaxed text-[11.5px]">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

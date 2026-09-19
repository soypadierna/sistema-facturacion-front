import { useEffect, useState, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

let toastFn: ((state: ToastState) => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  toastFn?.({ message, type });
}

export function ToastContainer() {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    toastFn = setToast;
    return () => { toastFn = null; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-white border-emerald-200' : 'bg-white border-red-200'}`}>
        {toast.type === 'success' ? (
          <CheckCircle size={20} className="text-emerald-500" />
        ) : (
          <AlertCircle size={20} className="text-red-500" />
        )}
        <span className="text-sm font-medium text-slate-700">{toast.message}</span>
        <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

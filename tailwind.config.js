'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastCtx {
  show: (msg: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const show = useCallback((msg: string, type: string = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div className={`toast fixed top-20 right-6 z-[300] px-5 py-3 rounded-lg text-sm font-medium shadow-elevated ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-accent text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

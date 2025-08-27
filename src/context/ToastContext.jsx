import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // { message, variant }

  const showToast = useCallback((message, variant = 'info', duration = 3000) => {
    setToast({ message, variant });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-[10001] transition-micro
            ${toast.variant === 'error' ? 'bg-error text-white' : toast.variant === 'success' ? 'bg-success text-white' : 'bg-foreground text-background'}
          `}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

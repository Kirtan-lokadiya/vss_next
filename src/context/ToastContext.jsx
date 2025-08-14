import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-error text-white px-6 py-3 rounded shadow-lg z-[2000] animate-fade-in">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

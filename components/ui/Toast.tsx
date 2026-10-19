"use client";

import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
  mounted?: boolean;
  exiting?: boolean;
}

interface ToastContextType {
  toast: (text: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true, mounted: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (text: string, type: "success" | "error" | "info" = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [
        ...prev,
        { id, type, text, mounted: false, exiting: false },
      ]);

      requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, mounted: true } : t))
        );
      });

      setTimeout(() => {
        dismiss(id);
      }, 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed inset-be-6 inset-ie-6 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
              t.exiting
                ? "opacity-0 translate-y-2"
                : t.mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            } ${
              t.type === "success"
                ? "bg-white/95 border-emerald-100 text-[var(--ink)]"
                : t.type === "error"
                  ? "bg-white/95 border-red-100 text-[var(--error)]"
                  : "bg-white/95 border-black/[0.08] text-[var(--ink)]"
            }`}
          >
            {t.type === "success" && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                ✓
              </span>
            )}
            {t.type === "error" && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                !
              </span>
            )}
            <span className="text-sm font-medium">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
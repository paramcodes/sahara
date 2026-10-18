"use client";

import type React from "react";
import { useEffect } from "react";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal Dialog"}
        className="relative z-10 w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
      >
        {}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-black/20" />
        </div>

        {}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <h2 className="text-lg font-semibold text-[var(--ink)] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/[0.06] hover:bg-black/[0.1] flex items-center justify-center text-[var(--ink-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

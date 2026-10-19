"use client";

import type React from "react";
import { useEffect, useState } from "react";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, title, children }) => {
  // Only the deferred unmount lives in state. `isAnimating` is derived straight
  // from `isOpen`, so opening a sheet costs one render instead of the previous
  // three (isVisible -> isAnimating -> mounted).
  const [isMounted, setIsMounted] = useState(isOpen);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
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

  // Keep the sheet mounted for the length of the exit transition. The setState
  // is deferred to a timeout, never synchronous inside the effect body.
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setIsMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    const t = setTimeout(() => setIsMounted(false), 300);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal Dialog"}
        className={`relative z-10 w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-clip flex flex-col transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
        }`}
      >
        {/* iOS Grab Handle for mobile */}
        <div className="sm:hidden flex justify-center pbs-3 pbe-1">
          <div className="w-10 h-1 rounded-full bg-black/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <h2 className="text-lg font-semibold text-[var(--ink)] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/[0.06] hover:bg-black/[0.1] flex items-center justify-center text-[var(--ink-secondary)] transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-4 focus-visible:ring-blue-500/20 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          {children}
        </div>
      </div>
    </div>
  );
};

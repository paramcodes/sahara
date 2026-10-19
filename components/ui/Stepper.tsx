"use client";

import type React from "react";

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  className = "",
  disabled = false,
}) => {
  const handleDec = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInc = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div
      className={`inline-flex items-center rounded-full bg-black/[0.05] p-1 border border-black/[0.04] ${className}`}
      role="group"
      aria-label="Quantity Stepper"
    >
      <button
        type="button"
        onClick={handleDec}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[var(--ink)] hover:bg-white active:bg-white/80 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <span
        className="w-10 text-center font-medium text-sm tabular-nums text-[var(--ink)]"
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleInc}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[var(--ink)] hover:bg-white active:bg-white/80 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

"use client";

import type React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-label={label || "Toggle setting"}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-4 focus-visible:ring-blue-500/20 ${
          checked ? "bg-[var(--accent)]" : "bg-black/[0.12]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] my-0.5 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      {label && <span className="text-sm font-medium text-[var(--ink)]">{label}</span>}
    </label>
  );
};

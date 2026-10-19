"use client";

import type React from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedProps<T>) {
  return (
    <div role="tablist" className={`inline-flex rounded-xl bg-black/[0.06] p-1 gap-1 ${className}`}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isSelected}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer ${
              isSelected
                ? "bg-white text-[var(--ink)] shadow-sm font-semibold"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

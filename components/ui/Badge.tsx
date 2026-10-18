import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "error" | "accent";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const variantStyles = {
    neutral: "bg-black/[0.05] text-[var(--ink-secondary)]",
    accent: "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium",
    success: "bg-[var(--success-bg)] text-[#1a7f37] font-medium",
    warning: "bg-amber-50 text-amber-800 font-medium",
    error: "bg-[var(--error-bg)] text-[var(--error)] font-medium",
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs tracking-wide transition-colors ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};

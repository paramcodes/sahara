import Link from "next/link";
import type React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white/60 border border-black/[0.04] max-w-md mx-auto my-6 ${className}`}
    >
      {icon ? (
        <div className="w-12 h-12 mbe-4 text-[var(--ink-tertiary)] flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 mbe-4 rounded-full bg-black/[0.04] text-[var(--ink-secondary)] flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4m8-8v16" />
          </svg>
        </div>
      )}

      <h3 className="text-lg font-semibold text-[var(--ink)] tracking-tight mbe-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--ink-secondary)] mbe-6 max-w-xs leading-relaxed">
        {description}
      </p>

      {actionText &&
        (actionHref ? (
          <Link href={actionHref}>
            <Button size="md">{actionText}</Button>
          </Link>
        ) : (
          <Button size="md" onClick={onAction}>
            {actionText}
          </Button>
        ))}
    </div>
  );
};

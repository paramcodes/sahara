import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      pill = true,
      isLoading = false,
      disabled,
      className = "",
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "text-xs px-3 py-1.5 min-h-[32px]",
      md: "text-sm px-4 py-2 min-h-[44px]",
      lg: "text-base px-6 py-3 min-h-[48px]",
    }[size];

    const radius = pill ? "rounded-full" : "rounded-xl";

    const variantClasses = {
      primary:
        "bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 hover:shadow-md text-white shadow-sm font-medium",
      secondary:
        "bg-black/[0.05] hover:bg-black/[0.08] hover:-translate-y-0.5 text-[var(--ink)] font-medium",
      danger: "bg-[var(--error-bg)] text-[var(--error)] hover:bg-red-100 font-medium",
      ghost: "bg-transparent hover:bg-black/[0.04] text-[var(--ink)] font-medium",
      link: "bg-transparent text-[var(--apple-blue)] hover:underline p-0 min-h-0",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-blue-500/20 active:scale-[0.98] active:translate-y-0 ${radius} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

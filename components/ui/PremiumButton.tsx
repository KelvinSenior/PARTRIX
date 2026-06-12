import React from "react";
import { ButtonVariants } from "@/lib/designSystem";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyle = (ButtonVariants.primary[variant] ?? ButtonVariants.primary.primary) as {
      bg: string;
      hover: string;
      text: string;
      border?: string;
      disabled: string;
    };
    const sizeStyle = ButtonVariants.size[size];
    const widthClass = fullWidth ? "w-full" : "";
    const borderClass = variantStyle.border ?? "";

    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-2xl
      transition-all duration-200 ease-out
      ${sizeStyle}
      ${widthClass}
      ${variantStyle.bg}
      ${variantStyle.hover}
      ${variantStyle.text}
      ${borderClass}
      ${variantStyle.disabled}
      ${className}
    `;

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={baseClasses}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
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
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

export default PremiumButton;

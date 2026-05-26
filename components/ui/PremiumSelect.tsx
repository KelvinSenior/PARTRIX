import React from "react";
import { InputVariants, LabelVariants } from "@/lib/designSystem";

interface PremiumSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  icon?: React.ReactNode;
}

const PremiumSelect = React.forwardRef<HTMLSelectElement, PremiumSelectProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      options = [],
      icon,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const selectClasses = error
      ? InputVariants.error
      : InputVariants.default;

    return (
      <div className="space-y-2">
        {label && (
          <label className={required ? LabelVariants.required : LabelVariants.default}>
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={`appearance-none ${selectClasses} ${icon ? "pl-10" : ""} ${className}`}
            {...props}
          >
            {children || (
              <>
                <option value="">Select an option</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PremiumSelect.displayName = "PremiumSelect";

export default PremiumSelect;

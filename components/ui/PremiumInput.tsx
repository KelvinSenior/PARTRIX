import React from "react";
import { InputVariants, LabelVariants } from "@/lib/designSystem";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      icon,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputClasses = error
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
          <input
            ref={ref}
            className={`${inputClasses} ${icon ? "pl-10" : ""} ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

export default PremiumInput;

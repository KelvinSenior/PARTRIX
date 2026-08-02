import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, helpText, error, required = false, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {helpText ? <p className="text-sm text-slate-500 dark:text-zinc-400">{helpText}</p> : null}
      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
    </div>
  );
}

"use client";

import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400",
  secondary: "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
  ghost: "bg-transparent text-zinc-950 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 rounded-xl px-3 text-sm",
  md: "h-12 rounded-2xl px-4 text-sm",
  lg: "h-14 rounded-3xl px-6 text-base",
};

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      {...props}
      className={mergeClasses(
        "inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    />
  );
}

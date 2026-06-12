"use client";

import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#22D3EE] text-[#050816] hover:bg-cyan-300",
  secondary: "border border-cyan-200/20 bg-white/5 text-cyan-100 hover:bg-white/10",
  ghost: "bg-transparent text-zinc-200 hover:bg-white/5",
  danger: "bg-rose-500/90 text-white hover:bg-rose-500",
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

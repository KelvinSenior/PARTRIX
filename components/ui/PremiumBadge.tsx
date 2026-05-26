import React from "react";
import { BadgeVariants } from "@/lib/designSystem";

interface PremiumBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "pending" | "neutral";
  size?: "sm" | "md" | "lg";
}

const sizeVariants = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

const PremiumBadge = React.forwardRef<HTMLSpanElement, PremiumBadgeProps>(
  ({ variant = "neutral", size = "md", className = "", children, ...props }, ref) => {
    const baseClasses = BadgeVariants[variant];
    const sizeClass = sizeVariants[size];

    return (
      <span
        ref={ref}
        className={`${baseClasses} ${sizeClass} ${className}`.replace("px-3 py-1 text-xs", sizeClass)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

PremiumBadge.displayName = "PremiumBadge";

export default PremiumBadge;

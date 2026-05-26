import React from "react";
import { CardVariants } from "@/lib/designSystem";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ variant = "default", header, footer, className = "", children, ...props }, ref) => {
    const variantStyle = CardVariants[variant];

    return (
      <div
        ref={ref}
        className={`${variantStyle.container} ${className}`}
        {...props}
      >
        {header && (
          <div className="mb-6 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            {header}
          </div>
        )}

        <div>{children}</div>

        {footer && (
          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

export default PremiumCard;

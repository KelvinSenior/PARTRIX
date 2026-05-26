import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  count?: number;
};

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Skeleton({
  variant = "text",
  width = "100%",
  height = "20px",
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  const variantClasses =
    variant === "text" ? "rounded-md" : variant === "circular" ? "rounded-full" : "rounded-lg";

  const base = "animate-pulse bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900";

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            {...props}
            style={{ width: widthStyle, height: heightStyle }}
            className={mergeClasses(base, variantClasses, className)}
          />
        ))}
      </div>
    );
  }

  return <div {...props} style={{ width: widthStyle, height: heightStyle }} className={mergeClasses(base, variantClasses, className)} />;
}

import type { InputHTMLAttributes } from "react";

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={mergeClasses(
        "field-input",
        className,
      )}
    />
  );
}

"use client";

import Image from "next/image";

type PartrixLogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  textClassName?: string;
};

export default function PartrixLogo({
  size = 44,
  showWordmark = true,
  className = "",
  textClassName = "",
}: PartrixLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#050816] shadow-[0_8px_24px_rgba(34,211,238,0.22)]"
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/partrix-icon.png"
          alt="Partrix"
          width={size}
          height={size}
          className="h-full w-full object-contain p-1.5"
          priority={size >= 44}
        />
      </span>
      {showWordmark ? (
        <span className={`text-sm font-semibold tracking-[0.18em] text-cyan-100 ${textClassName}`}>
          Partrix
        </span>
      ) : null}
    </div>
  );
}

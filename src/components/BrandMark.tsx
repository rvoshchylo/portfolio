import { useId } from "react";

/** Original two-facet diamond mark used for the boot logo, lid and menubar. */
export function BrandMark({ size = 96, pulse = false, className = "" }: { size?: number; pulse?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={(pulse ? "brand-pulse " : "") + className}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cdb9ff" />
          <stop offset="100%" stopColor="#6f5bd8" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fb6ff" />
          <stop offset="100%" stopColor="#5e9cf5" />
        </linearGradient>
      </defs>
      <g transform="translate(50 50) rotate(45)">
        <rect x="-26" y="-26" width="26" height="52" rx="4" fill={`url(#${id}a)`} />
        <rect x="0" y="-26" width="26" height="52" rx="4" fill={`url(#${id}b)`} />
        <rect x="-26" y="-26" width="52" height="52" rx="4" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

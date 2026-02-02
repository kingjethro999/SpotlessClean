import { cn } from "@/lib/utils";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-amber-900", className)}
    >
      {/* Circular badge background */}
      <circle cx="64" cy="64" r="60" fill="currentColor" opacity="0.1" />
      <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="2" />

      {/* Hanger outline */}
      <path
        d="M64 30 L45 45 L45 85 C45 90 50 95 55 95 L73 95 C78 95 83 90 83 85 L83 45 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hanger hook */}
      <path
        d="M64 30 C68 30 70 28 70 25 C70 22 68 20 64 20 C60 20 58 22 58 25 C58 28 60 30 64 30"
        fill="currentColor"
      />

      {/* Subtle droplet for water/cleaning */}
      <path
        d="M92 50 C92 55 88 60 84 60 C80 60 76 55 76 50 C76 43 84 38 84 38 C84 38 92 43 92 50"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

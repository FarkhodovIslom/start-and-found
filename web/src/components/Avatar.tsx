/* eslint-disable @next/next/no-img-element -- avatars are user supplied URLs on arbitrary hosts. */

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  /** Display name used for the initials fallback and the alt text. */
  name: string;
  /** Remote avatar URL; an empty value renders the initials fallback. */
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

/** Derives up to two initials from a display name. */
export function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const base = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 font-semibold text-ink-2 ring-1 ring-line ${SIZE_CLASSES[size]} ${className}`.trim();

  if (src !== undefined && src !== null && src.length > 0) {
    return <img src={src} alt={name} className={`${base} object-cover`} loading="lazy" />;
  }

  return (
    <span className={base} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}

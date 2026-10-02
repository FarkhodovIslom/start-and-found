/**
 * Inline icon set.
 *
 * Drawn as SVG so the app carries no icon dependency; every icon inherits the
 * current text color and is sized by the `size` prop in pixels.
 */

export interface IconProps {
  /** Rendered width and height in pixels. */
  size?: number;
  className?: string;
}

const ICON_DEFAULTS = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Sun: follow the light scheme. */
export function SunIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg {...ICON_DEFAULTS} width={size} height={size} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
    </svg>
  );
}

/** Moon: follow the dark scheme. */
export function MoonIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg {...ICON_DEFAULTS} width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

/** Monitor: follow the operating system setting. */
export function MonitorIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg {...ICON_DEFAULTS} width={size} height={size} className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
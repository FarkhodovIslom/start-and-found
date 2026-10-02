/**
 * The colour scheme preference of the visitor.
 *
 * The choice lives in a cookie rather than in local storage so the root layout
 * can render `data-theme` on the server: the scheme is correct in the first
 * paint, and it survives a reload with JavaScript disabled. "system" keeps
 * following the operating system until the visitor picks a side.
 */

import { cookies } from "next/headers";

/** Cookie holding the selected colour scheme. */
export const THEME_COOKIE = "saf_theme";

/** Every value the cookie may carry. */
export const THEMES = ["system", "light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

/** Scheme used when nothing was chosen yet. */
export const DEFAULT_THEME: Theme = "system";

/** Narrows an untrusted value to a {@link Theme}. */
export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/** Reads the theme cookie of the current request, falling back to the default. */
export async function readTheme(): Promise<Theme> {
  const stored = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(stored) ? stored : DEFAULT_THEME;
}
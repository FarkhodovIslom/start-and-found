/** Server actions mutating state that a visitor owns without an account. */

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DEFAULT_THEME, THEME_COOKIE, isTheme } from "@/lib/theme";

/**
 * Stores the colour scheme and re-renders the tree.
 *
 * The root layout reads the cookie while rendering, so the new `data-theme`
 * reaches the client with the response of this action and no page reload is
 * needed for the change to be visible.
 */
export async function setTheme(value: string): Promise<void> {
  const jar = await cookies();
  const theme = isTheme(value) ? value : DEFAULT_THEME;

  jar.set(THEME_COOKIE, theme, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}
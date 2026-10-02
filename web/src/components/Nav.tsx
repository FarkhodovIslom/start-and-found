import Link from "next/link";
import { apiFetch } from "@/lib/api/server";
import { isSignedIn, readSession } from "@/lib/session";
import { readTheme } from "@/lib/theme";
import type { Account } from "@/lib/api/types";
import LogoutButton from "./LogoutButton";
import SessionKeeper from "./SessionKeeper";
import ThemeToggle from "./ThemeToggle";

const NAV_LINK = "text-sm text-ink-3 transition-colors hover:text-ink";

/** Application header: brand, primary navigation and the session controls. */
export default async function Nav() {
  const session = await readSession();
  const theme = await readTheme();

  let account: Account | null = null;
  if (session.accessToken !== null) {
    try {
      account = await apiFetch<Account>("/me");
    } catch {
      account = null;
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/85 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-2xl items-center gap-4 px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
          Start<span className="text-accent">&amp;</span>Found
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/" className={NAV_LINK}>
            Feed
          </Link>
          <Link href="/compose" className={NAV_LINK}>
            Compose
          </Link>

          <ThemeToggle theme={theme} />

          {account !== null ? (
            <span className="flex items-center gap-3">
              <Link href="/settings" className="text-xs text-ink-2 hover:text-accent">
                {account.handle}
              </Link>
              <LogoutButton />
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Link href="/login" className={NAV_LINK}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-accent-solid px-2.5 py-1 text-xs font-semibold text-accent-ink transition-colors hover:bg-accent-2"
              >
                Sign up
              </Link>
            </span>
          )}
        </div>
      </nav>

      <SessionKeeper enabled={account === null && isSignedIn(session)} />
    </header>
  );
}

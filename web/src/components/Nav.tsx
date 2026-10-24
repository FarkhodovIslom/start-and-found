import Link from "next/link";
import { apiFetch } from "@/lib/api/server";
import { isSignedIn, readSession } from "@/lib/session";
import { readTheme } from "@/lib/theme";
import type { Account } from "@/lib/api/types";
import Avatar from "./Avatar";
import SessionKeeper from "./SessionKeeper";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Home", icon: "home" },
] as const;

type NavIconName = (typeof LINKS)[number]["icon"] | "compose";

function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {name === "home" ? <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /> : <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>}
    </svg>
  );
}

/** Persistent primary navigation, shown as a rail on desktop and a compact bar on mobile. */
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

  const navigation = (
    <>
      {LINKS.map(({ href, label, icon }) => (
        <Link key={href} href={href} className="flex items-center gap-4 rounded-full px-3 py-3 text-[17px] font-medium text-ink transition-colors hover:bg-surface-2">
          <NavIcon name={icon} />
          <span className="hidden lg:inline">{label}</span>
        </Link>
      ))}
      {account ? (
        <Link href="/compose" className="flex items-center gap-4 rounded-full px-3 py-3 text-[17px] font-medium text-ink transition-colors hover:bg-surface-2">
          <NavIcon name="compose" />
          <span className="hidden lg:inline">Write</span>
        </Link>
      ) : null}
      {account ? (
        <Link href={`/${account.username}`} className="flex items-center gap-4 rounded-full px-3 py-3 text-[17px] font-medium text-ink transition-colors hover:bg-surface-2">
          <Avatar name={account.display_name || account.username} src={account.avatar_url} size="sm" />
          <span className="hidden lg:inline">Profile</span>
        </Link>
      ) : null}
      <Link href="/settings" className="flex items-center gap-4 rounded-full px-3 py-3 text-[17px] font-medium text-ink transition-colors hover:bg-surface-2">
        <span className="flex h-6 w-6 items-center justify-center text-xl leading-none" aria-hidden="true">···</span>
        <span className="hidden lg:inline">Settings</span>
      </Link>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen border-r border-line px-3 py-2 md:block lg:px-4">
        <div className="mx-auto flex h-full max-w-56 flex-col">
          <Link href="/" aria-label="Start & Found home" className="mb-3 flex h-12 items-center px-3 text-[22px] font-bold tracking-tight text-ink">
            <span className="lg:hidden">S<span className="text-accent">&amp;</span>F</span>
            <span className="hidden lg:inline">Start<span className="text-accent">&amp;</span>Found</span>
          </Link>
          <nav aria-label="Main navigation" className="flex flex-col gap-1">{navigation}</nav>

          {account ? (
            <Link href="/compose" className="mx-2 mt-4 hidden rounded-full bg-ink px-5 py-3 text-center text-sm font-bold text-surface transition-opacity hover:opacity-85 lg:block">Post</Link>
          ) : (
            <div className="mt-4 hidden gap-2 px-2 lg:flex">
              <Link href="/login" className="flex-1 rounded-full border border-line px-3 py-2 text-center text-sm font-semibold text-ink hover:bg-surface-2">Log in</Link>
              <Link href="/signup" className="flex-1 rounded-full bg-ink px-3 py-2 text-center text-sm font-semibold text-surface hover:opacity-85">Sign up</Link>
            </div>
          )}
        </div>
      </aside>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-line bg-surface/95 px-3 py-2 backdrop-blur md:hidden">
        {navigation}
        {account === null ? <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-ink">Log in</Link> : null}
        <ThemeToggle theme={theme} />
      </nav>
      <SessionKeeper enabled={account === null && isSignedIn(session)} />
    </>
  );
}

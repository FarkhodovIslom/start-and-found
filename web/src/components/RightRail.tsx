import Link from "next/link";
import { isSignedIn, readSession } from "@/lib/session";

/** Supporting links for the feed on wide screens. */
export default async function RightRail() {
  const canWrite = isSignedIn(await readSession());

  return (
    <aside className="sticky top-0 hidden h-screen overflow-y-auto px-6 py-4 xl:block">
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-base font-bold text-ink">Build in public</h2>
          <p className="mt-2 text-sm leading-5 text-ink-3">
            Share what you are making, find collaborators, and follow the progress of other founders.
          </p>
          {canWrite ? (
            <Link href="/compose" className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-bold text-surface transition-opacity hover:opacity-85">
              Write a post
            </Link>
          ) : null}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-base font-bold text-ink">Explore Start &amp; Found</h2>
          <div className="mt-3 flex flex-col gap-3 text-sm">
            <Link href="/signup" className="text-ink-2 transition-colors hover:text-accent">Create your account</Link>
            <Link href="/login" className="text-ink-2 transition-colors hover:text-accent">Log in to your account</Link>
            <Link href="/settings" className="text-ink-2 transition-colors hover:text-accent">Account settings</Link>
          </div>
        </div>

        <p className="px-2 text-xs leading-5 text-ink-4">Start &amp; Found · A place for founders and their projects.</p>
      </div>
    </aside>
  );
}

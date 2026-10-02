"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Clears the session through the BFF and returns to the feed. */
export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch {
      // The local cookies are cleared by the route handler even when it fails.
    }
    router.replace("/");
    router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 disabled:opacity-60"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import SettingsForm from "@/components/SettingsForm";
import ThemeToggle from "@/components/ThemeToggle";
import { errorMessage } from "@/lib/api/error";
import { apiFetch } from "@/lib/api/server";
import type { Account } from "@/lib/api/types";
import { isSignedIn, readSession } from "@/lib/session";
import { readTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await readSession();
  if (!isSignedIn(session)) redirect("/login");

  const theme = await readTheme();

  let account: Account | null = null;
  let failure: string | null = null;
  try {
    account = await apiFetch<Account>("/me");
  } catch (error) {
    failure = errorMessage(error);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-3">Update how your profile appears across the platform.</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-4">Appearance</h2>
        <ThemeToggle theme={theme} variant="segmented" />
        <p className="text-xs text-ink-4">
          System follows the setting of your operating system.
        </p>
      </section>

      {account === null ? (
        <EmptyState
          title="Your session needs to be renewed"
          description={
            failure ??
            "Your access token expired. The page re-renders automatically; if it does not, log in again."
          }
          action={
            <Link
              href="/login"
              className="rounded-lg bg-accent-solid px-3 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-2"
            >
              Log in
            </Link>
          }
        />
      ) : (
        <SettingsForm account={account} />
      )}
    </div>
  );
}

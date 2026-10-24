import { redirect } from "next/navigation";
import ComposeModal from "@/components/ComposeModal";
import PostComposer from "@/components/PostComposer";
import { apiFetch } from "@/lib/api/server";
import type { Account } from "@/lib/api/types";
import { isSignedIn, readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ComposeModalPage() {
  const session = await readSession();
  if (!isSignedIn(session)) redirect("/login");
  let account: Account;
  try {
    account = await apiFetch<Account>("/me");
  } catch {
    redirect("/login");
  }

  return (
    <ComposeModal>
      <PostComposer variant="modal" account={account} />
    </ComposeModal>
  );
}

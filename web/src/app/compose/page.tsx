import { redirect } from "next/navigation";
import PostComposer from "@/components/PostComposer";
import { isSignedIn, readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const session = await readSession();
  if (!isSignedIn(session)) redirect("/login");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-ink">New post</h1>
        <p className="text-sm text-ink-3">
          Publish as yourself or as one of your projects. Markdown is supported.
        </p>
      </div>
      <PostComposer />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import PostComposer from "@/components/PostComposer";
import ThreadTree from "@/components/ThreadTree";
import { errorMessage, isApiError } from "@/lib/api/error";
import { apiFetch } from "@/lib/api/server";
import type { ThreadView } from "@/lib/api/types";
import { isSignedIn, readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

function postCountLabel(count: number): string {
  if (count === 1) return "1 post";
  return `${count} posts`;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const session = await readSession();
  let thread: ThreadView | null = null;
  let failure: string | null = null;
  try {
    thread = await apiFetch<ThreadView>(`/threads/${encodeURIComponent(id)}`);
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound();
    failure = errorMessage(error);
  }

  if (thread === null) {
    return (
      <EmptyState
        tone="error"
        title="This thread is unavailable"
        description={failure ?? undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-lg font-semibold text-ink">Thread</h1>
        <p className="text-xs text-ink-4">{postCountLabel(thread.post_count)}</p>
      </div>

      <ThreadTree root={thread.root} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-4">Reply</h2>
        {isSignedIn(session) ? (
          <PostComposer replyTo={thread.root.post.id} />
        ) : (
          <EmptyState
            title="Log in to reply"
            description="Only members with an account can answer this thread."
            action={
              <Link
                href="/login"
                className="rounded-lg bg-accent-solid px-3 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-2"
              >
                Log in
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}

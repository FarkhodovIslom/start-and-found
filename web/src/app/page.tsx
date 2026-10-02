import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import PostCard from "@/components/PostCard";
import { errorMessage } from "@/lib/api/error";
import { apiFetch } from "@/lib/api/server";
import type { Page, Post } from "@/lib/api/types";
import { PAGE_SIZE, firstValue } from "@/lib/params";

export const dynamic = "force-dynamic";

interface FeedPageProps {
  searchParams: Promise<{ cursor?: string | string[] }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const cursor = firstValue(params.cursor);

  let page: Page<Post> | null = null;
  let failure: string | null = null;
  try {
    page = await apiFetch<Page<Post>>("/feed", {
      query: { limit: PAGE_SIZE, cursor },
    });
  } catch (error) {
    failure = errorMessage(error);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-lg font-semibold text-ink">Feed</h1>
        <Link href="/compose" className="text-sm text-accent hover:underline">
          New post
        </Link>
      </div>

      {page === null ? (
        <EmptyState
          tone="error"
          title="The feed is unavailable"
          description={failure ?? undefined}
        />
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Posts from founders and their projects show up here. Be the first to publish something."
          action={
            <Link
              href="/compose"
              className="rounded-lg bg-accent-solid px-3 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-2"
            >
              Write a post
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {page.items.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-center gap-3 pt-2">
            {cursor !== undefined ? (
              <Link
                href="/"
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-line-strong"
              >
                Back to the top
              </Link>
            ) : null}
            {page.next_cursor !== undefined ? (
              <Link
                href={{ pathname: "/", query: { cursor: page.next_cursor } }}
                prefetch={false}
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-line-strong"
              >
                Load more
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

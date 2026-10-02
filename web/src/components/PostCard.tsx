/* eslint-disable @next/next/no-img-element -- post media is served from the storage configured for the API. */

import Link from "next/link";
import Avatar from "./Avatar";
import MarkdownBody from "./MarkdownBody";
import PublisherBadge from "./PublisherBadge";
import type { Media, Post } from "@/lib/api/types";
import { relativeTime, replyLabel } from "@/lib/format";

export interface PostCardProps {
  post: Post;
  /** Hide the thread link when the card is already rendered inside a thread. */
  showThreadLink?: boolean;
  className?: string;
}

function MediaGrid({ media }: { media: Media[] }) {
  const columns = media.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={`mt-3 grid gap-2 ${columns}`}>
      {media.map((item) => (
        <div
          key={item.id}
          className="max-h-96 overflow-hidden rounded-lg border border-line bg-surface-2"
        >
          {item.kind === "video" ? (
            <video
              src={item.url}
              controls
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={item.url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** One post of a feed or a thread. */
export default function PostCard({
  post,
  showThreadLink = true,
  className = "",
}: PostCardProps) {
  const authorName =
    post.author.display_name.length > 0 ? post.author.display_name : post.author.username;

  return (
    <article
      className={`rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <Link href={`/${post.author.username}`} className="shrink-0">
          <Avatar name={authorName} src={post.author.avatar_url} size="sm" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/${post.author.username}`}
              className="max-w-full truncate text-sm font-semibold text-ink hover:underline"
            >
              {authorName}
            </Link>
            <PublisherBadge
              handle={post.publisher_handle}
              kind={post.publisher_kind}
              className="text-xs text-ink-3"
            />
            <time dateTime={post.created_at} className="text-xs text-ink-4">
              {relativeTime(post.created_at)}
            </time>
          </div>

          <div className="mt-2">
            <MarkdownBody body={post.body} />
          </div>

          {post.media.length > 0 ? <MediaGrid media={post.media} /> : null}

          {showThreadLink ? (
            <div className="mt-3 text-xs">
              <Link
                href={`/p/${post.id}`}
                className="text-ink-3 transition-colors hover:text-accent"
              >
                {replyLabel(post.reply_count)}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

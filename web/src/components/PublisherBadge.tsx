import Link from "next/link";
import type { PublisherKind } from "@/lib/api/types";

export interface PublisherBadgeProps {
  /** "@hanzo" for users, "@hanzo/sonarai" for projects. */
  handle: string;
  kind: PublisherKind;
  className?: string;
}

/** Maps a publishing handle to its public route ("/hanzo/sonarai"). */
export function publisherPath(handle: string): string {
  const segments = handle
    .split("/")
    .map((segment) => segment.replace(/^@/, ""))
    .filter((segment) => segment.length > 0);
  return `/${segments.join("/")}`;
}

/** Renders the publishing identity as a link to the user or project profile. */
export default function PublisherBadge({
  handle,
  kind,
  className = "",
}: PublisherBadgeProps) {
  const isProject = kind === "project";
  const label = isProject ? "Project" : null;

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`.trim()}>
      {label !== null ? (
        <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          {label}
        </span>
      ) : null}
      <Link
        href={publisherPath(handle)}
        className="truncate transition-colors hover:text-accent"
        title={isProject ? `Project ${handle}` : `User ${handle}`}
      >
        {handle}
      </Link>
    </span>
  );
}

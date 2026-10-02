import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import PostCard from "@/components/PostCard";
import ProjectCard from "@/components/ProjectCard";
import { errorMessage, isApiError } from "@/lib/api/error";
import { apiFetch } from "@/lib/api/server";
import type { ActivityScope, Page, Post, ProfileView } from "@/lib/api/types";
import { PAGE_SIZE, firstValue, parseScope } from "@/lib/params";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ scope?: string | string[]; cursor?: string | string[] }>;
}

const SCOPE_TABS: { value: ActivityScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "user", label: "Personal" },
  { value: "projects", label: "Projects" },
];

function activityHref(
  username: string,
  scope: ActivityScope,
  cursor: string | undefined,
): { pathname: string; query: Record<string, string> } {
  const query: Record<string, string> = {};
  if (scope !== "all") query.scope = scope;
  if (cursor !== undefined) query.cursor = cursor;
  return { pathname: `/${username}`, query };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const search = await searchParams;
  const scope = parseScope(firstValue(search.scope));
  const cursor = firstValue(search.cursor);
  const userPath = `/users/${encodeURIComponent(username)}`;

  let profile: ProfileView;
  try {
    profile = await apiFetch<ProfileView>(userPath, { query: { limit: PAGE_SIZE } });
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound();
    return (
      <EmptyState
        tone="error"
        title="This profile is unavailable"
        description={errorMessage(error)}
      />
    );
  }

  let activity: Page<Post> | null = null;
  let activityFailure: string | null = null;
  try {
    activity =
      scope === "all"
        ? profile.posts
        : await apiFetch<Page<Post>>(`${userPath}/posts`, {
            query: { scope, limit: PAGE_SIZE, cursor },
          });
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound();
    activityFailure = errorMessage(error);
  }

  const displayName =
    profile.user.display_name.length > 0 ? profile.user.display_name : profile.user.username;

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-line bg-surface p-5">
        <div className="flex items-start gap-4">
          <Avatar name={displayName} src={profile.user.avatar_url} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-ink">{displayName}</h1>
            <p className="text-sm text-ink-4">{profile.user.handle}</p>
            {profile.user.bio.length > 0 ? (
              <p className="mt-3 text-sm text-ink-3">{profile.user.bio}</p>
            ) : null}
            <p className="mt-3 text-xs text-ink-4">
              Joined {relativeTime(profile.user.created_at)}
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-4">Projects</h2>
        {profile.projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description={`${displayName} has not showcased a project yet.`}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-4">Activity</h2>
          <nav className="flex items-center gap-1 rounded-lg border border-line p-0.5">
            {SCOPE_TABS.map((tab) => (
              <Link
                key={tab.value}
                href={activityHref(username, tab.value, undefined)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  tab.value === scope ? "bg-surface-2 text-ink" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        {activity === null ? (
          <EmptyState
            tone="error"
            title="Activity is unavailable"
            description={activityFailure ?? undefined}
          />
        ) : activity.items.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description={
              scope === "projects"
                ? "No project published a post yet."
                : "This profile has no activity yet."
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {activity.items.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-center gap-3 pt-2">
              {cursor !== undefined ? (
                <Link
                  href={activityHref(username, scope, undefined)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-line-strong"
                >
                  Back to the top
                </Link>
              ) : null}
              {activity.next_cursor !== undefined ? (
                <Link
                  href={activityHref(username, scope, activity.next_cursor)}
                  prefetch={false}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-line-strong"
                >
                  Load more
                </Link>
              ) : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

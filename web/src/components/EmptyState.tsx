import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional call to action rendered below the copy. */
  action?: ReactNode;
  /** `error` renders the state as a failure instead of an empty result. */
  tone?: "neutral" | "error";
}

/** Neutral panel used for empty collections and unreachable data. */
export default function EmptyState({
  title,
  description,
  action,
  tone = "neutral",
}: EmptyStateProps) {
  const surface =
    tone === "error"
      ? "border-danger/30 bg-danger/5"
      : "border-line bg-surface";

  return (
    <div className={`rounded-xl border px-5 py-8 text-center ${surface}`}>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description !== undefined ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-3">{description}</p>
      ) : null}
      {action !== undefined ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

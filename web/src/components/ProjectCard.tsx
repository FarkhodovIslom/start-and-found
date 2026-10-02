import Link from "next/link";
import Avatar from "./Avatar";
import type { Project, ProjectStatus } from "@/lib/api/types";

export interface ProjectCardProps {
  project: Project;
  className?: string;
}

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  idea: "border-line-strong bg-surface-2 text-ink-2",
  building: "border-warning/30 bg-warning/10 text-warning",
  launched: "border-success/30 bg-success/10 text-success",
  paused: "border-paused/30 bg-paused/10 text-paused",
  archived: "border-line bg-surface-2 text-ink-3",
};

/** Coloured pill rendering the lifecycle status of a project. */
export function ProjectStatusPill({
  status,
  className = "",
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const styles = STATUS_CLASSES[status] ?? STATUS_CLASSES.idea;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${styles} ${className}`.trim()}
    >
      {status}
    </span>
  );
}

/** Showcase card of a project on a profile page. */
export default function ProjectCard({ project, className = "" }: ProjectCardProps) {
  return (
    <Link
      href={`/${project.owner_username}/${project.slug}`}
      className={`group flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40 ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <Avatar name={project.name} src={project.logo_url} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-ink group-hover:text-accent">
              {project.name}
            </h3>
            <ProjectStatusPill status={project.status} />
          </div>
          <p className="truncate text-xs text-ink-4">{project.handle}</p>
        </div>
      </div>

      {project.description.length > 0 ? (
        <p className="line-clamp-3 text-sm text-ink-3">{project.description}</p>
      ) : null}

      {project.category.length > 0 ? (
        <p className="text-xs text-ink-4">{project.category}</p>
      ) : null}
    </Link>
  );
}

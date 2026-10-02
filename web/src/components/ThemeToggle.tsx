"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { setTheme } from "@/app/actions";
import type { Theme } from "@/lib/theme";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

export interface ThemeToggleProps {
  /** Scheme the server rendered before this control was mounted. */
  theme: Theme;
  /** `icon` cycles the three schemes in one button, `segmented` shows all of them. */
  variant?: "icon" | "segmented";
}

const OPTIONS = [
  { value: "system", label: "System", Icon: MonitorIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
] as const;

/** Order the compact button walks through. */
const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };

const BUTTON_CLASSES = "rounded-md px-2.5 py-1 text-xs transition-colors disabled:opacity-60";

function labelOf(theme: Theme): string {
  return OPTIONS.find((option) => option.value === theme)?.label ?? "System";
}

/**
 * Colour scheme control.
 *
 * The choice is stored by a server action, so the response re-renders the root
 * layout with the new `data-theme`; the switch is never a flash of the old
 * scheme. While that request is in flight the control stays disabled.
 */
export default function ThemeToggle({ theme, variant = "icon" }: ThemeToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const options = useRef<(HTMLButtonElement | null)[]>([]);

  function choose(value: Theme) {
    if (pending || value === theme) return;
    startTransition(async () => {
      await setTheme(value);
      router.refresh();
    });
  }

  /** Arrow and Home/End keys, as a single-choice group is expected to answer them. */
  function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0 && event.key !== "Home" && event.key !== "End") return;

    event.preventDefault();
    const target =
      event.key === "Home" ? 0 : event.key === "End" ? OPTIONS.length - 1 : index + step;
    const wrapped = (target + OPTIONS.length) % OPTIONS.length;
    options.current[wrapped]?.focus();
    choose(OPTIONS[wrapped].value);
  }

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Colour scheme"
        className="flex items-center gap-1 rounded-lg border border-line p-0.5"
      >
        {OPTIONS.map(({ value, label, Icon }, index) => (
          <button
            key={value}
            ref={(node) => {
              options.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={value === theme}
            tabIndex={value === theme ? 0 : -1}
            disabled={pending}
            onClick={() => choose(value)}
            onKeyDown={(event) => moveFocus(event, index)}
            className={`flex items-center gap-1.5 ${BUTTON_CLASSES} ${
              value === theme ? "bg-surface-2 text-ink" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    );
  }

  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[0];
  const next = NEXT[current.value];
  const nextLabel = labelOf(next).toLowerCase();
  const CurrentIcon = current.Icon;

  return (
    <button
      type="button"
      onClick={() => choose(next)}
      disabled={pending}
      title={`Colour scheme: ${current.label}. Switch to ${nextLabel}.`}
      aria-label={`Colour scheme: ${current.label}. Switch to ${nextLabel}.`}
      className="flex items-center rounded-lg border border-line p-1 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 disabled:opacity-60"
    >
      <CurrentIcon size={14} />
    </button>
  );
}
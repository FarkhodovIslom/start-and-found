"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function ComposeModal({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  function close() {
    router.back();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 px-3 py-8 sm:items-center sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-modal-title"
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      >
        <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-line px-4 py-3">
          <button
            type="button"
            onClick={close}
            aria-label="Close new post dialog"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h1 id="compose-modal-title" className="text-sm font-semibold text-ink">
            New post
          </h1>
          <span />
        </header>
        <div className="max-h-[calc(100dvh-7rem)] overflow-y-auto p-4">{children}</div>
      </section>
    </div>
  );
}

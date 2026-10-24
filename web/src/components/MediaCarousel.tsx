"use client";

/* eslint-disable @next/next/no-img-element -- media is served from arbitrary storage hosts. */

import { useRef, useState } from "react";
import type { Media } from "@/lib/api/types";

function MediaItem({ item, carousel = false }: { item: Media; carousel?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-line bg-surface-2 ${
        carousel ? "h-80 w-[78%] shrink-0 snap-start sm:h-96 sm:w-[62%]" : "max-h-96 w-full"
      }`}
    >
      {item.kind === "video" ? (
        <video
          src={item.url}
          controls
          preload="metadata"
          className={carousel ? "h-full w-full object-contain" : "h-full w-full object-cover"}
        />
      ) : (
        <img
          src={item.url}
          alt=""
          loading="lazy"
          className={carousel ? "h-full w-full object-contain" : "max-h-96 w-full object-contain"}
        />
      )}
    </div>
  );
}

/** Displays one attachment directly or multiple attachments in a swipeable carousel. */
export default function MediaCarousel({ media }: { media: Media[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 1) {
    return (
      <div className="mt-3">
        <MediaItem item={media[0]} />
      </div>
    );
  }

  function goTo(index: number) {
    const viewport = viewportRef.current;
    const slide = viewport?.children.item(index);
    if (viewport === null || !(slide instanceof HTMLElement)) return;
    viewport.scrollTo({ left: slide.offsetLeft - viewport.offsetLeft, behavior: "smooth" });
  }

  function updateActiveIndex() {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    const slides = Array.from(viewport.children);
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const distance = Math.abs((slide as HTMLElement).offsetLeft - viewport.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveIndex(nearestIndex);
  }

  return (
    <div className="relative mt-3">
      <div
        ref={viewportRef}
        role="region"
        aria-label="Post attachments"
        tabIndex={0}
        onScroll={updateActiveIndex}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {media.map((item) => (
          <MediaItem key={item.id} item={item} carousel />
        ))}
      </div>

      <button
        type="button"
        onClick={() => goTo(Math.max(0, activeIndex - 1))}
        disabled={activeIndex === 0}
        aria-label="Previous attachment"
        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-sm transition-opacity hover:bg-surface disabled:pointer-events-none disabled:opacity-0"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        onClick={() => goTo(Math.min(media.length - 1, activeIndex + 1))}
        disabled={activeIndex === media.length - 1}
        aria-label="Next attachment"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-sm transition-opacity hover:bg-surface disabled:pointer-events-none disabled:opacity-0"
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="mt-2 flex justify-center gap-1.5" aria-label="Attachment position">
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Show attachment ${index + 1} of ${media.length}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-4 bg-ink-2" : "w-1.5 bg-line-strong hover:bg-ink-4"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

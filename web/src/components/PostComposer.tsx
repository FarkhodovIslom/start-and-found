"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mediaApi, postsApi, publishersApi } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import type { Publisher } from "@/lib/api/types";

export interface PostComposerProps {
  /** When set, the composer answers this post instead of starting a thread. */
  replyTo?: string;
  placeholder?: string;
}

/** Attachments accepted by one submission. */
const MAX_ATTACHMENTS = 4;

/**
 * Composer for new posts and replies.
 *
 * Publishing happens through the BFF proxy, and an optional attachment is
 * uploaded straight to object storage with a presigned URL before the post is
 * created. On success the surrounding server components are re-rendered.
 */
export default function PostComposer({ replyTo, placeholder }: PostComposerProps) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState("");
  const [as, setAs] = useState("");
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReply = replyTo !== undefined && replyTo.length > 0;

  useEffect(() => {
    let active = true;
    publishersApi
      .list()
      .then((items) => {
        if (active) setPublishers(items);
      })
      .catch(() => {
        if (active) setPublishers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, MAX_ATTACHMENTS);
    setFiles(selected);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (text.length === 0 || pending) return;

    setPending(true);
    setError(null);
    try {
      const mediaIds: string[] = [];
      for (const file of files) {
        const upload = await mediaApi.presign({
          filename: file.name,
          content_type: file.type.length > 0 ? file.type : "application/octet-stream",
          size_bytes: file.size,
        });
        await mediaApi.upload(upload, file);
        const media = await mediaApi.complete(upload.media_id);
        mediaIds.push(media.id);
      }

      const input = { as, body: text, media_ids: mediaIds };
      if (isReply && replyTo !== undefined) {
        await postsApi.reply(replyTo, input);
      } else {
        await postsApi.create(input);
      }

      setBody("");
      setFiles([]);
      if (fileInput.current !== null) fileInput.current.value = "";
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Your post could not be published. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface p-4"
    >
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={isReply ? 3 : 5}
        disabled={pending}
        placeholder={placeholder ?? (isReply ? "Write a reply…" : "Share what you are building…")}
        className="w-full resize-y rounded-lg border border-line bg-surface-2 p-3 text-sm text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none disabled:opacity-60"
      />

      {files.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-ink-3"
            >
              {file.name}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-3">
          <span className="whitespace-nowrap text-xs uppercase tracking-wide">Post as</span>
          <select
            value={as}
            onChange={(event) => setAs(event.target.value)}
            disabled={pending}
            className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm text-ink-2 focus:border-accent focus:outline-none disabled:opacity-60"
          >
            <option value="">Myself</option>
            {publishers.map((publisher) => (
              <option key={publisher.id} value={publisher.handle}>
                {publisher.handle}
              </option>
            ))}
          </select>
        </label>

        <label className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-line-strong">
          Attach
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4"
            onChange={handleFileSelection}
            disabled={pending}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={pending || body.trim().length === 0}
          className="ml-auto rounded-lg bg-accent-solid px-4 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3"
        >
          {pending ? "Publishing…" : isReply ? "Reply" : "Publish"}
        </button>
      </div>

      {error !== null ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}

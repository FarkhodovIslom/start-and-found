"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { mediaApi, meApi } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";

/** Image formats the API accepts for a file. Mirrors the Go allowedTypes map. */
const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif";

/** Largest avatar the API accepts. Matches the 25 MiB cap for images. */
const MAX_BYTES = 25 << 20;

export interface AvatarUploadProps {
  /** Display name used for the initials fallback and the alt text. */
  name: string;
  /** Currently stored avatar URL, empty when the fallback is shown. */
  value: string;
  /** Blocks interaction while the surrounding form is saving. */
  disabled?: boolean;
  /** Receives the new URL (or an empty string when the avatar is removed). */
  onChange: (url: string) => void;
}

/**
 * Avatar picker that uploads a file to object storage instead of asking for a
 * link. The file goes straight to the bucket through a presigned URL, and the
 * resulting media URL is persisted with PATCH /me straight away so a failed
 * save cannot silently discard an uploaded avatar.
 */
export default function AvatarUpload({ name, value, disabled = false, onChange }: AvatarUploadProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Object URL of the picked file, so the preview appears before the upload
  // finishes. Revoked on replacement and on unmount to avoid leaking blobs.
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview !== null) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const locked = disabled || pending;
  const preview = localPreview ?? (value.length > 0 ? value : null);

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      setError("Pick an image that is no larger than 25 MB.");
      return;
    }

    const previewURL = URL.createObjectURL(file);
    setLocalPreview(previewURL);
    setPending(true);
    setError(null);
    try {
      const uploadTicket = await mediaApi.presign({
        filename: file.name,
        content_type: file.type.length > 0 ? file.type : "application/octet-stream",
        size_bytes: file.size,
      });
      await mediaApi.upload(uploadTicket, file);
      const media = await mediaApi.complete(uploadTicket.media_id);
      await meApi.update({ avatar_url: media.url });
      onChange(media.url);
    } catch (caught) {
      URL.revokeObjectURL(previewURL);
      setLocalPreview(null);
      setError(
        caught instanceof ApiError ? caught.message : "The avatar could not be uploaded.",
      );
    } finally {
      setPending(false);
    }
  }

  function handleSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Allow re-picking the same file after a failed attempt.
    event.target.value = "";
    if (file === undefined) return;
    void upload(file);
  }

  async function remove() {
    setPending(true);
    setError(null);
    try {
      await meApi.update({ avatar_url: "" });
      if (localPreview !== null) URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
      onChange("");
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "The avatar could not be removed.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={preview} size="lg" />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={locked}
            className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Uploading…" : preview === null ? "Upload avatar" : "Replace avatar"}
          </button>
          {preview !== null ? (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={locked}
              className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleSelection}
        className="hidden"
        aria-label="Avatar image"
      />

      <p className="text-xs text-ink-4">PNG, JPEG, WebP or GIF, up to 25 MB.</p>
      {error !== null ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

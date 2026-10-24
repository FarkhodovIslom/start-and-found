package media

import (
	"context"
	"fmt"
	"net/http"
	"path"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/gtrirf/start-and-found/api/internal/platform/apierr"
	"github.com/gtrirf/start-and-found/api/internal/platform/ids"
	"github.com/gtrirf/start-and-found/api/internal/platform/storage"
)

// ObjectStore is the part of the storage client the media domain needs.
type ObjectStore interface {
	PresignPut(ctx context.Context, key string, expiry time.Duration) (string, error)
	PublicURL(key string) string
	Stat(ctx context.Context, key string) (int64, string, error)
	Remove(ctx context.Context, key string) error
}

type allowedType struct {
	kind    string
	maxSize int64
}

// allowedTypes maps accepted content types to their kind and size cap.
var allowedTypes = map[string]allowedType{
	"image/png":  {kind: KindImage, maxSize: 25 << 20},
	"image/jpeg": {kind: KindImage, maxSize: 25 << 20},
	"image/webp": {kind: KindImage, maxSize: 25 << 20},
	"image/gif":  {kind: KindGIF, maxSize: 25 << 20},
	"video/mp4":  {kind: KindVideo, maxSize: 100 << 20},
	"video/webm": {kind: KindVideo, maxSize: 100 << 20},
}

// Service implements the presign/complete upload flow.
type Service struct {
	media *Repository
	store ObjectStore
}

// NewService wires the media service.
func NewService(mediaRepo *Repository, store ObjectStore) *Service {
	return &Service{media: mediaRepo, store: store}
}

// Presign authorizes an upload and returns the URL the client must PUT the file
// to. Nothing is created in the database until the client asks to complete it.
func (s *Service) Presign(ctx context.Context, ownerID uuid.UUID, input PresignInput) (Upload, error) {
	filename := strings.TrimSpace(path.Base(strings.ReplaceAll(input.Filename, "\\", "/")))
	if filename == "" || filename == "." || filename == "/" {
		return Upload{}, apierr.Validation("filename is required", map[string]any{"field": "filename"})
	}

	contentType := strings.ToLower(strings.TrimSpace(input.ContentType))
	allowed, ok := allowedTypes[contentType]
	if !ok {
		return Upload{}, apierr.Validation("unsupported content type", map[string]any{
			"field":   "content_type",
			"allowed": allowedContentTypes(),
		})
	}
	if input.SizeBytes <= 0 {
		return Upload{}, apierr.Validation("size_bytes must be greater than zero", map[string]any{"field": "size_bytes"})
	}
	if input.SizeBytes > allowed.maxSize {
		return Upload{}, apierr.Validation(
			fmt.Sprintf("%s uploads must not exceed %d bytes", allowed.kind, allowed.maxSize),
			map[string]any{"field": "size_bytes"},
		)
	}

	mediaID := ids.New()
	key := storage.ObjectKey(ownerID.String(), mediaID.String(), filename)

	uploadURL, err := s.store.PresignPut(ctx, key, UploadURLTTL)
	if err != nil {
		return Upload{}, apierr.ServiceUnavailable("object storage is unavailable").WithCause(err)
	}

	item := &Media{
		ID:          mediaID,
		OwnerUserID: ownerID,
		Kind:        allowed.kind,
		MimeType:    contentType,
		Filename:    filename,
		SizeBytes:   input.SizeBytes,
		StorageKey:  key,
		Status:      StatusPending,
	}
	if err := s.media.Create(ctx, item); err != nil {
		return Upload{}, err
	}

	return Upload{
		MediaID:    mediaID,
		StorageKey: key,
		UploadURL:  uploadURL,
		Method:     http.MethodPut,
		ExpiresAt:  time.Now().Add(UploadURLTTL),
		Headers:    map[string]string{"Content-Type": contentType},
	}, nil
}

// Complete verifies that the object reached the bucket and marks the upload as
// finished, which makes it attachable to a post.
func (s *Service) Complete(ctx context.Context, ownerID, mediaID uuid.UUID) (Media, error) {
	item, err := s.media.ByID(ctx, mediaID)
	if err != nil {
		return Media{}, err
	}
	if item.OwnerUserID != ownerID {
		// Media of other users is reported as missing rather than forbidden.
		return Media{}, apierr.NotFound("media not found")
	}

	size, _, err := s.store.Stat(ctx, item.StorageKey)
	if err != nil {
		return Media{}, apierr.NotFound("upload was not found in object storage").WithCause(err)
	}

	updated, err := s.media.MarkUploaded(ctx, mediaID, size)
	if err != nil {
		return Media{}, err
	}
	updated.URL = s.store.PublicURL(updated.StorageKey)
	return updated, nil
}

// ByID returns the metadata of a stored file.
func (s *Service) ByID(ctx context.Context, mediaID uuid.UUID) (Media, error) {
	item, err := s.media.ByID(ctx, mediaID)
	if err != nil {
		return Media{}, err
	}
	item.URL = s.store.PublicURL(item.StorageKey)
	return item, nil
}

func allowedContentTypes() []string {
	types := make([]string, 0, len(allowedTypes))
	for contentType := range allowedTypes {
		types = append(types, contentType)
	}
	sort.Strings(types)
	return types
}

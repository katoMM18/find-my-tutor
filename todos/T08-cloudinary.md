# T08 — Cloudinary uploads and document access

**Status:** done

## Goal

Store profile images and qualification documents in Cloudinary while keeping
private documents protected.

## Implementation steps

- [x] Add signed upload service with MIME, size, and dimension validation.
- [x] Store Cloudinary public IDs and metadata, not uploaded files in MongoDB.
- [x] Add ownership checks for upload, replace, and delete actions.
- [x] Use private delivery or signed URLs for certificates and licenses.
- [x] Add profile image and qualification upload UI.
- [x] Enforce a 3 MB limit and optimize all images to WebP with Sharp before upload.

## Acceptance criteria

- Invalid file types and oversized files are rejected.
- A user cannot access or mutate another user's private document.
- Qualification document URLs cannot be used as unauthenticated public access.

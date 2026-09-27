-- Add the public recruiter-resume purpose before any row uses it.
-- PostgreSQL cannot use a new enum value in the same transaction that adds it.
-- resume_pdf remains a separate kind and is not granted this purpose.

ALTER TYPE public.media_purpose ADD VALUE IF NOT EXISTS 'public_resume';

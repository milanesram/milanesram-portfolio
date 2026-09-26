-- Add the private CV request choice before any function uses it.
-- PostgreSQL cannot use a new enum value in the same transaction that adds it.
-- Existing rows stay valid. This does not add a public resume track.

ALTER TYPE public.resume_request_choice ADD VALUE IF NOT EXISTS 'professional_cv';

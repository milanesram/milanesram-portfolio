-- Local/Git foundation only. Do not apply to hosted or local Supabase in
-- Step 49B. Does not insert publication or media rows, alter Storage, or
-- change publication RLS.
--
-- document_kind is editorial/document format. Career domains stay on
-- track_tag. Display labels belong in the presentation layer.
-- rights_status routes PDF vs publisher-link vs draft-until-reviewed.
-- media_id is for rights-cleared hosted PDFs only.

CREATE TYPE public.document_kind AS ENUM (
  'publication',
  'white_paper',
  'editorial',
  'feature',
  'four_minute_read',
  'other'
);

CREATE TYPE public.publication_rights_status AS ENUM (
  'host_pdf',
  'link_only',
  'review_required'
);

ALTER TABLE public.publications
  ADD COLUMN document_kind public.document_kind NOT NULL,
  ADD COLUMN rights_status public.publication_rights_status NOT NULL DEFAULT 'review_required',
  ADD COLUMN author text,
  ADD COLUMN media_id uuid;

ALTER TABLE public.publications
  ADD CONSTRAINT publications_media_id_fkey
  FOREIGN KEY (media_id)
  REFERENCES public.media_assets(id)
  ON DELETE SET NULL;

ALTER TABLE public.publications
  ADD CONSTRAINT publications_media_requires_host_pdf
  CHECK (media_id IS NULL OR rights_status = 'host_pdf'::public.publication_rights_status);

COMMENT ON COLUMN public.publications.document_kind IS
  'Editorial/document format. Cybersecurity, privacy, GRC, and AI are tracks, not kinds.';
COMMENT ON COLUMN public.publications.rights_status IS
  'host_pdf may attach a hosted PDF; link_only uses the original source; review_required stays draft.';
COMMENT ON COLUMN public.publications.author IS
  'Public byline. NULL means the site identity.';
COMMENT ON COLUMN public.publications.media_id IS
  'Rights-cleared hosted PDF only. ON DELETE SET NULL. Do not point link-only rows at media.';

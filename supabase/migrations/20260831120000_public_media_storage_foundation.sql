-- Local/Git foundation only. Do not apply to hosted or local Supabase in
-- Step 48B. Does not insert media rows or upload objects.
--
-- public-media is for approved public binaries only:
--   Category-1 professional PDFs with confirmed redistribution rights,
--   portrait, journey photographs, project screenshots, and later
--   explicitly authorized public resume PDFs.
-- Do not place drafts, the comprehensive CV, private-source files,
-- client-confidential material, or arbitrary user uploads here.
-- Draft metadata may exist on media_assets without a public-media object.
--
-- Future object path: {purpose}/{media_uuid}/{normalized_filename}
-- UUID is media_assets.id. Filenames are normalized (no spaces, no
-- traversal, no emails, no original local paths). New versions use a new
-- path or a new media row.

CREATE TYPE public.media_purpose AS ENUM (
  'portrait',
  'journey',
  'project',
  'publication',
  'resume'
);

ALTER TABLE public.media_assets
  ADD COLUMN purpose public.media_purpose,
  ADD COLUMN mime_type text,
  ADD COLUMN byte_size bigint,
  ADD COLUMN caption text,
  ADD COLUMN credit text,
  ADD COLUMN year_label text,
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_byte_size_positive CHECK (
    byte_size IS NULL OR byte_size > 0
  );

ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_mime_type_allowed CHECK (
    mime_type IS NULL
    OR mime_type IN (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif'
    )
  );

ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_kind_purpose_match CHECK (
    purpose IS NULL
    OR (
      kind = 'image'
      AND purpose IN (
        'portrait'::public.media_purpose,
        'journey'::public.media_purpose,
        'project'::public.media_purpose
      )
    )
    OR (
      kind = 'document'
      AND purpose = 'publication'::public.media_purpose
    )
    OR (
      kind = 'resume_pdf'
      AND purpose = 'resume'::public.media_purpose
    )
  );

COMMENT ON COLUMN public.media_assets.purpose IS
  'Binary catalog role. Domain/topic tags belong on publications, not here.';
COMMENT ON COLUMN public.media_assets.caption IS
  'Public editorial caption/context for images.';
COMMENT ON COLUMN public.media_assets.credit IS
  'Photographer, organization, or other attribution.';

-- Public presentation fields for rows already visible under
-- media_assets_select_public (published AND is_public). bucket_path is
-- not a secret for those rows: the object is intended to be fetched at a
-- public URL. Draft and private rows remain hidden by RLS, so their
-- paths are not granted to anon.
REVOKE SELECT ON TABLE public.media_assets FROM anon;

GRANT SELECT (
  id,
  bucket_path,
  kind,
  purpose,
  title,
  alt_text,
  caption,
  credit,
  year_label,
  mime_type,
  byte_size,
  sort_order,
  is_public,
  status
) ON TABLE public.media_assets TO anon;

-- Official Storage schema includes file_size_limit and allowed_mime_types
-- on storage.buckets. 15 MB bucket cap. Images should still be optimized
-- well below this; documents preferably under 10 MB.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
SELECT
  'public-media',
  'public-media',
  true,
  15728640,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]::text[]
WHERE NOT EXISTS (
  SELECT 1
  FROM storage.buckets
  WHERE id = 'public-media'
);

-- Public buckets serve object URLs without storage.objects SELECT.
-- Do not grant anonymous listing. Writes are owner/admin only.
CREATE POLICY public_media_objects_admin_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public-media'
    AND (SELECT public.is_admin())
  );

CREATE POLICY public_media_objects_admin_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public-media'
    AND (SELECT public.is_admin())
  )
  WITH CHECK (
    bucket_id = 'public-media'
    AND (SELECT public.is_admin())
  );

CREATE POLICY public_media_objects_admin_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public-media'
    AND (SELECT public.is_admin())
  );

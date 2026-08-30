-- Forward-only grant correction. Does not create Storage or change RLS.
-- RLS still decides which media_assets rows anon may see
-- (status = published AND is_public = true).
-- Column privileges decide which fields those rows expose.
-- RLS cannot by itself hide bucket_path from an otherwise selectable
-- published/public row.

REVOKE SELECT ON TABLE public.media_assets FROM anon;

GRANT SELECT (
  id,
  kind,
  title,
  alt_text,
  is_public,
  status
) ON TABLE public.media_assets TO anon;

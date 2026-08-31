-- Hosted metadata for the already-public NCSP localization paper.
-- Publisher-hosted only. No media row. No Storage object. No PDF.
--
-- Reproduces the static /writing record from src/content/publications.ts.
-- Author byline is taken from the existing publisher page named in
-- external_url. Plain INSERT so an existing UUID or slug fails rather
-- than overwrite. Does not update the ten owner-controlled rows.

INSERT INTO public.publications (
  id,
  slug,
  title,
  publisher,
  published_on,
  year_label,
  abstract,
  external_url,
  track,
  status,
  sort_order,
  document_kind,
  rights_status,
  author,
  media_id
) VALUES (
  '008d2f4a-6106-49a3-91b9-d32bbf7ffe55',
  'ncsp-localization-local-government-units',
  'Localization of the National Cybersecurity Plan (NCSP) 2023-2028 for Local Government Units',
  'Friedrich Naumann Foundation for Freedom',
  NULL,
  '2025',
  'A policy paper on localizing the Philippines’ National Cybersecurity Plan 2023–2028 so national standards can be implemented at the local-government level.',
  'https://www.freiheit.org/philippines/fnf-philippines-advocates-localization-national-cybersecurity-plan-local-government',
  'all',
  'published',
  110,
  'publication',
  'link_only',
  'John Henry D. Naga, Ivin Ronald D.M. Alzona, and Rainier Anthony M. Milanes',
  NULL
);

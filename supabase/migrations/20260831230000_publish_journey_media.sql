-- Publish the six frozen Professional Journey image rows after
-- application source cutover. UUID-bound UPDATEs only.
-- Each row must still be draft/non-public with the exact kind,
-- purpose, path, and byte size or the UPDATE matches zero rows
-- and the assertion fails.
--
-- No INSERT, DELETE, UPSERT, schema, RLS, or Storage SQL.

UPDATE public.media_assets
SET
  status = 'published',
  is_public = true
WHERE
  id = '08faae9f-c586-4084-9cb0-badbedf75563'
  AND status = 'draft'
  AND is_public = false
  AND kind = 'image'
  AND purpose = 'portrait'
  AND bucket_path = 'portrait/08faae9f-c586-4084-9cb0-badbedf75563/rainier-milanes-portrait.webp'
  AND byte_size = 34440;

UPDATE public.media_assets
SET
  status = 'published',
  is_public = true
WHERE
  id = '21cc6ca2-a169-4d81-9e9f-c2b28142926f'
  AND status = 'draft'
  AND is_public = false
  AND kind = 'image'
  AND purpose = 'journey'
  AND bucket_path = 'journey/21cc6ca2-a169-4d81-9e9f-c2b28142926f/anu-cybersecurity-study.webp'
  AND byte_size = 83854;

UPDATE public.media_assets
SET
  status = 'published',
  is_public = true
WHERE
  id = 'a9c3d301-8e83-490f-97f2-077b16f98844'
  AND status = 'draft'
  AND is_public = false
  AND kind = 'image'
  AND purpose = 'journey'
  AND bucket_path = 'journey/a9c3d301-8e83-490f-97f2-077b16f98844/decode-2024-media-interview.webp'
  AND byte_size = 251292;

UPDATE public.media_assets
SET
  status = 'published',
  is_public = true
WHERE
  id = 'd2f89c64-e6de-42bc-b697-952ad6791d36'
  AND status = 'draft'
  AND is_public = false
  AND kind = 'image'
  AND purpose = 'journey'
  AND bucket_path = 'journey/d2f89c64-e6de-42bc-b697-952ad6791d36/global-privacy-assembly-session.webp'
  AND byte_size = 210906;

UPDATE public.media_assets
SET
  status = 'published',
  is_public = true
WHERE
  id = '7e8a240a-d83f-47e5-9986-7882509b5a63'
  AND status = 'draft'
  AND is_public = false
  AND kind = 'image'
  AND purpose = 'journey'
  AND bucket_path = 'journey/7e8a240a-d83f-47e5-9986-7882509b5a63/apec-peru-digital-economy.webp'
  AND byte_size = 164764;

UPDATE public.media_assets
SET
  status = 'published',
  is_public = true
WHERE
  id = 'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  AND status = 'draft'
  AND is_public = false
  AND kind = 'image'
  AND purpose = 'journey'
  AND bucket_path = 'journey/c524fb45-e73e-4a1d-917c-a0287f07fedb/gsma-ministerial-programme-2023.webp'
  AND byte_size = 69486;

DO $$
DECLARE
  published_images integer;
  published_portrait integer;
  published_journey integer;
BEGIN
  SELECT count(*) INTO published_images
  FROM public.media_assets
  WHERE id IN (
    '08faae9f-c586-4084-9cb0-badbedf75563',
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  )
    AND status = 'published'
    AND is_public = true
    AND kind = 'image';

  SELECT count(*) INTO published_portrait
  FROM public.media_assets
  WHERE id = '08faae9f-c586-4084-9cb0-badbedf75563'
    AND purpose = 'portrait'
    AND status = 'published'
    AND is_public = true
    AND kind = 'image';

  SELECT count(*) INTO published_journey
  FROM public.media_assets
  WHERE id IN (
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  )
    AND purpose = 'journey'
    AND status = 'published'
    AND is_public = true
    AND kind = 'image';

  IF published_images <> 6
    OR published_portrait <> 1
    OR published_journey <> 5
  THEN
    RAISE EXCEPTION
      'journey media publish expected 6 published public images (1 portrait, 5 journey); got images=% portrait=% journey=%',
      published_images,
      published_portrait,
      published_journey;
  END IF;
END
$$;

-- Publish the ten owner-controlled writing works after exact PDF binaries
-- are uploaded to their frozen public-media paths.
--
-- UUID-bound UPDATEs only. No INSERT, DELETE, UPSERT, schema, or Storage SQL.
-- Each row must still be draft (and media must still be private) or the
-- UPDATE matches zero rows and the assertion fails.

UPDATE public.media_assets
SET
  byte_size = 837948,
  status = 'published',
  is_public = true
WHERE
  id = '34d3775c-4fa8-47d7-bc35-2c995fc1be61'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 233977,
  status = 'published',
  is_public = true
WHERE
  id = '3de3cd93-c729-47e9-8096-99e7974a7d5e'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 294920,
  status = 'published',
  is_public = true
WHERE
  id = 'bb275243-05d5-48af-8113-ee9536ac7429'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 2531037,
  status = 'published',
  is_public = true
WHERE
  id = 'b31d3cc2-111f-4f0d-bd56-d19666c0dade'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 12033529,
  status = 'published',
  is_public = true
WHERE
  id = '1598966c-b991-4f31-8828-f9e2d4664bc6'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 1418207,
  status = 'published',
  is_public = true
WHERE
  id = 'ba78a7f8-834d-4e85-a63f-78de5c5af0a1'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 3288273,
  status = 'published',
  is_public = true
WHERE
  id = '52e8ba31-0122-4a09-b09e-e5fb16d102f7'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 2938493,
  status = 'published',
  is_public = true
WHERE
  id = '9980ca4b-c0ff-45b9-bfb3-283ffdedcf7d'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 5329293,
  status = 'published',
  is_public = true
WHERE
  id = '880703b6-29cb-440a-b60e-8568a76b0a71'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.media_assets
SET
  byte_size = 5666770,
  status = 'published',
  is_public = true
WHERE
  id = '8af86f88-8595-4812-8177-47ca30778300'
  AND status = 'draft'
  AND is_public = false;

UPDATE public.publications
SET status = 'published'
WHERE
  id = '6aff00bd-be4c-43cd-9dcf-bc649e919b7f'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = '93bc6513-f2e8-436c-9639-0eb59288aca7'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = '1908141e-4455-441d-81bd-d2c801ec5f5b'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = '8c24bea7-36ed-40d0-b3fe-50c23e7936ab'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = '25628877-a099-42d1-8812-0e9c705bf62e'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = 'ad297187-e3c6-4317-a72f-bc661632e226'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = 'cd76c098-66b3-4a80-a621-35a0181ab18e'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = 'd018f779-c07d-4a85-945d-b644b3d3e33e'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = '5cb691fd-d699-48cc-867d-ac20c77d8845'
  AND status = 'draft';

UPDATE public.publications
SET status = 'published'
WHERE
  id = '0133a00f-c307-4135-8bdb-48018bb9161d'
  AND status = 'draft';

DO $$
DECLARE
  published_media integer;
  published_pubs integer;
BEGIN
  SELECT count(*) INTO published_media
  FROM public.media_assets
  WHERE id IN (
    '34d3775c-4fa8-47d7-bc35-2c995fc1be61',
    '3de3cd93-c729-47e9-8096-99e7974a7d5e',
    'bb275243-05d5-48af-8113-ee9536ac7429',
    'b31d3cc2-111f-4f0d-bd56-d19666c0dade',
    '1598966c-b991-4f31-8828-f9e2d4664bc6',
    'ba78a7f8-834d-4e85-a63f-78de5c5af0a1',
    '52e8ba31-0122-4a09-b09e-e5fb16d102f7',
    '9980ca4b-c0ff-45b9-bfb3-283ffdedcf7d',
    '880703b6-29cb-440a-b60e-8568a76b0a71',
    '8af86f88-8595-4812-8177-47ca30778300'
  )
    AND status = 'published'
    AND is_public = true;

  SELECT count(*) INTO published_pubs
  FROM public.publications
  WHERE id IN (
    '6aff00bd-be4c-43cd-9dcf-bc649e919b7f',
    '93bc6513-f2e8-436c-9639-0eb59288aca7',
    '1908141e-4455-441d-81bd-d2c801ec5f5b',
    '8c24bea7-36ed-40d0-b3fe-50c23e7936ab',
    '25628877-a099-42d1-8812-0e9c705bf62e',
    'ad297187-e3c6-4317-a72f-bc661632e226',
    'cd76c098-66b3-4a80-a621-35a0181ab18e',
    'd018f779-c07d-4a85-945d-b644b3d3e33e',
    '5cb691fd-d699-48cc-867d-ac20c77d8845',
    '0133a00f-c307-4135-8bdb-48018bb9161d'
  )
    AND status = 'published';

  IF published_media <> 10 OR published_pubs <> 10 THEN
    RAISE EXCEPTION
      'initial writing publish expected 10 published public media and 10 published publications; got media=% publications=%',
      published_media,
      published_pubs;
  END IF;
END
$$;

-- Draft metadata seed for the six frozen Professional Journey WebP
-- derivatives. Apply hosted only after Step 50D Storage binary
-- verification. Does not publish rows, change schema, or touch Storage.
--
-- Deterministic UUIDs. Plain INSERT so an existing UUID or path fails
-- rather than overwrite.

INSERT INTO public.media_assets (
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
) VALUES
  (
    '08faae9f-c586-4084-9cb0-badbedf75563',
    'portrait/08faae9f-c586-4084-9cb0-badbedf75563/rainier-milanes-portrait.webp',
    'image',
    'portrait',
    'Professional portrait',
    'Professional portrait of Rainier Milanes.',
    NULL,
    NULL,
    NULL,
    'image/webp',
    34440,
    10,
    false,
    'draft'
  ),
  (
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'journey/21cc6ca2-a169-4d81-9e9f-c2b28142926f/anu-cybersecurity-study.webp',
    'image',
    'journey',
    'ANU cybersecurity study',
    'Rainier Milanes standing with another adult beside an Australian National University National Security College banner, holding a certificate.',
    'Completing cybersecurity study at ANU’s National Security College.',
    NULL,
    NULL,
    'image/webp',
    83854,
    10,
    false,
    'draft'
  ),
  (
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'journey/a9c3d301-8e83-490f-97f2-077b16f98844/decode-2024-media-interview.webp',
    'image',
    'journey',
    'Decode 2024 media interview',
    'Rainier Milanes speaking during a media interview in front of a Decode 2024 event screen.',
    'Speaking with national media at Decode 2024.',
    NULL,
    '2024',
    'image/webp',
    251292,
    20,
    false,
    'draft'
  ),
  (
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    'journey/d2f89c64-e6de-42bc-b697-952ad6791d36/global-privacy-assembly-session.webp',
    'image',
    'journey',
    'Global privacy assembly session',
    'Rainier Milanes speaking at a lectern during a global privacy session.',
    'Speaking on global privacy from the lectern.',
    NULL,
    '2025',
    'image/webp',
    210906,
    30,
    false,
    'draft'
  ),
  (
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'journey/7e8a240a-d83f-47e5-9986-7882509b5a63/apec-peru-digital-economy.webp',
    'image',
    'journey',
    'APEC Peru digital economy meeting',
    'Rainier Milanes seated at a conference table during an APEC digital-economy meeting.',
    'At the APEC digital-economy meeting in Peru, 2024.',
    NULL,
    '2024',
    'image/webp',
    164764,
    40,
    false,
    'draft'
  ),
  (
    'c524fb45-e73e-4a1d-917c-a0287f07fedb',
    'journey/c524fb45-e73e-4a1d-917c-a0287f07fedb/gsma-ministerial-programme-2023.webp',
    'image',
    'journey',
    'GSMA Ministerial Programme 2023',
    'Rainier Milanes speaking at a GSMA Ministerial Programme podium.',
    'Speaking at the GSMA Ministerial Programme in 2023.',
    NULL,
    '2023',
    'image/webp',
    69486,
    50,
    false,
    'draft'
  );

DO $$
DECLARE
  target_total integer;
  target_portrait integer;
  target_journey integer;
  target_image integer;
  target_draft integer;
  target_private integer;
  target_webp integer;
BEGIN
  SELECT count(*) INTO target_total
  FROM public.media_assets
  WHERE id IN (
    '08faae9f-c586-4084-9cb0-badbedf75563',
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  );

  SELECT count(*) INTO target_portrait
  FROM public.media_assets
  WHERE id = '08faae9f-c586-4084-9cb0-badbedf75563'
    AND purpose = 'portrait';

  SELECT count(*) INTO target_journey
  FROM public.media_assets
  WHERE id IN (
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  )
    AND purpose = 'journey';

  SELECT count(*) INTO target_image
  FROM public.media_assets
  WHERE id IN (
    '08faae9f-c586-4084-9cb0-badbedf75563',
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  )
    AND kind = 'image';

  SELECT count(*) INTO target_draft
  FROM public.media_assets
  WHERE id IN (
    '08faae9f-c586-4084-9cb0-badbedf75563',
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  )
    AND status = 'draft';

  SELECT count(*) INTO target_private
  FROM public.media_assets
  WHERE id IN (
    '08faae9f-c586-4084-9cb0-badbedf75563',
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  )
    AND is_public = false;

  SELECT count(*) INTO target_webp
  FROM public.media_assets
  WHERE id IN (
    '08faae9f-c586-4084-9cb0-badbedf75563',
    '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
    'a9c3d301-8e83-490f-97f2-077b16f98844',
    'd2f89c64-e6de-42bc-b697-952ad6791d36',
    '7e8a240a-d83f-47e5-9986-7882509b5a63',
    'c524fb45-e73e-4a1d-917c-a0287f07fedb'
  )
    AND mime_type = 'image/webp';

  IF target_total <> 6
    OR target_portrait <> 1
    OR target_journey <> 5
    OR target_image <> 6
    OR target_draft <> 6
    OR target_private <> 6
    OR target_webp <> 6
  THEN
    RAISE EXCEPTION
      'initial journey media draft seed expected 6 draft private image rows (1 portrait, 5 journey); got total=% portrait=% journey=% image=% draft=% private=% webp=%',
      target_total,
      target_portrait,
      target_journey,
      target_image,
      target_draft,
      target_private,
      target_webp;
  END IF;
END
$$;

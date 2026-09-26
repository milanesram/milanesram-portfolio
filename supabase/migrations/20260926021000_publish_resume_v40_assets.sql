-- Publish verified Resume V4.0 PDFs as new media assets.
-- Does not rewrite, overwrite, or relabel the V3.1 objects.
-- No checksum column exists on media_assets; hashes are recorded here.
--
-- Resume A — GRC, IT Risk & Security Compliance
--   storage: resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf
--   SHA-256: 8e3d3cccc789ff770b622750b843d77c83ad4f030d02ad351acf3e8095aca139
--   byte_size: 123610
--   MIME: application/pdf
--
-- Resume B — Privacy, Compliance & Assurance
--   storage: resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf
--   SHA-256: ff8e0cfe742c048f92d5c0bdc71966fb080fba190696440090face9285d758fb
--   byte_size: 123872
--   MIME: application/pdf
--
-- Historical V3.1 objects remain stored and are detached from the tracks:
--   resume/bfa474f1-c193-4b29-8d6f-876d3799d164/ramilanes_resume_cybersecurity_grc.pdf
--   resume/07f4993f-d385-4842-9909-f35d4f9be662/ramilanes_resume_privacy_ai_governance.pdf

DO $resume_v40$
DECLARE
  media_a_id constant uuid := 'f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5';
  media_b_id constant uuid := '29a9954b-5169-45dc-9b82-be04e041ba78';
  path_a constant text :=
    'resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf';
  path_b constant text :=
    'resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf';
  v31_a_id constant uuid := 'bfa474f1-c193-4b29-8d6f-876d3799d164';
  v31_b_id constant uuid := '07f4993f-d385-4842-9909-f35d4f9be662';
  v31_a_path constant text :=
    'resume/bfa474f1-c193-4b29-8d6f-876d3799d164/ramilanes_resume_cybersecurity_grc.pdf';
  v31_b_path constant text :=
    'resume/07f4993f-d385-4842-9909-f35d4f9be662/ramilanes_resume_privacy_ai_governance.pdf';
  track_a_id uuid;
  track_b_id uuid;
  matched_count integer;
  updated_count integer;
BEGIN
  SELECT count(*) INTO matched_count
  FROM public.resume_tracks
  WHERE status = 'published';

  IF matched_count <> 2 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: unexpected third published resume track (matched %)',
      matched_count;
  END IF;

  SELECT count(*) INTO matched_count
  FROM public.resume_tracks
  WHERE status = 'published' AND delivery_mode = 'request';

  IF matched_count <> 2 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: published tracks are not request-only before cutover (matched %)',
      matched_count;
  END IF;

  SELECT count(*) INTO matched_count
  FROM public.resume_tracks
  WHERE
    slug = 'cybersecurity-grc'
    AND status = 'published'
    AND title = $t$Resume A — GRC, IT Risk & Security Compliance$t$
    AND delivery_mode = 'request';

  IF matched_count <> 1 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: Resume A could not be resolved exactly once (matched %)',
      matched_count;
  END IF;

  SELECT track.id INTO STRICT track_a_id
  FROM public.resume_tracks AS track
  JOIN public.focus_pages AS focus ON focus.id = track.focus_page_id
  JOIN public.media_assets AS media ON media.id = track.media_asset_id
  WHERE
    track.slug = 'cybersecurity-grc'
    AND focus.slug = 'cybersecurity-grc'
    AND track.status = 'published'
    AND track.title = $t$Resume A — GRC, IT Risk & Security Compliance$t$
    AND track.delivery_mode = 'request'
    AND media.bucket_path = v31_a_path
    AND media.byte_size = 133746
    AND media.kind = 'resume_pdf'
    AND media.purpose = 'resume';

  SELECT count(*) INTO matched_count
  FROM public.resume_tracks
  WHERE
    slug = 'privacy-ai-governance'
    AND status = 'published'
    AND title = $t$Resume B — Privacy, Compliance & Assurance$t$
    AND delivery_mode = 'request';

  IF matched_count <> 1 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: Resume B could not be resolved exactly once (matched %)',
      matched_count;
  END IF;

  SELECT track.id INTO STRICT track_b_id
  FROM public.resume_tracks AS track
  JOIN public.focus_pages AS focus ON focus.id = track.focus_page_id
  JOIN public.media_assets AS media ON media.id = track.media_asset_id
  WHERE
    track.slug = 'privacy-ai-governance'
    AND focus.slug = 'privacy-ai-governance'
    AND track.status = 'published'
    AND track.title = $t$Resume B — Privacy, Compliance & Assurance$t$
    AND track.delivery_mode = 'request'
    AND media.bucket_path = v31_b_path
    AND media.byte_size = 134203
    AND media.kind = 'resume_pdf'
    AND media.purpose = 'resume';

  IF track_a_id = track_b_id THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: Resume A and Resume B resolved to the same track';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id IN (media_a_id, media_b_id) OR bucket_path IN (path_a, path_b)
  ) THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: a V4 media record already exists';
  END IF;

  IF (
    SELECT count(*) FROM public.media_assets
    WHERE kind = 'resume_pdf' AND purpose = 'resume' AND status = 'published'
  ) <> 2 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: published resume PDF set drifted before insert';
  END IF;

  INSERT INTO public.media_assets (
    id,
    bucket_path,
    kind,
    purpose,
    title,
    alt_text,
    mime_type,
    byte_size,
    sort_order,
    is_public,
    status
  ) VALUES
    (
      media_a_id,
      path_a,
      'resume_pdf',
      'resume',
      $t$Resume A V4.0 — GRC, IT Risk & Security Compliance$t$,
      NULL,
      'application/pdf',
      123610,
      200,
      true,
      'published'
    ),
    (
      media_b_id,
      path_b,
      'resume_pdf',
      'resume',
      $t$Resume B V4.0 — Privacy, Compliance & Assurance$t$,
      NULL,
      'application/pdf',
      123872,
      210,
      true,
      'published'
    );

  SELECT count(*) INTO matched_count
  FROM public.media_assets
  WHERE id IN (media_a_id, media_b_id);

  IF matched_count <> 2 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: new media records could not be resolved exactly once (matched %)',
      matched_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET
    media_asset_id = media_a_id,
    delivery_mode = 'public_file'
  WHERE
    track.id = track_a_id
    AND track.slug = 'cybersecurity-grc'
    AND track.status = 'published'
    AND track.title = $t$Resume A — GRC, IT Risk & Security Compliance$t$
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = v31_a_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: Resume A track update matched % rows',
      updated_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET
    media_asset_id = media_b_id,
    delivery_mode = 'public_file'
  WHERE
    track.id = track_b_id
    AND track.slug = 'privacy-ai-governance'
    AND track.status = 'published'
    AND track.title = $t$Resume B — Privacy, Compliance & Assurance$t$
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = v31_b_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: Resume B track update matched % rows',
      updated_count;
  END IF;

  IF (
    SELECT count(*) FROM public.resume_tracks WHERE status = 'published'
  ) <> 2 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: unexpected third published resume track after cutover';
  END IF;

  IF (
    SELECT count(DISTINCT media_asset_id)
    FROM public.resume_tracks
    WHERE status = 'published' AND delivery_mode = 'public_file'
  ) <> 2 THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: Resume A and Resume B share a media asset';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.id = track_a_id
      AND track.slug = 'cybersecurity-grc'
      AND track.delivery_mode = 'public_file'
      AND media.id = media_a_id
      AND media.bucket_path = path_a
      AND media.byte_size = 123610
      AND media.mime_type = 'application/pdf'
      AND media.kind = 'resume_pdf'
      AND media.purpose = 'resume'
      AND media.is_public IS TRUE
      AND media.status = 'published'
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.id = track_b_id
      AND track.slug = 'privacy-ai-governance'
      AND track.delivery_mode = 'public_file'
      AND media.id = media_b_id
      AND media.bucket_path = path_b
      AND media.byte_size = 123872
      AND media.mime_type = 'application/pdf'
      AND media.kind = 'resume_pdf'
      AND media.purpose = 'resume'
      AND media.is_public IS TRUE
      AND media.status = 'published'
  ) THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: V4 byte size did not persist';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.status = 'published'
      AND (
        media.bucket_path = v31_a_path
        OR media.bucket_path = v31_b_path
        OR media.bucket_path LIKE '%ramilanes_resume_cybersecurity_grc.pdf'
        OR media.bucket_path LIKE '%ramilanes_resume_privacy_ai_governance.pdf'
      )
  ) THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: an active track still references a V3.1 resume';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE
      id = v31_a_id
      AND bucket_path = v31_a_path
      AND byte_size = 133746
      AND title = 'Cybersecurity / GRC / IT Risk Resume'
      AND mime_type = 'application/pdf'
      AND status = 'published'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE
      id = v31_b_id
      AND bucket_path = v31_b_path
      AND byte_size = 134203
      AND title = 'Privacy / AI Governance Resume'
      AND mime_type = 'application/pdf'
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: a V3.1 resume record was altered';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE
      status = 'published'
      AND slug NOT IN ('cybersecurity-grc', 'privacy-ai-governance')
  ) THEN
    RAISE EXCEPTION
      'Resume V4.0 assets refused: unexpected third published resume track';
  END IF;
END
$resume_v40$;

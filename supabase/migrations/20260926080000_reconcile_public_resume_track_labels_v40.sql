-- Drop internal Resume A / Resume B prefixes from the two public track titles
-- and replace the homepage card kickers with one shared public label.
-- Matches the current post-V4 titles, slugs, and kickers. Does not change
-- delivery mode, media assets, storage paths, summaries, or PDF records.
-- Does not edit or replay the earlier career-positioning cutover.

DO $resume_public_labels$
DECLARE
  media_a_id constant uuid := 'f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5';
  media_b_id constant uuid := '29a9954b-5169-45dc-9b82-be04e041ba78';
  path_a constant text :=
    'resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf';
  path_b constant text :=
    'resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf';
  summary_a constant text :=
    $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, TPRM, audit readiness and remediation roles.$t$;
  summary_b constant text :=
    $t$For privacy operations, data protection, privacy compliance and assurance, privacy risk, breach and incident governance, privacy technology and related governance roles.$t$;
  updated_count integer;
  matched_count integer;
BEGIN
  SELECT count(*) INTO matched_count
  FROM public.resume_tracks
  WHERE status = 'published';

  IF matched_count <> 2 THEN
    RAISE EXCEPTION
      'Public resume labels refused: unexpected published resume track count (matched %)',
      matched_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET title = $t$GRC, IT Risk & Security Compliance$t$
  WHERE
    track.slug = 'cybersecurity-grc'
    AND track.status = 'published'
    AND track.title = $t$Resume A — GRC, IT Risk & Security Compliance$t$
    AND track.summary = summary_a
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = media_a_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume labels refused: GRC track title update matched % rows',
      updated_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET title = $t$Privacy, Compliance & Assurance$t$
  WHERE
    track.slug = 'privacy-ai-governance'
    AND track.status = 'published'
    AND track.title = $t$Resume B — Privacy, Compliance & Assurance$t$
    AND track.summary = summary_b
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = media_b_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume labels refused: privacy track title update matched % rows',
      updated_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET home_kicker = $t$Professional Focus$t$
  WHERE
    track.slug = 'cybersecurity-grc'
    AND track.status = 'published'
    AND track.home_kicker = $t$Resume A$t$
    AND track.title = $t$GRC, IT Risk & Security Compliance$t$
    AND track.summary = summary_a
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = media_a_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume labels refused: GRC home kicker update matched % rows',
      updated_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET home_kicker = $t$Professional Focus$t$
  WHERE
    track.slug = 'privacy-ai-governance'
    AND track.status = 'published'
    AND track.home_kicker = $t$Resume B$t$
    AND track.title = $t$Privacy, Compliance & Assurance$t$
    AND track.summary = summary_b
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = media_b_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume labels refused: privacy home kicker update matched % rows',
      updated_count;
  END IF;

  IF (
    SELECT count(*)
    FROM public.resume_tracks
    WHERE status = 'published' AND delivery_mode = 'request'
  ) <> 2 THEN
    RAISE EXCEPTION
      'Public resume labels refused: published tracks are not request-only';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.resume_tracks
    WHERE status = 'published' AND title LIKE 'Resume %'
  ) THEN
    RAISE EXCEPTION
      'Public resume labels refused: a published title still uses a Resume prefix';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'cybersecurity-grc'
      AND track.title = $t$GRC, IT Risk & Security Compliance$t$
      AND track.home_kicker = $t$Professional Focus$t$
      AND track.summary = summary_a
      AND track.delivery_mode = 'request'
      AND media.id = media_a_id
      AND media.bucket_path = path_a
      AND media.byte_size = 123610
      AND media.title = $t$Resume A V4.0 — GRC, IT Risk & Security Compliance$t$
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'privacy-ai-governance'
      AND track.title = $t$Privacy, Compliance & Assurance$t$
      AND track.home_kicker = $t$Professional Focus$t$
      AND track.summary = summary_b
      AND track.delivery_mode = 'request'
      AND media.id = media_b_id
      AND media.bucket_path = path_b
      AND media.byte_size = 123872
      AND media.title = $t$Resume B V4.0 — Privacy, Compliance & Assurance$t$
  ) THEN
    RAISE EXCEPTION
      'Public resume labels refused: track title, summary, delivery, or V4 media record drifted';
  END IF;
END
$resume_public_labels$;

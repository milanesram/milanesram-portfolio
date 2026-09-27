-- Point the two public resume tracks at sanitized public_resume derivatives.
-- Does not upload, overwrite, or delete Storage objects.
--
-- The hosted V4.0 rows are already is_public false and still published.
-- Future release must remove these unsanitized objects from the public-media
-- bucket after the new objects are verified. Setting is_public false does not
-- revoke a known public object URL:
--   resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf
--   resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf
--
-- New public objects, not present in this migration as bytes:
--   public_resume/ee95ba5e-394c-4af0-b393-1f7b486e8e21/rainier-milanes-grc-it-risk-security-compliance-resume.pdf
--     SHA-256: 36b14b04d341adc5fc0d9f2aa749af0fe2be384602bbf912056516b6a2436c0b
--     byte_size: 113364
--   public_resume/83ad7af1-c62b-4fd8-86d0-58dab7df99fb/rainier-milanes-privacy-compliance-assurance-resume.pdf
--     SHA-256: 40598b511a359b4912a101d97b0710290fd39fc91c244940589d24658b832431
--     byte_size: 113436
--
-- Professional CV stays in private-resumes and is not modified.

ALTER TABLE public.media_assets
  DROP CONSTRAINT media_assets_kind_purpose_match;

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
      AND purpose IN (
        'publication'::public.media_purpose,
        'public_resume'::public.media_purpose
      )
    )
    OR (
      kind = 'resume_pdf'
      AND purpose = 'resume'::public.media_purpose
    )
  );

DO $public_resume_cutover$
DECLARE
  old_grc_id constant uuid := 'f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5';
  old_privacy_id constant uuid := '29a9954b-5169-45dc-9b82-be04e041ba78';
  new_grc_id constant uuid := 'ee95ba5e-394c-4af0-b393-1f7b486e8e21';
  new_privacy_id constant uuid := '83ad7af1-c62b-4fd8-86d0-58dab7df99fb';
  old_grc_path constant text :=
    'resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf';
  old_privacy_path constant text :=
    'resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf';
  new_grc_path constant text :=
    'public_resume/ee95ba5e-394c-4af0-b393-1f7b486e8e21/rainier-milanes-grc-it-risk-security-compliance-resume.pdf';
  new_privacy_path constant text :=
    'public_resume/83ad7af1-c62b-4fd8-86d0-58dab7df99fb/rainier-milanes-privacy-compliance-assurance-resume.pdf';
  summary_grc constant text :=
    $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, TPRM, audit readiness and remediation roles.$t$;
  summary_privacy constant text :=
    $t$For privacy operations, data protection, privacy compliance and assurance, privacy risk, breach and incident governance, privacy technology and related governance roles.$t$;
  updated_count integer;
  matched_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.private_document_assets
    WHERE
      document_key = 'professional_cv'
      AND storage_bucket = 'private-resumes'
      AND object_path = 'cv/v2/ramilanes_professional_cv_v2.pdf'
      AND byte_size = 176774
      AND active IS TRUE
  ) THEN
    RAISE EXCEPTION
      'Public resume cutover refused: professional CV private record drifted';
  END IF;

  SELECT count(*) INTO matched_count
  FROM public.resume_tracks
  WHERE status = 'published';

  IF matched_count <> 2 THEN
    RAISE EXCEPTION
      'Public resume cutover refused: unexpected published resume track count (matched %)',
      matched_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'cybersecurity-grc'
      AND track.status = 'published'
      AND track.title = $t$GRC, IT Risk & Security Compliance$t$
      AND track.summary = summary_grc
      AND track.home_kicker = $t$Professional Focus$t$
      AND track.delivery_mode = 'request'
      AND media.id = old_grc_id
      AND media.bucket_path = old_grc_path
      AND media.byte_size = 123610
      AND media.kind = 'resume_pdf'
      AND media.purpose = 'resume'
      AND media.status = 'published'
      AND media.is_public IS FALSE
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'privacy-ai-governance'
      AND track.status = 'published'
      AND track.title = $t$Privacy, Compliance & Assurance$t$
      AND track.summary = summary_privacy
      AND track.home_kicker = $t$Professional Focus$t$
      AND track.delivery_mode = 'request'
      AND media.id = old_privacy_id
      AND media.bucket_path = old_privacy_path
      AND media.byte_size = 123872
      AND media.kind = 'resume_pdf'
      AND media.purpose = 'resume'
      AND media.status = 'published'
      AND media.is_public IS FALSE
  ) THEN
    RAISE EXCEPTION
      'Public resume cutover refused: current V4.0 track or media state drifted';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.media_assets
    WHERE id IN (new_grc_id, new_privacy_id)
      OR bucket_path IN (new_grc_path, new_privacy_path)
  ) THEN
    RAISE EXCEPTION
      'Public resume cutover refused: a sanitized media row already exists';
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
      new_grc_id,
      new_grc_path,
      'document',
      'public_resume',
      $t$GRC, IT Risk & Security Compliance$t$,
      NULL,
      'application/pdf',
      113364,
      220,
      true,
      'published'
    ),
    (
      new_privacy_id,
      new_privacy_path,
      'document',
      'public_resume',
      $t$Privacy, Compliance & Assurance$t$,
      NULL,
      'application/pdf',
      113436,
      230,
      true,
      'published'
    );

  UPDATE public.resume_tracks AS track
  SET
    media_asset_id = new_grc_id,
    delivery_mode = 'public_file',
    request_cta_label = $t$Download Resume$t$
  WHERE
    track.slug = 'cybersecurity-grc'
    AND track.status = 'published'
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = old_grc_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume cutover refused: GRC track update matched % rows',
      updated_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET
    media_asset_id = new_privacy_id,
    delivery_mode = 'public_file',
    request_cta_label = $t$Download Resume$t$
  WHERE
    track.slug = 'privacy-ai-governance'
    AND track.status = 'published'
    AND track.delivery_mode = 'request'
    AND track.media_asset_id = old_privacy_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume cutover refused: privacy track update matched % rows',
      updated_count;
  END IF;

  UPDATE public.media_assets
  SET
    is_public = false,
    status = 'archived'
  WHERE
    id = old_grc_id
    AND bucket_path = old_grc_path
    AND byte_size = 123610
    AND is_public IS FALSE
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume cutover refused: old GRC media archival matched % rows',
      updated_count;
  END IF;

  UPDATE public.media_assets
  SET
    is_public = false,
    status = 'archived'
  WHERE
    id = old_privacy_id
    AND bucket_path = old_privacy_path
    AND byte_size = 123872
    AND is_public IS FALSE
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Public resume cutover refused: old privacy media archival matched % rows',
      updated_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.resume_tracks
    WHERE status = 'published' AND media_asset_id IN (old_grc_id, old_privacy_id)
  ) OR (
    SELECT count(*)
    FROM public.resume_tracks
    WHERE status = 'published' AND delivery_mode = 'public_file'
  ) <> 2 THEN
    RAISE EXCEPTION
      'Public resume cutover refused: published tracks did not move to the sanitized files';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'cybersecurity-grc'
      AND track.delivery_mode = 'public_file'
      AND media.id = new_grc_id
      AND media.purpose = 'public_resume'
      AND media.kind = 'document'
      AND media.is_public IS TRUE
      AND media.status = 'published'
      AND media.byte_size = 113364
      AND media.bucket_path = new_grc_path
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'privacy-ai-governance'
      AND track.delivery_mode = 'public_file'
      AND media.id = new_privacy_id
      AND media.purpose = 'public_resume'
      AND media.kind = 'document'
      AND media.is_public IS TRUE
      AND media.status = 'published'
      AND media.byte_size = 113436
      AND media.bucket_path = new_privacy_path
  ) THEN
    RAISE EXCEPTION
      'Public resume cutover refused: sanitized media relationship drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.private_document_assets
    WHERE
      document_key = 'professional_cv'
      AND storage_bucket = 'private-resumes'
      AND object_path = 'cv/v2/ramilanes_professional_cv_v2.pdf'
      AND byte_size = 176774
      AND active IS TRUE
  ) THEN
    RAISE EXCEPTION
      'Public resume cutover refused: professional CV private record changed';
  END IF;
END
$public_resume_cutover$;

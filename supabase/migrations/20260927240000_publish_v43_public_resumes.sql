-- Step 4B: Privacy-first public résumé order and approved V4.3 byte sizes.
-- Storage object replacement is a separate release action. This migration
-- does not upload, overwrite, or delete Storage objects.
--
-- Same public paths, media IDs, labels, and delivery mode:
--   public_resume/ee95ba5e-394c-4af0-b393-1f7b486e8e21/rainier-milanes-grc-it-risk-security-compliance-resume.pdf
--     prior SHA-256: 36b14b04d341adc5fc0d9f2aa749af0fe2be384602bbf912056516b6a2436c0b
--     prior byte_size: 113364
--     approved SHA-256: 860d65616301149d16f2aa4174ac6244cb18770799c55aa1731b28aea44561c1
--     approved byte_size: 167120
--   public_resume/83ad7af1-c62b-4fd8-86d0-58dab7df99fb/rainier-milanes-privacy-compliance-assurance-resume.pdf
--     prior SHA-256: 40598b511a359b4912a101d97b0710290fd39fc91c244940589d24658b832431
--     prior byte_size: 113436
--     approved SHA-256: e5b93ef6f68d4fb4c3149154cedf8f5545d3833e5c74a1483784262a0a6dd3d6
--     approved byte_size: 167446
--
-- Visible card order becomes Privacy, Compliance & Assurance, then
-- GRC, IT Risk & Security Compliance.

DO $publish_v43_public_resumes$
DECLARE
  grc_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000011';
  privacy_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000012';
  grc_media_id constant uuid := 'ee95ba5e-394c-4af0-b393-1f7b486e8e21';
  privacy_media_id constant uuid := '83ad7af1-c62b-4fd8-86d0-58dab7df99fb';
  grc_path constant text :=
    'public_resume/ee95ba5e-394c-4af0-b393-1f7b486e8e21/rainier-milanes-grc-it-risk-security-compliance-resume.pdf';
  privacy_path constant text :=
    'public_resume/83ad7af1-c62b-4fd8-86d0-58dab7df99fb/rainier-milanes-privacy-compliance-assurance-resume.pdf';
  grc_summary constant text :=
    $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, TPRM, audit readiness and remediation roles.$t$;
  privacy_summary constant text :=
    $t$For privacy operations, data protection, privacy compliance and assurance, privacy risk, breach and incident governance, privacy technology and related governance roles.$t$;
  n integer;
  profile_headline text;
  home_headline text;
  home_title text;
  about_headline text;
  resume_headline text;
  privacy_focus_sort integer;
  grc_focus_sort integer;
BEGIN
  SELECT count(*) INTO n FROM public.resume_tracks;
  IF n <> 2 THEN
    RAISE EXCEPTION
      'V4.3 public resumes refused: unexpected resume track count (matched %)',
      n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.resume_tracks WHERE sort_order NOT IN (10, 20)
  ) THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: unexpected resume sort values';
  END IF;

  SELECT headline INTO profile_headline
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF profile_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: site profile headline drifted';
  END IF;

  SELECT headline INTO home_headline
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF home_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: home headline drifted';
  END IF;

  SELECT title INTO home_title
  FROM public.page_seo
  WHERE page_key = 'home' AND status = 'published';
  IF home_title IS DISTINCT FROM
    $t$Rainier (Ram) Milanes | Global Privacy, Compliance & Information Security Risk$t$
  THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: home SEO title drifted';
  END IF;

  SELECT headline INTO about_headline
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF about_headline IS DISTINCT FROM
    $t$Privacy, compliance and information-security risk across operations, regulation and technology.$t$
  THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: about headline drifted';
  END IF;

  SELECT headline INTO resume_headline
  FROM public.resume_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF resume_headline IS DISTINCT FROM
    $t$One professional record. Two role-aligned resumes.$t$
  THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: resume page headline drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = 'c52e0001-0000-4000-8000-000000000001'
    AND organization = $t$Scionetrade Corporation$t$
    AND title = $t$Legal Consultant$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: Scionetrade title is not Legal Consultant';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = '76cab340-da39-4975-b061-5c65bb0c78ad'
    AND title = $t$Communications Chair, Data & Technology Student Leadership Council$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: Northwestern title is not Communications Chair';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE id = 'df887d59-0bb6-4e5d-84d2-f24662243585'
    AND body = $t$Introduced pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, reviewed execution, and provided guidance on privacy and security alignment.$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: CSMCC wording drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE id = '2d23ab52-c558-4264-be11-8ac750a02a70'
    AND body = $t$Supported more than 10,000 Data Processing System (DPS) and Data Protection Officer (DPO) registrations by 30 September 2024 after the registration system launched in 2023.$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: registration metric drifted';
  END IF;

  SELECT sort_order INTO privacy_focus_sort
  FROM public.focus_pages
  WHERE id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-ai-governance'
    AND headline = $t$Privacy, Compliance & Assurance$t$
    AND status = 'published';
  SELECT sort_order INTO grc_focus_sort
  FROM public.focus_pages
  WHERE id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
    AND slug = 'cybersecurity-grc'
    AND headline = $t$GRC, IT Risk & Security Compliance$t$
    AND status = 'published';
  IF privacy_focus_sort IS DISTINCT FROM 10 OR grc_focus_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION
      'V4.3 public resumes refused: home lane order drifted (privacy %, grc %)',
      privacy_focus_sort, grc_focus_sort;
  END IF;

  SELECT count(*) INTO n
  FROM public.home_proof_items
  WHERE id = 'e5c19a96-564e-4c1b-9fb4-be1c014484b3'
    AND label = $t$Former Privacy Regulator$t$
    AND sort_order = 10
    AND supporting = $t$Presented Philippine breach and compliance developments and regulatory systems at Global Privacy Assembly meetings and represented the Philippines in APEC Cross-Border Privacy Rules discussions.$t$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: home proof drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.id = grc_track_id
      AND track.slug = 'cybersecurity-grc'
      AND track.status = 'published'
      AND track.title = $t$GRC, IT Risk & Security Compliance$t$
      AND track.summary = grc_summary
      AND track.home_kicker = $t$Professional Focus$t$
      AND track.delivery_mode = 'public_file'
      AND track.request_cta_label = $t$Download Resume$t$
      AND track.sort_order = 10
      AND media.id = grc_media_id
      AND media.bucket_path = grc_path
      AND media.byte_size = 113364
      AND media.kind = 'document'
      AND media.purpose = 'public_resume'
      AND media.mime_type = 'application/pdf'
      AND media.title = $t$GRC, IT Risk & Security Compliance$t$
      AND media.status = 'published'
      AND media.is_public IS TRUE
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.id = privacy_track_id
      AND track.slug = 'privacy-ai-governance'
      AND track.status = 'published'
      AND track.title = $t$Privacy, Compliance & Assurance$t$
      AND track.summary = privacy_summary
      AND track.home_kicker = $t$Professional Focus$t$
      AND track.delivery_mode = 'public_file'
      AND track.request_cta_label = $t$Download Resume$t$
      AND track.sort_order = 20
      AND media.id = privacy_media_id
      AND media.bucket_path = privacy_path
      AND media.byte_size = 113436
      AND media.kind = 'document'
      AND media.purpose = 'public_resume'
      AND media.mime_type = 'application/pdf'
      AND media.title = $t$Privacy, Compliance & Assurance$t$
      AND media.status = 'published'
      AND media.is_public IS TRUE
  ) THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: current track or media state drifted';
  END IF;

  UPDATE public.resume_tracks
  SET sort_order = 30
  WHERE id = privacy_track_id AND sort_order = 20;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: privacy sort hold matched % rows', n;
  END IF;

  UPDATE public.resume_tracks
  SET sort_order = 20
  WHERE id = grc_track_id AND sort_order = 10;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: GRC sort update matched % rows', n;
  END IF;

  UPDATE public.resume_tracks
  SET sort_order = 10
  WHERE id = privacy_track_id AND sort_order = 30;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: privacy sort update matched % rows', n;
  END IF;

  UPDATE public.media_assets
  SET byte_size = 167120
  WHERE id = grc_media_id
    AND bucket_path = grc_path
    AND byte_size = 113364
    AND mime_type = 'application/pdf'
    AND purpose = 'public_resume'
    AND is_public IS TRUE;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: GRC byte size update matched % rows', n;
  END IF;

  UPDATE public.media_assets
  SET byte_size = 167446
  WHERE id = privacy_media_id
    AND bucket_path = privacy_path
    AND byte_size = 113436
    AND mime_type = 'application/pdf'
    AND purpose = 'public_resume'
    AND is_public IS TRUE;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: privacy byte size update matched % rows', n;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks
    WHERE id = privacy_track_id
      AND title = $t$Privacy, Compliance & Assurance$t$
      AND sort_order = 10
      AND media_asset_id = privacy_media_id
      AND delivery_mode = 'public_file'
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks
    WHERE id = grc_track_id
      AND title = $t$GRC, IT Risk & Security Compliance$t$
      AND sort_order = 20
      AND media_asset_id = grc_media_id
      AND delivery_mode = 'public_file'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = grc_media_id AND byte_size = 167120 AND bucket_path = grc_path
  ) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = privacy_media_id AND byte_size = 167446 AND bucket_path = privacy_path
  ) THEN
    RAISE EXCEPTION 'V4.3 public resumes refused: final order or byte size is wrong';
  END IF;
END
$publish_v43_public_resumes$;

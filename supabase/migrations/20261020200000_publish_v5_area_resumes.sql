-- Approved 20 October 2026 public resumes.
-- Storage objects were uploaded first and hash-checked before this catalog
-- change. This migration does not upload, overwrite, or delete Storage objects.
--
-- Previous public resume relationships, retained:
--   track c52a0001-0000-4000-8000-000000000012 privacy-ai-governance
--     title: Privacy, Compliance & Assurance
--     summary: For privacy operations, data protection, privacy compliance and
--       assurance, privacy risk, breach and incident governance, privacy
--       technology and related governance roles.
--     media: 83ad7af1-c62b-4fd8-86d0-58dab7df99fb
--     path: public_resume/83ad7af1-c62b-4fd8-86d0-58dab7df99fb/rainier-milanes-privacy-compliance-assurance-resume.pdf
--     byte_size: 167446
--   track c52a0001-0000-4000-8000-000000000011 cybersecurity-grc
--     title: GRC, IT Risk & Security Compliance
--     summary: For GRC, IT risk, technology risk, security compliance, controls,
--       assurance, TPRM, audit readiness and remediation roles.
--     media: ee95ba5e-394c-4af0-b393-1f7b486e8e21
--     path: public_resume/ee95ba5e-394c-4af0-b393-1f7b486e8e21/rainier-milanes-grc-it-risk-security-compliance-resume.pdf
--     byte_size: 167120
--
-- Previous resume_page:
--   headline: One professional record. Two role-aligned resumes.
--   lede: Choose the version aligned with the dominant duties of the opportunity.
--     Both resumes preserve the same factual employment record while emphasizing
--     the evidence most relevant to the role.
--   request_intro: Request the relevant version
--   request_footnote: AI governance is used where it materially overlaps privacy,
--     risk, controls, information security or responsible technology adoption; it
--     is not maintained as a separate resume track. The comprehensive CV is
--     private and is not published here.
--   closing_heading: Request a resume
--   closing_lede: Email or LinkedIn is the request path. Specify GRC, IT Risk &
--     Security Compliance or Privacy, Compliance & Assurance.
--
-- Previous page_seo resume title and description:
--   Resume | Privacy, GRC & IT Risk
--   Two role-aligned resumes for one professional record: privacy, compliance
--   and assurance, or GRC, IT risk and security compliance.
--
-- Restore by pointing the two existing tracks back at the retained media IDs
-- and titles above, deleting only the inserted third track
-- c52a0002-2026-4a20-8a01-000000000010 and the three inserted media rows
-- c52a0002-2026-4a20-8a01-0000000000b5, c52a0002-2026-4a20-8a01-0000000000a5,
-- and c52a0002-2026-4a20-8a01-0000000000c1, then restoring the page and SEO
-- text. Do not delete the Storage objects.
--
-- New files, verified before retargeting:
--   privacy SHA-256 afbffffd311d3c4a487b7b6782dd1479fcc988e898353819e11af0547ef5e756
--     byte_size 219039
--   GRC SHA-256 463c41d5049b835253a5d53318f6f7bd29ee5f4ec98c60473d83a2d831d795de
--     byte_size 219497
--   systems SHA-256 2ac0070048720274a90dfc46310e07e0bce47e9b2abff8b44ab27c6682148bcf
--     byte_size 208875

DO $publish_v5_area_resumes$
DECLARE
  privacy_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000012';
  grc_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000011';
  systems_track_id constant uuid := 'c52a0002-2026-4a20-8a01-000000000010';
  old_privacy_media_id constant uuid := '83ad7af1-c62b-4fd8-86d0-58dab7df99fb';
  old_grc_media_id constant uuid := 'ee95ba5e-394c-4af0-b393-1f7b486e8e21';
  privacy_media_id constant uuid := 'c52a0002-2026-4a20-8a01-0000000000b5';
  grc_media_id constant uuid := 'c52a0002-2026-4a20-8a01-0000000000a5';
  systems_media_id constant uuid := 'c52a0002-2026-4a20-8a01-0000000000c1';
  privacy_path constant text :=
    'public_resume/c52a0002-2026-4a20-8a01-0000000000b5/rainier-milanes-privacy-and-data-protection.pdf';
  grc_path constant text :=
    'public_resume/c52a0002-2026-4a20-8a01-0000000000a5/rainier-milanes-grc-it-risk-and-consulting.pdf';
  systems_path constant text :=
    'public_resume/c52a0002-2026-4a20-8a01-0000000000c1/rainier-milanes-information-technology-and-systems.pdf';
  old_privacy_path constant text :=
    'public_resume/83ad7af1-c62b-4fd8-86d0-58dab7df99fb/rainier-milanes-privacy-compliance-assurance-resume.pdf';
  old_grc_path constant text :=
    'public_resume/ee95ba5e-394c-4af0-b393-1f7b486e8e21/rainier-milanes-grc-it-risk-security-compliance-resume.pdf';
  privacy_title constant text := $t$Privacy and Data Protection$t$;
  grc_title constant text := $t$GRC, IT Risk and Consulting$t$;
  systems_title constant text := $t$Information Technology and Systems$t$;
  old_privacy_title constant text := $t$Privacy, Compliance & Assurance$t$;
  old_grc_title constant text := $t$GRC, IT Risk & Security Compliance$t$;
  privacy_summary constant text :=
    $t$Privacy and data protection across regulatory leadership, program implementation, consulting, and assurance.$t$;
  grc_summary constant text :=
    $t$GRC, IT risk, and consulting across assessments, controls, assurance, and remediation.$t$;
  systems_summary constant text :=
    $t$Information technology and systems, including technical implementation and the Northwestern MSIS capstone.$t$;
  old_privacy_summary constant text :=
    $t$For privacy operations, data protection, privacy compliance and assurance, privacy risk, breach and incident governance, privacy technology and related governance roles.$t$;
  old_grc_summary constant text :=
    $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, TPRM, audit readiness and remediation roles.$t$;
  resume_headline constant text := $t$Resumes by area of work.$t$;
  old_resume_headline constant text :=
    $t$One professional record. Two role-aligned resumes.$t$;
  resume_lede constant text :=
    $t$Each file is a view of the same career record. A detailed CV is available by request.$t$;
  old_resume_lede constant text :=
    $t$Choose the version aligned with the dominant duties of the opportunity. Both resumes preserve the same factual employment record while emphasizing the evidence most relevant to the role.$t$;
  resume_request_intro constant text := $t$Request a detailed CV$t$;
  old_resume_request_intro constant text := $t$Request the relevant version$t$;
  resume_footnote constant text :=
    $t$A detailed CV is available by request and is not published on this site.$t$;
  old_resume_footnote constant text :=
    $t$AI governance is used where it materially overlaps privacy, risk, controls, information security or responsible technology adoption; it is not maintained as a separate resume track. The comprehensive CV is private and is not published here.$t$;
  resume_closing_heading constant text := $t$Request a detailed CV$t$;
  old_resume_closing_heading constant text := $t$Request a resume$t$;
  resume_closing_lede constant text :=
    $t$Email or LinkedIn is the request path for a detailed CV.$t$;
  old_resume_closing_lede constant text :=
    $t$Email or LinkedIn is the request path. Specify GRC, IT Risk & Security Compliance or Privacy, Compliance & Assurance.$t$;
  seo_title constant text := $t$Resumes | Privacy, Governance & Information Systems$t$;
  old_seo_title constant text := $t$Resume | Privacy, GRC & IT Risk$t$;
  seo_description constant text :=
    $t$Resumes by area of work: privacy and data protection; GRC, IT risk and consulting; and information technology and systems. A detailed CV is available by request.$t$;
  old_seo_description constant text :=
    $t$Two role-aligned resumes for one professional record: privacy, compliance and assurance, or GRC, IT risk and security compliance.$t$;
  n integer;
  existing_id uuid;
BEGIN
  IF (SELECT count(*) FROM public.site_settings WHERE contact_form_enabled IS TRUE) <> 0 THEN
    RAISE EXCEPTION 'resume publication refused: contact form is enabled';
  END IF;

  IF (SELECT count(*) FROM public.site_settings WHERE site_indexable IS NOT TRUE) <> 0 THEN
    RAISE EXCEPTION 'resume publication refused: site indexability drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = old_privacy_media_id
      AND bucket_path = old_privacy_path
      AND byte_size = 167446
      AND kind = 'document'
      AND purpose = 'public_resume'
      AND mime_type = 'application/pdf'
      AND is_public IS TRUE
      AND status = 'published'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = old_grc_media_id
      AND bucket_path = old_grc_path
      AND byte_size = 167120
      AND kind = 'document'
      AND purpose = 'public_resume'
      AND mime_type = 'application/pdf'
      AND is_public IS TRUE
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'resume publication refused: retained resume binaries drifted';
  END IF;

  IF EXISTS (SELECT 1 FROM public.media_assets WHERE id = privacy_media_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.media_assets
      WHERE id = privacy_media_id
        AND bucket_path = privacy_path
        AND byte_size = 219039
        AND kind = 'document'
        AND purpose = 'public_resume'
        AND mime_type = 'application/pdf'
        AND is_public IS TRUE
        AND status = 'published'
    ) THEN
      RAISE EXCEPTION 'resume publication refused: privacy media row drifted';
    END IF;
  ELSE
    INSERT INTO public.media_assets (
      id, bucket_path, kind, purpose, title, alt_text, mime_type, byte_size,
      sort_order, is_public, status
    ) VALUES (
      privacy_media_id, privacy_path, 'document', 'public_resume', privacy_title,
      NULL, 'application/pdf', 219039, 240, true, 'published'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM public.media_assets WHERE id = grc_media_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.media_assets
      WHERE id = grc_media_id
        AND bucket_path = grc_path
        AND byte_size = 219497
        AND kind = 'document'
        AND purpose = 'public_resume'
        AND mime_type = 'application/pdf'
        AND is_public IS TRUE
        AND status = 'published'
    ) THEN
      RAISE EXCEPTION 'resume publication refused: GRC media row drifted';
    END IF;
  ELSE
    INSERT INTO public.media_assets (
      id, bucket_path, kind, purpose, title, alt_text, mime_type, byte_size,
      sort_order, is_public, status
    ) VALUES (
      grc_media_id, grc_path, 'document', 'public_resume', grc_title,
      NULL, 'application/pdf', 219497, 250, true, 'published'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM public.media_assets WHERE id = systems_media_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.media_assets
      WHERE id = systems_media_id
        AND bucket_path = systems_path
        AND byte_size = 208875
        AND kind = 'document'
        AND purpose = 'public_resume'
        AND mime_type = 'application/pdf'
        AND is_public IS TRUE
        AND status = 'published'
    ) THEN
      RAISE EXCEPTION 'resume publication refused: systems media row drifted';
    END IF;
  ELSE
    INSERT INTO public.media_assets (
      id, bucket_path, kind, purpose, title, alt_text, mime_type, byte_size,
      sort_order, is_public, status
    ) VALUES (
      systems_media_id, systems_path, 'document', 'public_resume', systems_title,
      NULL, 'application/pdf', 208875, 260, true, 'published'
    );
  END IF;

  UPDATE public.resume_tracks
  SET
    title = privacy_title,
    summary = privacy_summary,
    media_asset_id = privacy_media_id,
    delivery_mode = 'public_file',
    request_cta_label = $t$Download Resume$t$,
    sort_order = 10,
    focus_page_id = '27236662-e48e-4b6f-a820-75cd321a7322',
    updated_at = now()
  WHERE id = privacy_track_id
    AND slug = 'privacy-ai-governance'
    AND status = 'published'
    AND title IN (old_privacy_title, privacy_title)
    AND summary IN (old_privacy_summary, privacy_summary)
    AND media_asset_id IN (old_privacy_media_id, privacy_media_id);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'resume publication refused: privacy track update matched % rows', n;
  END IF;

  UPDATE public.resume_tracks
  SET
    title = grc_title,
    summary = grc_summary,
    media_asset_id = grc_media_id,
    delivery_mode = 'public_file',
    request_cta_label = $t$Download Resume$t$,
    sort_order = 20,
    focus_page_id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a',
    updated_at = now()
  WHERE id = grc_track_id
    AND slug = 'cybersecurity-grc'
    AND status = 'published'
    AND title IN (old_grc_title, grc_title)
    AND summary IN (old_grc_summary, grc_summary)
    AND media_asset_id IN (old_grc_media_id, grc_media_id);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'resume publication refused: GRC track update matched % rows', n;
  END IF;

  SELECT id INTO existing_id
  FROM public.resume_tracks
  WHERE slug = 'information-technology-systems';

  IF existing_id IS NULL THEN
    SELECT count(*) INTO n FROM public.resume_tracks;
    IF n <> 2 THEN
      RAISE EXCEPTION 'resume publication refused: expected 2 tracks before insert, found %', n;
    END IF;

    INSERT INTO public.resume_tracks (
      id, slug, focus_page_id, title, summary, delivery_mode, media_asset_id,
      request_cta_label, home_kicker, sort_order, status
    ) VALUES (
      systems_track_id,
      'information-technology-systems',
      NULL,
      systems_title,
      systems_summary,
      'public_file',
      systems_media_id,
      $t$Download Resume$t$,
      NULL,
      30,
      'published'
    );
  ELSIF existing_id <> systems_track_id THEN
    RAISE EXCEPTION 'resume publication refused: systems track slug belongs to %', existing_id;
  ELSE
    UPDATE public.resume_tracks
    SET
      title = systems_title,
      summary = systems_summary,
      media_asset_id = systems_media_id,
      delivery_mode = 'public_file',
      request_cta_label = $t$Download Resume$t$,
      home_kicker = NULL,
      focus_page_id = NULL,
      sort_order = 30,
      status = 'published',
      updated_at = now()
    WHERE id = systems_track_id
      AND slug = 'information-technology-systems'
      AND focus_page_id IS NULL
      AND title = systems_title
      AND summary = systems_summary
      AND media_asset_id = systems_media_id;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION 'resume publication refused: systems track drifted';
    END IF;
  END IF;

  SELECT count(*) INTO n FROM public.resume_tracks WHERE status = 'published';
  IF n <> 3 THEN
    RAISE EXCEPTION 'resume publication refused: expected 3 published tracks, found %', n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE id = systems_track_id AND focus_page_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'resume publication refused: systems track must not assume a focus page';
  END IF;

  UPDATE public.resume_page
  SET
    headline = resume_headline,
    lede = resume_lede,
    request_intro = resume_request_intro,
    request_footnote = resume_footnote,
    closing_heading = resume_closing_heading,
    closing_lede = resume_closing_lede,
    updated_at = now()
  WHERE singleton_key = 'default'
    AND status = 'published'
    AND headline IN (old_resume_headline, resume_headline)
    AND lede IN (old_resume_lede, resume_lede)
    AND request_intro IN (old_resume_request_intro, resume_request_intro)
    AND request_footnote IN (old_resume_footnote, resume_footnote)
    AND closing_heading IN (old_resume_closing_heading, resume_closing_heading)
    AND closing_lede IN (old_resume_closing_lede, resume_closing_lede);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'resume publication refused: resume page update matched % rows', n;
  END IF;

  UPDATE public.page_seo
  SET
    title = seo_title,
    description = seo_description,
    og_title = seo_title,
    og_description = seo_description,
    updated_at = now()
  WHERE page_key = 'resume'
    AND status = 'published'
    AND indexable IS TRUE
    AND title IN (old_seo_title, seo_title)
    AND description IN (old_seo_description, seo_description)
    AND og_title IN (old_seo_title, seo_title)
    AND og_description IN (old_seo_description, seo_description);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'resume publication refused: resume SEO update matched % rows', n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE status = 'published'
      AND (body LIKE '%685%' OR coalesce(metric_context, '') LIKE '%685%')
  ) OR EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE label LIKE '%685%' OR supporting LIKE '%685%'
  ) OR EXISTS (
    SELECT 1 FROM public.home_page
    WHERE headline LIKE '%685%' OR lede LIKE '%685%' OR project_body LIKE '%685%'
      OR focus_heading LIKE '%685%' OR coalesce(focus_lede, '') LIKE '%685%'
  ) OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE status = 'published'
      AND (
        summary LIKE '%685%' OR role LIKE '%685%' OR limits LIKE '%685%'
        OR name LIKE '%685%' OR tagline LIKE '%685%'
      )
  ) OR EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE status = 'published'
      AND (heading LIKE '%685%' OR body LIKE '%685%')
  ) OR EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE title LIKE '%685%' OR description LIKE '%685%'
      OR coalesce(og_title, '') LIKE '%685%'
      OR coalesce(og_description, '') LIKE '%685%'
  ) OR EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE status = 'published'
      AND (
        headline LIKE '%685%' OR summary LIKE '%685%'
        OR coalesce(featured_project_lede, '') LIKE '%685%'
        OR coalesce(card_summary, '') LIKE '%685%'
      )
  ) OR EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE title LIKE '%685%' OR summary LIKE '%685%'
  ) THEN
    RAISE EXCEPTION 'resume publication refused: retired 685-check claim remains in public content';
  END IF;
END
$publish_v5_area_resumes$;

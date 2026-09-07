-- Reconcile hosted resume PDF byte_size to the verified V3.1 public objects.
-- UUID-bound UPDATEs only. Does not change storage paths, publication state,
-- MIME type, sort order, ownership, or resume-track relationships.

DO $resume_bytes_v31$
DECLARE
  resume_a_id constant uuid := 'bfa474f1-c193-4b29-8d6f-876d3799d164';
  resume_b_id constant uuid := '07f4993f-d385-4842-9909-f35d4f9be662';
  resume_a_path constant text :=
    'resume/bfa474f1-c193-4b29-8d6f-876d3799d164/ramilanes_resume_cybersecurity_grc.pdf';
  resume_b_path constant text :=
    'resume/07f4993f-d385-4842-9909-f35d4f9be662/ramilanes_resume_privacy_ai_governance.pdf';
  cyber_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000011';
  privacy_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000012';
  updated_count integer;
BEGIN
  UPDATE public.media_assets
  SET byte_size = 133746
  WHERE
    id = resume_a_id
    AND bucket_path = resume_a_path
    AND kind = 'resume_pdf'
    AND purpose = 'resume'
    AND mime_type = 'application/pdf'
    AND is_public IS TRUE
    AND status = 'published'
    AND sort_order = 100
    AND byte_size = 97986;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 resume metadata refused: Resume A byte_size update matched % rows',
      updated_count;
  END IF;

  UPDATE public.media_assets
  SET byte_size = 134203
  WHERE
    id = resume_b_id
    AND bucket_path = resume_b_path
    AND kind = 'resume_pdf'
    AND purpose = 'resume'
    AND mime_type = 'application/pdf'
    AND is_public IS TRUE
    AND status = 'published'
    AND sort_order = 100
    AND byte_size = 98433;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 resume metadata refused: Resume B byte_size update matched % rows',
      updated_count;
  END IF;

  IF (
    SELECT count(*) FROM public.media_assets
    WHERE id IN (resume_a_id, resume_b_id)
      AND kind = 'resume_pdf'
      AND purpose = 'resume'
      AND mime_type = 'application/pdf'
      AND is_public IS TRUE
      AND status = 'published'
  ) <> 2 THEN
    RAISE EXCEPTION
      'V3.1 resume metadata refused: resume media identity drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = resume_a_id
      AND bucket_path = resume_a_path
      AND byte_size = 133746
  ) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = resume_b_id
      AND bucket_path = resume_b_path
      AND byte_size = 134203
  ) THEN
    RAISE EXCEPTION
      'V3.1 resume metadata refused: verified byte_size values did not persist';
  END IF;

  IF (
    SELECT count(*) FROM public.media_assets
    WHERE kind = 'resume_pdf' AND purpose = 'resume' AND status = 'published'
  ) <> 2 THEN
    RAISE EXCEPTION
      'V3.1 resume metadata refused: published resume_pdf set drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE id = cyber_track_id
      AND slug = 'cybersecurity-grc'
      AND media_asset_id = resume_a_id
      AND status = 'published'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE id = privacy_track_id
      AND slug = 'privacy-ai-governance'
      AND media_asset_id = resume_b_id
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION
      'V3.1 resume metadata refused: resume track relationships drifted';
  END IF;
END
$resume_bytes_v31$;

-- Step 52J-A.1: public release label + evergreen Resume page chrome.
-- Does not publish Google AI, Graduation, Resume files, or the contact form.
-- Idempotent: safe to re-run. Preserves existing hosted rows.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS release_label text;

UPDATE public.site_settings
SET release_label = 'Version 1.0'
WHERE singleton_key = 'default'
  AND (release_label IS NULL OR length(btrim(release_label)) = 0);

ALTER TABLE public.site_settings
  ALTER COLUMN release_label SET DEFAULT 'Version 1.0';

ALTER TABLE public.site_settings
  ALTER COLUMN release_label SET NOT NULL;

ALTER TABLE public.site_settings
  DROP CONSTRAINT IF EXISTS site_settings_release_label_not_blank;

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_release_label_not_blank
    CHECK (length(btrim(release_label)) > 0);

ALTER TABLE public.site_settings
  DROP CONSTRAINT IF EXISTS site_settings_release_label_length;

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_release_label_length
    CHECK (char_length(release_label) <= 80);

COMMENT ON COLUMN public.site_settings.release_label IS
  'Public portfolio/application version label. Single authority for footer version presentation.';

DO $$
DECLARE
  form_enabled boolean;
BEGIN
  SELECT contact_form_enabled INTO form_enabled
  FROM public.site_settings
  WHERE singleton_key = 'default';

  IF form_enabled IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Step 52J-A.1 refused: contact form is not unpublished';
  END IF;

  UPDATE public.resume_page
  SET
    kicker = 'Resume options',
    headline = 'One professional record. Focused recruiter packets.',
    lede = 'Choose the focus that best matches the opportunity. The employers, dates, and underlying professional record remain the same.',
    closing_lede = 'Email or LinkedIn is the request path. Specify the focus that matches the opportunity.'
  WHERE singleton_key = 'default';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Step 52J-A.1 refused: resume_page singleton missing';
  END IF;
END
$$;

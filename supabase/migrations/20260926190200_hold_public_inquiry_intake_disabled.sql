-- Hold public inquiry intake disabled.
-- Replaces the unapplied enable migration at this same version.
-- Confirms the default site_settings row and leaves contact_form_enabled false.
-- Does not change indexability, release label, or any other field.
-- Inquiry activation requires a future explicitly authorized migration,
-- after runtime environment verification of CONTACT_INTAKE_ENABLED
-- and the server-only intake secrets. Do not reuse this version for that.

DO $hold_inquiry_disabled$
DECLARE
  n integer;
  settings_before text;
  settings_after text;
BEGIN
  SELECT count(*) INTO n
  FROM public.site_settings
  WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Inquiry hold refused: default site_settings row matched %',
      n;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.site_settings
    WHERE singleton_key = 'default'
      AND contact_form_enabled IS DISTINCT FROM false
  ) THEN
    RAISE EXCEPTION
      'Inquiry hold refused: contact_form_enabled is not false';
  END IF;

  SELECT md5(
    id::text || '|' || singleton_key || '|' || contact_form_enabled::text
      || '|' || site_indexable::text || '|' || release_label
  ) INTO settings_before
  FROM public.site_settings
  WHERE singleton_key = 'default';

  -- No write. Public inquiry intake stays disabled.

  SELECT md5(
    id::text || '|' || singleton_key || '|' || contact_form_enabled::text
      || '|' || site_indexable::text || '|' || release_label
  ) INTO settings_after
  FROM public.site_settings
  WHERE singleton_key = 'default';

  IF settings_before IS DISTINCT FROM settings_after THEN
    RAISE EXCEPTION
      'Inquiry hold refused: site_settings changed';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.site_settings
    WHERE singleton_key = 'default'
      AND contact_form_enabled IS DISTINCT FROM false
  ) THEN
    RAISE EXCEPTION
      'Inquiry hold refused: contact_form_enabled did not remain false';
  END IF;
END
$hold_inquiry_disabled$;

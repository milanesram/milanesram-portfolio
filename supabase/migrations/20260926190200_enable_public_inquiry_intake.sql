-- Enable the existing inquiry form flag only.
-- Does not change indexability, release label, or any other site setting.
-- The form still stays closed unless CONTACT_INTAKE_ENABLED and the
-- server-only intake secrets are present.

DO $enable_inquiry$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.site_settings
  SET contact_form_enabled = true
  WHERE singleton_key = 'default'
    AND contact_form_enabled IS FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Inquiry enablement refused: contact_form_enabled was not false on the default settings row (matched %)',
      updated_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.site_settings
    WHERE singleton_key = 'default'
      AND contact_form_enabled IS DISTINCT FROM true
  ) THEN
    RAISE EXCEPTION
      'Inquiry enablement refused: contact form flag did not become true';
  END IF;
END
$enable_inquiry$;

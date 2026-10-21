-- Credentials introduction and ANU training classification.
-- Removes the public explanation of the source review. Does not invent an
-- issuer, date, or credential number.
--
-- Previous credentials_page lede (id c52f0001-0000-4000-8000-000000000001):
--   Selected verified credentials supporting the career record. Philippine
--   legal licensure is listed separately and is not U.S. bar admission.
--   Training includes ISO/IEC 27001 and ISO/IEC 27701 Lead Auditor training;
--   the approved record does not name an issuing body or completion date. An
--   NPC internal designation as ISO 9001 Internal Auditor is recorded with
--   that Commission experience and is not an external certification.
--
-- Previous credentials page_seo description and og_description:
--   Northwestern MSIS, CIPM, Certified in Cybersecurity, and ISO/IEC 27001 and
--   ISO/IEC 27701 Lead Auditor training. Philippine legal licensure is not
--   U.S. bar admission. The NPC ISO 9001 Internal Auditor designation is
--   internal experience, not an external certification.
--
-- Previous titles:
--   writing: Writing | Privacy, Compliance, GRC & IT Risk
--   contact: Contact | Privacy, Compliance, GRC & IT Risk
--
-- Previous credential d1a8fe0b-d094-4d1b-87c7-dda976001591 kind: degree.
-- The established content record classifies this professional-development
-- certificate as training. Restore by setting kind back to degree.
-- About education links are not this credential and are unchanged.

DO $credentials_copy_and_training_class$
DECLARE
  new_lede text := $t$Education, certifications, specialized training, and Philippine legal licensure supporting my career across privacy, governance, and information systems. Specialized training includes ISO/IEC 27001 and ISO/IEC 27701 Lead Auditor training. My NPC designation as an ISO 9001 Internal Auditor is internal professional experience, not an external certification. Philippine legal licensure does not imply U.S. bar admission.$t$;
  old_lede text := $t$Selected verified credentials supporting the career record. Philippine legal licensure is listed separately and is not U.S. bar admission. Training includes ISO/IEC 27001 and ISO/IEC 27701 Lead Auditor training; the approved record does not name an issuing body or completion date. An NPC internal designation as ISO 9001 Internal Auditor is recorded with that Commission experience and is not an external certification.$t$;
  old_seo_description text := $t$Northwestern MSIS, CIPM, Certified in Cybersecurity, and ISO/IEC 27001 and ISO/IEC 27701 Lead Auditor training. Philippine legal licensure is not U.S. bar admission. The NPC ISO 9001 Internal Auditor designation is internal experience, not an external certification.$t$;
  anu_id constant uuid := 'd1a8fe0b-d094-4d1b-87c7-dda976001591';
  n integer;
BEGIN
  IF (SELECT count(*) FROM public.site_settings WHERE contact_form_enabled IS TRUE) <> 0 THEN
    RAISE EXCEPTION 'credentials copy refused: contact form is enabled';
  END IF;

  IF (SELECT count(*) FROM public.site_settings WHERE site_indexable IS NOT TRUE) <> 0 THEN
    RAISE EXCEPTION 'credentials copy refused: site indexability drifted';
  END IF;

  UPDATE public.credentials_page
  SET lede = new_lede, updated_at = now()
  WHERE singleton_key = 'default'
    AND status = 'published'
    AND lede IN (old_lede, new_lede);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'credentials copy refused: credentials lede matched % rows', n;
  END IF;

  UPDATE public.page_seo
  SET
    description = new_lede,
    og_description = new_lede,
    updated_at = now()
  WHERE page_key = 'credentials'
    AND status = 'published'
    AND indexable IS TRUE
    AND description IN (old_seo_description, new_lede)
    AND og_description IN (old_seo_description, new_lede);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'credentials copy refused: credentials SEO matched % rows', n;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Writing | Privacy, Governance & Information Systems$t$,
    og_title = $t$Writing | Privacy, Governance & Information Systems$t$,
    updated_at = now()
  WHERE page_key = 'writing'
    AND status = 'published'
    AND indexable IS TRUE
    AND title IN (
      $t$Writing | Privacy, Compliance, GRC & IT Risk$t$,
      $t$Writing | Privacy, Governance & Information Systems$t$
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'credentials copy refused: writing title matched % rows', n;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Contact | Privacy, Governance & Information Systems$t$,
    og_title = $t$Contact | Privacy, Governance & Information Systems$t$,
    updated_at = now()
  WHERE page_key = 'contact'
    AND status = 'published'
    AND indexable IS TRUE
    AND title IN (
      $t$Contact | Privacy, Compliance, GRC & IT Risk$t$,
      $t$Contact | Privacy, Governance & Information Systems$t$
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'credentials copy refused: contact title matched % rows', n;
  END IF;

  UPDATE public.credentials
  SET kind = 'training', updated_at = now()
  WHERE id = anu_id
    AND status = 'published'
    AND name = $t$Professional Development Certificate in Cybersecurity$t$
    AND issuer = $t$Australian National University, National Security College$t$
    AND kind IN ('degree', 'training');
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'credentials copy refused: ANU certificate matched % rows', n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.credentials_page
    WHERE lede LIKE '%issuing body%' OR lede LIKE '%completion date%'
  ) OR EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE page_key = 'credentials'
      AND (
        description LIKE '%issuing body%'
        OR coalesce(og_description, '') LIKE '%issuing body%'
      )
  ) OR EXISTS (
    SELECT 1 FROM public.experiences
    WHERE organization = 'Scionetrade Corporation'
      AND status = 'published'
      AND title <> 'Legal Consultant'
  ) THEN
    RAISE EXCEPTION 'credentials copy refused: public wording did not land';
  END IF;
END
$credentials_copy_and_training_class$;

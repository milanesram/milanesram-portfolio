-- Optional publication SEO titles for browser/search-engine <title>
-- metadata. Does not replace canonical publication titles, slugs,
-- abstracts, PDFs, RLS, or grants.
--
-- Idempotent: safe to re-run. Fails if any of the eight expected
-- publication slugs are missing.

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS seo_title text;

ALTER TABLE public.publications
  DROP CONSTRAINT IF EXISTS publications_seo_title_shape;

ALTER TABLE public.publications
  ADD CONSTRAINT publications_seo_title_shape CHECK (
    seo_title IS NULL
    OR (
      seo_title = btrim(seo_title)
      AND char_length(seo_title) BETWEEN 1 AND 70
    )
  );

COMMENT ON COLUMN public.publications.seo_title IS
  'Optional concise browser/search-engine title. It must not replace the canonical publication title displayed to users.';

DO $$
DECLARE
  expected_slugs constant text[] := ARRAY[
    'egov-ph-architectural-fragility-bcdr',
    'ncsp-localization-local-government-units',
    'generative-ai-privacy-compliance-documentation',
    'before-blocks-build-the-bedrock',
    'philippine-elections-2025-data-privacy',
    'privacy-preserving-machine-learning-global-healthcare-ai',
    'price-of-ubiquity-gcash-critical-infrastructure',
    'data-breach-to-boardroom-cyber-governance'
  ];
  found_count integer;
  missing text[];
  mismatched integer;
BEGIN
  SELECT count(*) INTO found_count
  FROM public.publications
  WHERE slug = ANY (expected_slugs);

  IF found_count <> 8 THEN
    SELECT array_agg(s ORDER BY s)
    INTO missing
    FROM unnest(expected_slugs) AS s
    WHERE NOT EXISTS (
      SELECT 1 FROM public.publications p WHERE p.slug = s
    );

    RAISE EXCEPTION
      'publication SEO title seed expected 8 publication slugs; found %; missing: %',
      found_count,
      missing;
  END IF;

  UPDATE public.publications AS p
  SET seo_title = v.seo_title
  FROM (
    VALUES
      (
        'egov-ph-architectural-fragility-bcdr',
        'eGov PH Outage: Resilience, BC/DR & Digital Risk'
      ),
      (
        'ncsp-localization-local-government-units',
        'Localizing the Philippines’ NCSP 2023–2028 for LGUs'
      ),
      (
        'generative-ai-privacy-compliance-documentation',
        'Generative AI for Privacy Compliance Documentation'
      ),
      (
        'before-blocks-build-the-bedrock',
        'Why Blockchain Shouldn’t Lead Philippine Budget Reform'
      ),
      (
        'philippine-elections-2025-data-privacy',
        'Philippine Elections 2025: Personal Data & Privacy Risk'
      ),
      (
        'privacy-preserving-machine-learning-global-healthcare-ai',
        'Privacy-Preserving ML for Global Healthcare AI'
      ),
      (
        'price-of-ubiquity-gcash-critical-infrastructure',
        'GCash as Critical Infrastructure: Cybersecurity & Resilience'
      ),
      (
        'data-breach-to-boardroom-cyber-governance',
        'From Data Breach to Boardroom: Cybersecurity Governance'
      )
  ) AS v(slug, seo_title)
  WHERE p.slug = v.slug;

  GET DIAGNOSTICS found_count = ROW_COUNT;

  IF found_count <> 8 THEN
    RAISE EXCEPTION
      'publication SEO title seed updated % of 8 expected records',
      found_count;
  END IF;

  SELECT count(*) INTO mismatched
  FROM (
    VALUES
      (
        'egov-ph-architectural-fragility-bcdr',
        'eGov PH Outage: Resilience, BC/DR & Digital Risk'
      ),
      (
        'ncsp-localization-local-government-units',
        'Localizing the Philippines’ NCSP 2023–2028 for LGUs'
      ),
      (
        'generative-ai-privacy-compliance-documentation',
        'Generative AI for Privacy Compliance Documentation'
      ),
      (
        'before-blocks-build-the-bedrock',
        'Why Blockchain Shouldn’t Lead Philippine Budget Reform'
      ),
      (
        'philippine-elections-2025-data-privacy',
        'Philippine Elections 2025: Personal Data & Privacy Risk'
      ),
      (
        'privacy-preserving-machine-learning-global-healthcare-ai',
        'Privacy-Preserving ML for Global Healthcare AI'
      ),
      (
        'price-of-ubiquity-gcash-critical-infrastructure',
        'GCash as Critical Infrastructure: Cybersecurity & Resilience'
      ),
      (
        'data-breach-to-boardroom-cyber-governance',
        'From Data Breach to Boardroom: Cybersecurity Governance'
      )
  ) AS v(slug, seo_title)
  JOIN public.publications p ON p.slug = v.slug
  WHERE p.seo_title IS DISTINCT FROM v.seo_title;

  IF mismatched <> 0 THEN
    RAISE EXCEPTION
      'publication SEO title seed left % records with unexpected seo_title values',
      mismatched;
  END IF;
END
$$;

-- Step 1: reconcile the shared professional identity to the approved
-- global positioning. Updates only:
--   site_profile.headline
--   home_page.headline
--   page_seo identity fields for page_key = 'home'
-- Forward-only. Idempotent when the current or approved value is already stored.
-- Does not rewrite historical migrations or other page content.

DO $global_identity$
DECLARE
  n integer;
  profile_headline text;
  home_headline text;
  home_title text;
  home_description text;
  home_og_title text;
  home_og_description text;
  other_seo_before text;
  other_seo_after text;
  profile_summary_before text;
  profile_summary_after text;
  home_lede_before text;
  home_lede_after text;
  old_headline text := $t$Privacy, Compliance & Information Security Risk Professional$t$;
  new_headline text := $t$Global Privacy, Compliance & Information Security Risk Professional$t$;
  old_title text := $t$Rainier (Ram) Milanes | Privacy, Compliance, GRC & IT Risk$t$;
  new_title text := $t$Rainier (Ram) Milanes | Global Privacy, Compliance & Information Security Risk$t$;
  old_description text := $t$Experienced privacy, compliance and information-security risk professional and former privacy regulator with hands-on work across privacy operations, GRC, IT risk, security compliance, assurance, remediation and technology implementation.$t$;
  new_description text := $t$Global privacy, compliance and information-security risk professional and former privacy regulator with hands-on work across privacy operations, GRC, IT risk, security compliance, assurance, remediation and technology implementation.$t$;
BEGIN
  SELECT count(*) INTO n
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Global identity refused: expected one published site_profile, found %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Global identity refused: expected one published home_page, found %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.page_seo
  WHERE page_key = 'home' AND status = 'published' AND indexable IS TRUE;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Global identity refused: expected one published indexable home SEO row, found %', n;
  END IF;

  SELECT summary INTO profile_summary_before
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT lede INTO home_lede_before
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT md5(string_agg(
    page_key || '|' || title || '|' || description || '|' ||
    coalesce(og_title, '') || '|' || coalesce(og_description, ''),
    E'\n' ORDER BY page_key
  )) INTO other_seo_before
  FROM public.page_seo
  WHERE page_key <> 'home';

  SELECT headline INTO profile_headline
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';

  IF profile_headline = old_headline THEN
    UPDATE public.site_profile
    SET headline = new_headline
    WHERE singleton_key = 'default'
      AND status = 'published'
      AND headline = old_headline;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Global identity refused: site_profile headline update matched % rows', n;
    END IF;
  ELSIF profile_headline IS DISTINCT FROM new_headline THEN
    RAISE EXCEPTION
      'Global identity refused: site_profile headline drifted';
  END IF;

  SELECT headline INTO home_headline
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';

  IF home_headline = old_headline THEN
    UPDATE public.home_page
    SET headline = new_headline
    WHERE singleton_key = 'default'
      AND status = 'published'
      AND headline = old_headline;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Global identity refused: home_page headline update matched % rows', n;
    END IF;
  ELSIF home_headline IS DISTINCT FROM new_headline THEN
    RAISE EXCEPTION
      'Global identity refused: home_page headline drifted';
  END IF;

  SELECT title, description, og_title, og_description
  INTO home_title, home_description, home_og_title, home_og_description
  FROM public.page_seo
  WHERE page_key = 'home' AND status = 'published' AND indexable IS TRUE;

  IF home_title = old_title
    AND home_description = old_description
    AND home_og_title = old_title
    AND home_og_description = old_description
  THEN
    UPDATE public.page_seo
    SET
      title = new_title,
      description = new_description,
      og_title = new_title,
      og_description = new_description
    WHERE page_key = 'home'
      AND status = 'published'
      AND indexable IS TRUE
      AND title = old_title
      AND description = old_description
      AND og_title = old_title
      AND og_description = old_description;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Global identity refused: home SEO update matched % rows', n;
    END IF;
  ELSIF NOT (
    home_title = new_title
    AND home_description = new_description
    AND home_og_title = new_title
    AND home_og_description = new_description
  ) THEN
    RAISE EXCEPTION
      'Global identity refused: home SEO identity fields drifted';
  END IF;

  SELECT summary INTO profile_summary_after
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF profile_summary_before IS DISTINCT FROM profile_summary_after THEN
    RAISE EXCEPTION
      'Global identity refused: site_profile summary changed';
  END IF;

  SELECT lede INTO home_lede_after
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF home_lede_before IS DISTINCT FROM home_lede_after THEN
    RAISE EXCEPTION
      'Global identity refused: home_page lede changed';
  END IF;

  SELECT md5(string_agg(
    page_key || '|' || title || '|' || description || '|' ||
    coalesce(og_title, '') || '|' || coalesce(og_description, ''),
    E'\n' ORDER BY page_key
  )) INTO other_seo_after
  FROM public.page_seo
  WHERE page_key <> 'home';
  IF other_seo_before IS DISTINCT FROM other_seo_after THEN
    RAISE EXCEPTION
      'Global identity refused: non-home page SEO changed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.site_profile
    WHERE singleton_key = 'default'
      AND status = 'published'
      AND headline = new_headline
  ) OR NOT EXISTS (
    SELECT 1 FROM public.home_page
    WHERE singleton_key = 'default'
      AND status = 'published'
      AND headline = new_headline
  ) OR NOT EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE page_key = 'home'
      AND status = 'published'
      AND indexable IS TRUE
      AND title = new_title
      AND description = new_description
      AND og_title = new_title
      AND og_description = new_description
  ) THEN
    RAISE EXCEPTION
      'Global identity refused: approved identity was not stored';
  END IF;
END
$global_identity$;

-- Schema compatibility for home_page.hero_kicker.
-- Safe for the currently deployed application and the V4 application.
-- Nullable, with no default and no content update, so public copy does not change.
-- The deployed app does not select or write this column.
-- The V4 app treats null or blank as "no eyebrow" and does not invent kicker copy.

ALTER TABLE public.home_page
  ADD COLUMN IF NOT EXISTS hero_kicker text;

ALTER TABLE public.home_page
  DROP CONSTRAINT IF EXISTS home_page_hero_kicker_present;

ALTER TABLE public.home_page
  ADD CONSTRAINT home_page_hero_kicker_present
    CHECK (
      hero_kicker IS NULL
      OR (
        length(btrim(hero_kicker)) > 0
        AND char_length(hero_kicker) <= 80
      )
    );

COMMENT ON COLUMN public.home_page.hero_kicker IS
  'Optional public homepage eyebrow. Null hides it. Career copy is applied by a later content migration.';

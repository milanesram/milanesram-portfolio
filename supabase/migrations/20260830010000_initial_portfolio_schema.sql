-- Local preparation only. Do not apply to the hosted project in this step.
-- No private-source / comprehensive-CV fields. No phone column.

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------

CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.track_tag AS ENUM ('all', 'cybersecurity_grc', 'privacy_ai');
CREATE TYPE public.experience_kind AS ENUM (
  'employment',
  'consulting',
  'additional',
  'leadership'
);
CREATE TYPE public.credential_kind AS ENUM (
  'degree',
  'certification',
  'training',
  'license'
);
CREATE TYPE public.engagement_kind AS ENUM (
  'speaking',
  'advisory',
  'award',
  'leadership',
  'teaching',
  'category'
);
CREATE TYPE public.inquiry_context AS ENUM (
  'recruiter',
  'hiring_manager',
  'other'
);
CREATE TYPE public.inquiry_track AS ENUM (
  'cybersecurity_grc',
  'privacy_ai',
  'either'
);
CREATE TYPE public.media_kind AS ENUM ('resume_pdf', 'image', 'document');
CREATE TYPE public.admin_role AS ENUM ('owner', 'admin');

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger (invoker, not SECURITY DEFINER)
-- ---------------------------------------------------------------------------

CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Authorization
-- ---------------------------------------------------------------------------

-- Authorization roster. Not exposed through the Data API.
-- First owner row is inserted later via a trusted SQL-editor action.
-- MVP role management through anon/authenticated grants is out of scope.
CREATE TABLE public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.admin_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('owner', 'admin')
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'SECURITY DEFINER: reads public.user_roles to decide admin status. search_path is empty. Only checks auth.uid() against explicit role rows. Execute granted to authenticated only so admin RLS policies can call it. Not granted to anon or PUBLIC.';

-- First admin row is inserted later via a one-time SQL editor action
-- after Auth users exist. This migration does not create users and does
-- not grant Data API privileges on user_roles.

-- ---------------------------------------------------------------------------
-- Media (metadata only; Storage buckets are not created here)
-- ---------------------------------------------------------------------------

CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_path text NOT NULL,
  kind public.media_kind NOT NULL,
  title text NOT NULL,
  alt_text text,
  is_public boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_bucket_path_not_blank CHECK (char_length(trim(bucket_path)) > 0)
);

-- ---------------------------------------------------------------------------
-- Site chrome
-- ---------------------------------------------------------------------------

CREATE TABLE public.site_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  display_name text NOT NULL,
  headline text NOT NULL,
  summary text NOT NULL,
  work_authorization text NOT NULL,
  location_display text,
  linkedin_url text NOT NULL,
  public_email text NOT NULL,
  hero_cta_primary_label text,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_profile_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT site_profile_singleton_key UNIQUE (singleton_key)
);

-- Intentionally public website configuration only.
-- Columns: contact_form_enabled, site_indexable, singleton_key, timestamps.
-- Never store secrets, administrator data, or unpublished/internal settings here.
-- Public SELECT USING (true) is valid only while this invariant holds.
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  contact_form_enabled boolean NOT NULL DEFAULT false,
  site_indexable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT site_settings_singleton_key UNIQUE (singleton_key)
);

CREATE TABLE public.focus_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  nav_label text NOT NULL,
  headline text NOT NULL,
  summary text NOT NULL,
  competencies text[] NOT NULL DEFAULT '{}',
  resume_media_id uuid REFERENCES public.media_assets (id) ON DELETE SET NULL,
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT focus_pages_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT focus_pages_slug_unique UNIQUE (slug)
);

-- ---------------------------------------------------------------------------
-- Portfolio content
-- ---------------------------------------------------------------------------

CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  title text NOT NULL,
  title_secondary text,
  location_display text NOT NULL,
  kind public.experience_kind NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  summary text,
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experiences_date_range CHECK (
    end_date IS NULL OR end_date >= start_date
  )
);

CREATE TABLE public.experience_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences (id) ON DELETE CASCADE,
  body text NOT NULL,
  track public.track_tag NOT NULL DEFAULT 'all',
  is_metric boolean NOT NULL DEFAULT false,
  metric_context text,
  show_on_home boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_items_metric_context CHECK (
    (NOT is_metric) OR (metric_context IS NOT NULL AND char_length(trim(metric_context)) > 0)
  )
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL,
  year_label text NOT NULL,
  role text NOT NULL,
  summary text NOT NULL,
  stack text[] NOT NULL DEFAULT '{}',
  limits text NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT projects_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT projects_slug_unique UNIQUE (slug)
);

CREATE TABLE public.project_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  heading text NOT NULL,
  body text NOT NULL,
  track public.track_tag NOT NULL DEFAULT 'all',
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  publisher text NOT NULL,
  published_on date,
  year_label text NOT NULL,
  abstract text NOT NULL,
  external_url text,
  track public.track_tag NOT NULL DEFAULT 'all',
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT publications_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT publications_slug_unique UNIQUE (slug)
);

CREATE TABLE public.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.credential_kind NOT NULL,
  name text NOT NULL,
  issuer text NOT NULL,
  year_label text,
  details text,
  needs_verification boolean NOT NULL DEFAULT false,
  track public.track_tag NOT NULL DEFAULT 'all',
  highlight boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.engagement_kind NOT NULL,
  title text NOT NULL,
  host text,
  role_label text,
  year_label text,
  body text,
  track public.track_tag NOT NULL DEFAULT 'all',
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contact inbox. No anonymous insert policy or grant in this migration.
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organization text,
  context public.inquiry_context NOT NULL,
  track public.inquiry_track NOT NULL DEFAULT 'either',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX experiences_status_sort_idx ON public.experiences (status, sort_order);
CREATE INDEX experiences_featured_idx ON public.experiences (is_featured) WHERE is_featured;
CREATE INDEX experience_items_experience_id_idx ON public.experience_items (experience_id, sort_order);
CREATE INDEX experience_items_status_home_idx ON public.experience_items (status, show_on_home);
CREATE INDEX projects_status_featured_idx ON public.projects (status, is_featured, sort_order);
CREATE INDEX project_sections_project_id_idx ON public.project_sections (project_id, sort_order);
CREATE INDEX publications_status_sort_idx ON public.publications (status, sort_order);
CREATE INDEX credentials_status_highlight_idx ON public.credentials (status, highlight, sort_order);
CREATE INDEX engagements_status_sort_idx ON public.engagements (status, sort_order);
CREATE INDEX media_assets_public_idx ON public.media_assets (status, is_public);
CREATE INDEX focus_pages_status_sort_idx ON public.focus_pages (status, sort_order);
CREATE INDEX inquiries_created_at_idx ON public.inquiries (created_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER user_roles_set_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER media_assets_set_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER site_profile_set_updated_at
  BEFORE UPDATE ON public.site_profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER focus_pages_set_updated_at
  BEFORE UPDATE ON public.focus_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER experiences_set_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER experience_items_set_updated_at
  BEFORE UPDATE ON public.experience_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER project_sections_set_updated_at
  BEFORE UPDATE ON public.project_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER publications_set_updated_at
  BEFORE UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER credentials_set_updated_at
  BEFORE UPDATE ON public.credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER engagements_set_updated_at
  BEFORE UPDATE ON public.engagements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Privileges
-- Automatically expose new tables is DISABLED, so grants are explicit.
-- RLS still filters every granted privilege.
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON TABLE public.user_roles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.site_profile FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.site_settings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.focus_pages FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.experiences FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.experience_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.projects FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.project_sections FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.publications FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.credentials FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.engagements FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.media_assets FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.inquiries FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.site_profile TO anon, authenticated;
GRANT SELECT ON TABLE public.site_settings TO anon, authenticated;
GRANT SELECT ON TABLE public.focus_pages TO anon, authenticated;
GRANT SELECT ON TABLE public.experiences TO anon, authenticated;
GRANT SELECT ON TABLE public.experience_items TO anon, authenticated;
GRANT SELECT ON TABLE public.projects TO anon, authenticated;
GRANT SELECT ON TABLE public.project_sections TO anon, authenticated;
GRANT SELECT ON TABLE public.publications TO anon, authenticated;
GRANT SELECT ON TABLE public.credentials TO anon, authenticated;
GRANT SELECT ON TABLE public.engagements TO anon, authenticated;
GRANT SELECT ON TABLE public.media_assets TO anon, authenticated;

-- user_roles: no GRANT to anon or authenticated. Table stays Data-API private.
-- is_admin() may still read it as SECURITY DEFINER.
GRANT INSERT, UPDATE, DELETE ON TABLE public.site_profile TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.site_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.focus_pages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.experiences TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.experience_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.project_sections TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.publications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.credentials TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.engagements TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.media_assets TO authenticated;

-- Inbox: admins may read/update/delete. No INSERT grant yet (contact form later).
GRANT SELECT, UPDATE, DELETE ON TABLE public.inquiries TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_profile FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.focus_pages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.experiences FORCE ROW LEVEL SECURITY;
ALTER TABLE public.experience_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.projects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.project_sections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.publications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE public.engagements FORCE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries FORCE ROW LEVEL SECURITY;

-- Public / authenticated: published content only.
CREATE POLICY site_profile_select_published
  ON public.site_profile
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Safe while site_settings remains public-only website flags (see table comment).
CREATE POLICY site_settings_select
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY focus_pages_select_published
  ON public.focus_pages
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY experiences_select_published
  ON public.experiences
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY experience_items_select_published
  ON public.experience_items
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY projects_select_published
  ON public.projects
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY project_sections_select_published
  ON public.project_sections
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY publications_select_published
  ON public.publications
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY credentials_select_published
  ON public.credentials
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND needs_verification = false);

CREATE POLICY engagements_select_published
  ON public.engagements
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY media_assets_select_public
  ON public.media_assets
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND is_public = true);

-- Authenticated writes and private reads: admin only.
-- Authenticated non-admins do not receive management privileges.
-- user_roles has no Data API policy: bootstrap and role changes are
-- owner-only SQL-editor actions, out of scope for the MVP.

CREATE POLICY site_profile_admin_all
  ON public.site_profile
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY site_settings_admin_all
  ON public.site_settings
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY focus_pages_admin_all
  ON public.focus_pages
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY experiences_admin_all
  ON public.experiences
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY experience_items_admin_all
  ON public.experience_items
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY projects_admin_all
  ON public.projects
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY project_sections_admin_all
  ON public.project_sections
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY publications_admin_all
  ON public.publications
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY credentials_admin_all
  ON public.credentials
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagements_admin_all
  ON public.engagements
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY media_assets_admin_all
  ON public.media_assets
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY inquiries_admin_select
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY inquiries_admin_update
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY inquiries_admin_delete
  ON public.inquiries
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

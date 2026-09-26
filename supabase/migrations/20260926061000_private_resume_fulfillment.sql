-- Private resume fulfillment and closed-request retention.
-- Does not delete public-media objects, media_assets rows, or resume PDFs.
-- Does not grant anonymous access to requests or private documents.
-- Signed URLs are not stored.

CREATE OR REPLACE FUNCTION public.submit_public_resume_request(
  p_full_name text,
  p_email text,
  p_organization text,
  p_resume_choice public.resume_request_choice,
  p_message text,
  p_fingerprint_hash text,
  p_email_hash text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_name text;
  v_email text;
  v_organization text;
  v_message text;
  v_fingerprint text;
  v_email_hash text;
  v_fp_count integer;
  v_email_count integer;
BEGIN
  v_name := pg_catalog.regexp_replace(
    pg_catalog.btrim(p_full_name),
    '[[:space:]]+',
    ' ',
    'g'
  );
  v_email := pg_catalog.lower(pg_catalog.btrim(p_email));
  v_organization := pg_catalog.regexp_replace(
    pg_catalog.btrim(p_organization),
    '[[:space:]]+',
    ' ',
    'g'
  );
  IF p_message IS NULL THEN
    v_message := NULL;
  ELSE
    v_message := pg_catalog.regexp_replace(
      pg_catalog.btrim(p_message),
      '[[:space:]]+',
      ' ',
      'g'
    );
    IF v_message = '' THEN
      v_message := NULL;
    END IF;
  END IF;
  v_fingerprint := pg_catalog.btrim(p_fingerprint_hash);
  v_email_hash := pg_catalog.btrim(p_email_hash);

  IF v_name IS NULL
    OR pg_catalog.char_length(v_name) < 2
    OR pg_catalog.char_length(v_name) > 120
  THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  IF v_email IS NULL
    OR pg_catalog.char_length(v_email) > 254
    OR v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  IF v_organization IS NULL
    OR pg_catalog.char_length(v_organization) < 2
    OR pg_catalog.char_length(v_organization) > 160
  THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  IF v_message IS NOT NULL AND pg_catalog.char_length(v_message) > 1500 THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  IF p_resume_choice IS NULL
    OR p_resume_choice NOT IN (
      'grc_it_risk'::public.resume_request_choice,
      'privacy_compliance'::public.resume_request_choice,
      'professional_cv'::public.resume_request_choice,
      'not_sure'::public.resume_request_choice
    )
  THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  IF v_fingerprint !~ '^[a-f0-9]{64}$' OR v_email_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('resume-fp:' || v_fingerprint)
  );
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('resume-email:' || v_email_hash)
  );

  DELETE FROM public.resume_request_submission_events
  WHERE created_at < pg_catalog.now() - interval '24 hours';

  SELECT count(*)
    INTO v_fp_count
  FROM public.resume_request_submission_events
  WHERE fingerprint_hash = v_fingerprint
    AND created_at > pg_catalog.now() - interval '15 minutes';

  IF v_fp_count >= 5 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*)
    INTO v_email_count
  FROM public.resume_request_submission_events
  WHERE email_hash = v_email_hash
    AND created_at > pg_catalog.now() - interval '60 minutes';

  IF v_email_count >= 3 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.resume_requests
    WHERE email = v_email
      AND full_name = v_name
      AND organization = v_organization
      AND resume_choice = p_resume_choice
      AND message IS NOT DISTINCT FROM v_message
      AND created_at > pg_catalog.now() - interval '2 minutes'
  ) THEN
    RAISE EXCEPTION 'duplicate_request' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.resume_request_submission_events (
    fingerprint_hash,
    email_hash
  ) VALUES (
    v_fingerprint,
    v_email_hash
  );

  INSERT INTO public.resume_requests (
    full_name,
    email,
    organization,
    resume_choice,
    message,
    status
  ) VALUES (
    v_name,
    v_email,
    v_organization,
    p_resume_choice,
    v_message,
    'new'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_resume_request(
  text,
  text,
  text,
  public.resume_request_choice,
  text,
  text,
  text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_public_resume_request(
  text,
  text,
  text,
  public.resume_request_choice,
  text,
  text,
  text
) TO service_role;

ALTER TABLE public.resume_requests
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN closed_at timestamptz,
  ADD COLUMN fulfilled_at timestamptz,
  ADD COLUMN fulfilled_document text,
  ADD COLUMN fulfilled_by uuid;

ALTER TABLE public.resume_requests
  ADD CONSTRAINT resume_requests_fulfilled_document_allowed CHECK (
    fulfilled_document IS NULL
    OR fulfilled_document IN (
      'grc_it_risk',
      'privacy_compliance',
      'professional_cv'
    )
  );

UPDATE public.resume_requests
SET closed_at = pg_catalog.now()
WHERE status = 'closed'::public.resume_request_status
  AND closed_at IS NULL;

ALTER TABLE public.resume_requests
  ADD CONSTRAINT resume_requests_closed_at_matches_status CHECK (
    (
      status = 'closed'::public.resume_request_status
      AND closed_at IS NOT NULL
    )
    OR (
      status <> 'closed'::public.resume_request_status
      AND closed_at IS NULL
    )
  );

CREATE INDEX resume_requests_closed_retention_idx
  ON public.resume_requests (closed_at)
  WHERE status = 'closed'::public.resume_request_status;

COMMENT ON COLUMN public.resume_requests.closed_at IS
  'Set when the request becomes closed. Cleared if it is reopened. Used only for the 90-day closed-request retention rule.';

CREATE OR REPLACE FUNCTION public.resume_requests_apply_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'closed'::public.resume_request_status THEN
      IF NEW.closed_at IS NULL THEN
        NEW.closed_at := pg_catalog.now();
      END IF;
    ELSE
      NEW.closed_at := NULL;
    END IF;

    IF NEW.status = 'reviewed'::public.resume_request_status
      AND NEW.reviewed_at IS NULL
    THEN
      NEW.reviewed_at := pg_catalog.now();
    END IF;

    RETURN NEW;
  END IF;

  IF NEW.status = 'reviewed'::public.resume_request_status
    AND OLD.status IS DISTINCT FROM 'reviewed'::public.resume_request_status
    AND NEW.reviewed_at IS NULL
  THEN
    NEW.reviewed_at := pg_catalog.now();
  END IF;

  IF NEW.status = 'closed'::public.resume_request_status
    AND OLD.status IS DISTINCT FROM 'closed'::public.resume_request_status
  THEN
    NEW.closed_at := pg_catalog.now();
  END IF;

  IF OLD.status = 'closed'::public.resume_request_status
    AND NEW.status IS DISTINCT FROM 'closed'::public.resume_request_status
  THEN
    NEW.closed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.resume_requests_apply_lifecycle() FROM PUBLIC;

CREATE TRIGGER resume_requests_apply_lifecycle
  BEFORE INSERT OR UPDATE ON public.resume_requests
  FOR EACH ROW EXECUTE FUNCTION public.resume_requests_apply_lifecycle();

CREATE OR REPLACE FUNCTION public.count_expired_resume_requests()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT pg_catalog.count(*)::integer
  FROM public.resume_requests
  WHERE status = 'closed'::public.resume_request_status
    AND closed_at IS NOT NULL
    AND closed_at < pg_catalog.now() - interval '90 days';
$$;

CREATE OR REPLACE FUNCTION public.purge_expired_resume_requests()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.resume_requests
  WHERE status = 'closed'::public.resume_request_status
    AND closed_at IS NOT NULL
    AND closed_at < pg_catalog.now() - interval '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.count_expired_resume_requests()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_resume_requests()
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.count_expired_resume_requests() TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_resume_requests() TO service_role;

COMMENT ON FUNCTION public.purge_expired_resume_requests() IS
  'Owner-invoked purge. Deletes only closed resume requests whose closed_at is older than 90 days. Returns a count and no requester data. Not scheduled.';

-- Dedicated owner-only catalog. media_assets remains the public-media model
-- and grants bucket_path to anon for published public rows, so private
-- object paths are not stored there.
CREATE TABLE public.private_document_assets (
  document_key text PRIMARY KEY,
  title text NOT NULL,
  version_label text NOT NULL,
  storage_bucket text NOT NULL DEFAULT 'private-resumes',
  object_path text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/pdf',
  byte_size bigint NOT NULL,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT private_document_assets_key_allowed CHECK (
    document_key IN ('grc_it_risk', 'privacy_compliance', 'professional_cv')
  ),
  CONSTRAINT private_document_assets_bucket CHECK (
    storage_bucket = 'private-resumes'
  ),
  CONSTRAINT private_document_assets_path CHECK (
    char_length(btrim(object_path)) > 0
    AND object_path = btrim(object_path)
    AND object_path !~ '(^/)|(\.\.)'
  ),
  CONSTRAINT private_document_assets_mime CHECK (
    mime_type = 'application/pdf'
  ),
  CONSTRAINT private_document_assets_byte_size CHECK (byte_size > 0),
  CONSTRAINT private_document_assets_title CHECK (
    char_length(btrim(title)) > 0
  )
);

COMMENT ON TABLE public.private_document_assets IS
  'Owner-only private resume and CV fulfillment catalog. Rows are inactive until the private object is hash-verified. Signed URLs are not stored.';

REVOKE ALL ON TABLE public.private_document_assets
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.private_document_assets TO authenticated;
GRANT ALL ON TABLE public.private_document_assets TO service_role;

ALTER TABLE public.private_document_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_document_assets FORCE ROW LEVEL SECURITY;

CREATE POLICY private_document_assets_admin_select
  ON public.private_document_assets
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
SELECT
  'private-resumes',
  'private-resumes',
  false,
  15728640,
  ARRAY['application/pdf']::text[]
WHERE NOT EXISTS (
  SELECT 1
  FROM storage.buckets
  WHERE id = 'private-resumes'
);

DO $private_resume_bucket$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'private-resumes'
      AND public IS FALSE
  ) THEN
    RAISE EXCEPTION
      'private-resumes bucket is missing or public';
  END IF;
END
$private_resume_bucket$;

-- No storage.objects policy is created for private-resumes.
-- service_role bypasses storage RLS. Anonymous and authenticated roles
-- receive no read, list, or write policy on this bucket.

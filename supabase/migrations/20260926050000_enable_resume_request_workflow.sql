-- Controlled resume-request intake.
-- Does not rewrite applied migrations.
-- Does not delete, overwrite, or relabel resume PDF objects.
-- Does not grant anonymous read, update, or delete on requests.
-- The only creation path is a server-privileged RPC.

CREATE TYPE public.resume_request_choice AS ENUM (
  'grc_it_risk',
  'privacy_compliance',
  'not_sure'
);

CREATE TYPE public.resume_request_status AS ENUM (
  'new',
  'reviewed',
  'closed'
);

CREATE TABLE public.resume_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  organization text NOT NULL,
  resume_choice public.resume_request_choice NOT NULL,
  message text,
  status public.resume_request_status NOT NULL DEFAULT 'new',
  CONSTRAINT resume_requests_full_name_bounds CHECK (
    char_length(full_name) BETWEEN 2 AND 120
    AND full_name = btrim(full_name)
    AND full_name !~ '[[:space:]]{2}'
  ),
  CONSTRAINT resume_requests_email_bounds CHECK (
    char_length(email) BETWEEN 3 AND 254
    AND email = lower(btrim(email))
    AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  ),
  CONSTRAINT resume_requests_organization_bounds CHECK (
    char_length(organization) BETWEEN 2 AND 160
    AND organization = btrim(organization)
    AND organization !~ '[[:space:]]{2}'
  ),
  CONSTRAINT resume_requests_message_bounds CHECK (
    message IS NULL
    OR (
      char_length(message) BETWEEN 1 AND 1500
      AND message = btrim(message)
    )
  )
);

CREATE INDEX resume_requests_created_at_idx
  ON public.resume_requests (created_at DESC);

CREATE INDEX resume_requests_status_created_idx
  ON public.resume_requests (status, created_at DESC);

CREATE INDEX resume_requests_email_choice_created_idx
  ON public.resume_requests (email, resume_choice, created_at DESC);

COMMENT ON TABLE public.resume_requests IS
  'Owner-only professional resume requests. Anonymous roles cannot read, update, or delete rows. Review them in /admin/resume-requests. There is no automatic resume delivery.';

-- Short-lived abuse-control hashes only. Raw IP addresses and user agents
-- are not stored. Rows older than 24 hours are deleted during intake.
CREATE TABLE public.resume_request_submission_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash text NOT NULL,
  email_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resume_request_events_fingerprint_hash_hex
    CHECK (fingerprint_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT resume_request_events_email_hash_hex
    CHECK (email_hash ~ '^[a-f0-9]{64}$')
);

CREATE INDEX resume_request_events_fingerprint_created_idx
  ON public.resume_request_submission_events (fingerprint_hash, created_at DESC);

CREATE INDEX resume_request_events_email_created_idx
  ON public.resume_request_submission_events (email_hash, created_at DESC);

CREATE INDEX resume_request_events_created_at_idx
  ON public.resume_request_submission_events (created_at);

COMMENT ON TABLE public.resume_request_submission_events IS
  'Short-lived hashed rate-limit events for resume requests. Not readable by anonymous or authenticated clients.';

REVOKE ALL ON TABLE public.resume_requests FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.resume_request_submission_events
  FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.resume_requests TO authenticated;

ALTER TABLE public.resume_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.resume_request_submission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_request_submission_events FORCE ROW LEVEL SECURITY;

CREATE POLICY resume_requests_admin_select
  ON public.resume_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY resume_requests_admin_update
  ON public.resume_requests
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE OR REPLACE FUNCTION public.resume_requests_protect_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR NEW.full_name IS DISTINCT FROM OLD.full_name
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.organization IS DISTINCT FROM OLD.organization
    OR NEW.resume_choice IS DISTINCT FROM OLD.resume_choice
    OR NEW.message IS DISTINCT FROM OLD.message
  THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.resume_requests_protect_identity() FROM PUBLIC;

CREATE TRIGGER resume_requests_protect_identity
  BEFORE UPDATE ON public.resume_requests
  FOR EACH ROW EXECUTE FUNCTION public.resume_requests_protect_identity();

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

COMMENT ON FUNCTION public.submit_public_resume_request(
  text,
  text,
  text,
  public.resume_request_choice,
  text,
  text,
  text
) IS
  'Server-privileged resume-request intake. Not executable by anon or authenticated. Stores no raw IP address. Rate-limit hashes older than 24 hours are deleted opportunistically.';

-- Return both published tracks to request delivery.
-- Media relationships, titles, summaries, and PDF records stay in place.
DO $resume_request_cutover$
DECLARE
  media_a_id constant uuid := 'f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5';
  media_b_id constant uuid := '29a9954b-5169-45dc-9b82-be04e041ba78';
  path_a constant text :=
    'resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf';
  path_b constant text :=
    'resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf';
  v31_a_id constant uuid := 'bfa474f1-c193-4b29-8d6f-876d3799d164';
  v31_b_id constant uuid := '07f4993f-d385-4842-9909-f35d4f9be662';
  updated_count integer;
  matched_count integer;
BEGIN
  SELECT count(*) INTO matched_count
  FROM public.resume_tracks
  WHERE status = 'published';

  IF matched_count <> 2 THEN
    RAISE EXCEPTION
      'Resume request workflow refused: unexpected published resume track count (matched %)',
      matched_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET
    delivery_mode = 'request',
    request_cta_label = $t$Request a copy$t$
  WHERE
    track.slug = 'cybersecurity-grc'
    AND track.status = 'published'
    AND track.title = $t$Resume A — GRC, IT Risk & Security Compliance$t$
    AND track.delivery_mode = 'public_file'
    AND track.media_asset_id = media_a_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Resume request workflow refused: Resume A request cutover matched % rows',
      updated_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET
    delivery_mode = 'request',
    request_cta_label = $t$Request a copy$t$
  WHERE
    track.slug = 'privacy-ai-governance'
    AND track.status = 'published'
    AND track.title = $t$Resume B — Privacy, Compliance & Assurance$t$
    AND track.delivery_mode = 'public_file'
    AND track.media_asset_id = media_b_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Resume request workflow refused: Resume B request cutover matched % rows',
      updated_count;
  END IF;

  IF (
    SELECT count(*)
    FROM public.resume_tracks
    WHERE status = 'published' AND delivery_mode = 'request'
  ) <> 2 THEN
    RAISE EXCEPTION
      'Resume request workflow refused: published tracks are not request-only';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.resume_tracks
    WHERE
      status = 'published'
      AND slug NOT IN ('cybersecurity-grc', 'privacy-ai-governance')
  ) THEN
    RAISE EXCEPTION
      'Resume request workflow refused: unexpected third published resume track';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'cybersecurity-grc'
      AND track.title = $t$Resume A — GRC, IT Risk & Security Compliance$t$
      AND track.summary = $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, TPRM, audit readiness and remediation roles.$t$
      AND track.delivery_mode = 'request'
      AND track.request_cta_label = $t$Request a copy$t$
      AND media.id = media_a_id
      AND media.bucket_path = path_a
      AND media.byte_size = 123610
      AND media.title = $t$Resume A V4.0 — GRC, IT Risk & Security Compliance$t$
      AND media.mime_type = 'application/pdf'
      AND media.kind = 'resume_pdf'
      AND media.purpose = 'resume'
      AND media.status = 'published'
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks AS track
    JOIN public.media_assets AS media ON media.id = track.media_asset_id
    WHERE
      track.slug = 'privacy-ai-governance'
      AND track.title = $t$Resume B — Privacy, Compliance & Assurance$t$
      AND track.summary = $t$For privacy operations, data protection, privacy compliance and assurance, privacy risk, breach and incident governance, privacy technology and related governance roles.$t$
      AND track.delivery_mode = 'request'
      AND track.request_cta_label = $t$Request a copy$t$
      AND media.id = media_b_id
      AND media.bucket_path = path_b
      AND media.byte_size = 123872
      AND media.title = $t$Resume B V4.0 — Privacy, Compliance & Assurance$t$
      AND media.mime_type = 'application/pdf'
      AND media.kind = 'resume_pdf'
      AND media.purpose = 'resume'
      AND media.status = 'published'
  ) THEN
    RAISE EXCEPTION
      'Resume request workflow refused: V4 resume relationship or record did not remain intact';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE
      id = v31_a_id
      AND bucket_path = 'resume/bfa474f1-c193-4b29-8d6f-876d3799d164/ramilanes_resume_cybersecurity_grc.pdf'
      AND byte_size = 133746
  ) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE
      id = v31_b_id
      AND bucket_path = 'resume/07f4993f-d385-4842-9909-f35d4f9be662/ramilanes_resume_privacy_ai_governance.pdf'
      AND byte_size = 134203
  ) THEN
    RAISE EXCEPTION
      'Resume request workflow refused: a historical V3.1 resume record changed';
  END IF;
END
$resume_request_cutover$;

-- Forward-only public inquiry intake. Does not grant table INSERT on
-- public.inquiries to anon or authenticated. Does not add an INSERT RLS
-- policy. The only creation path is a server-privileged RPC.

CREATE TABLE public.inquiry_submission_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash text NOT NULL,
  email_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inquiry_submission_events_fingerprint_hash_hex
    CHECK (fingerprint_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT inquiry_submission_events_email_hash_hex
    CHECK (email_hash ~ '^[a-f0-9]{64}$')
);

CREATE INDEX inquiry_submission_events_fingerprint_created_idx
  ON public.inquiry_submission_events (fingerprint_hash, created_at DESC);

CREATE INDEX inquiry_submission_events_email_created_idx
  ON public.inquiry_submission_events (email_hash, created_at DESC);

CREATE INDEX inquiry_submission_events_created_at_idx
  ON public.inquiry_submission_events (created_at);

REVOKE ALL ON TABLE public.inquiry_submission_events
  FROM PUBLIC, anon, authenticated;

ALTER TABLE public.inquiry_submission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_submission_events FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.submit_public_inquiry(
  p_name text,
  p_email text,
  p_organization text,
  p_context public.inquiry_context,
  p_track public.inquiry_track,
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
  v_name := pg_catalog.btrim(p_name);
  v_email := pg_catalog.lower(pg_catalog.btrim(p_email));
  IF p_organization IS NULL THEN
    v_organization := NULL;
  ELSE
    v_organization := pg_catalog.btrim(p_organization);
    IF v_organization = '' THEN
      v_organization := NULL;
    END IF;
  END IF;
  v_message := pg_catalog.btrim(p_message);
  v_fingerprint := pg_catalog.btrim(p_fingerprint_hash);
  v_email_hash := pg_catalog.btrim(p_email_hash);

  IF v_name IS NULL
    OR pg_catalog.char_length(v_name) < 1
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

  IF v_organization IS NOT NULL
    AND pg_catalog.char_length(v_organization) > 160
  THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  IF v_message IS NULL
    OR pg_catalog.char_length(v_message) < 10
    OR pg_catalog.char_length(v_message) > 5000
  THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  IF v_fingerprint !~ '^[a-f0-9]{64}$' OR v_email_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('fp:' || v_fingerprint)
  );
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('email:' || v_email_hash)
  );

  DELETE FROM public.inquiry_submission_events
  WHERE created_at < pg_catalog.now() - interval '24 hours';

  SELECT count(*)
    INTO v_fp_count
  FROM public.inquiry_submission_events
  WHERE fingerprint_hash = v_fingerprint
    AND created_at > pg_catalog.now() - interval '15 minutes';

  IF v_fp_count >= 5 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*)
    INTO v_email_count
  FROM public.inquiry_submission_events
  WHERE email_hash = v_email_hash
    AND created_at > pg_catalog.now() - interval '60 minutes';

  IF v_email_count >= 3 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.inquiry_submission_events (
    fingerprint_hash,
    email_hash
  ) VALUES (
    v_fingerprint,
    v_email_hash
  );

  INSERT INTO public.inquiries (
    name,
    email,
    organization,
    context,
    track,
    message
  ) VALUES (
    v_name,
    v_email,
    v_organization,
    p_context,
    p_track,
    v_message
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_inquiry(
  text, text, text, public.inquiry_context, public.inquiry_track, text, text, text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_public_inquiry(
  text, text, text, public.inquiry_context, public.inquiry_track, text, text, text
) TO service_role;

COMMENT ON FUNCTION public.submit_public_inquiry(
  text, text, text, public.inquiry_context, public.inquiry_track, text, text, text
) IS
  'Server-privileged public inquiry intake. Not executable by anon or authenticated. Rate-limit events older than 24 hours are deleted opportunistically.';

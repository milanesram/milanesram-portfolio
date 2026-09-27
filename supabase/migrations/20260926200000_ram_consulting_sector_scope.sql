-- V4-03D: one anonymized sector/scope item on the RAM Privacy & Security role.
-- Does not replace existing bullets, rename the role, or repeat the list elsewhere.
-- Does not name clients or add quantitative outcomes.
-- Forward-only. Do not apply from the implementation candidate.

DO $ram_consulting_scope$
DECLARE
  role_id uuid := '982e5fae-ec27-49c5-9d7f-b88873bc33ec';
  new_item_id uuid := 'c4030d26-2026-4d00-8000-000000000001';
  scope_body text := $scope$Selected consulting work: Government (policy, digital transformation, BC/DR); manufacturing (AI governance, ICS cybersecurity); insurance (digital transformation); financial institutions (privacy operations); business process outsourcing (HR privacy); retail (compliance); energy (ICS cybersecurity); and hospitals and clinics (patient privacy).$scope$;
  n integer;
BEGIN
  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = role_id
    AND organization = 'RAM Privacy & Security'
    AND title = 'Principal Consultant'
    AND status = 'published'
    AND sort_order = 10
    AND is_current IS TRUE
    AND start_date = DATE '2024-10-01'
    AND end_date IS NULL;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'RAM consulting scope refused: Principal Consultant role did not match the expected record (matched %)',
      n;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.experience_items
    WHERE experience_id = role_id
      AND body = scope_body
  ) OR EXISTS (
    SELECT 1 FROM public.experience_items WHERE id = new_item_id
  ) THEN
    RAISE EXCEPTION
      'RAM consulting scope refused: sector/scope item already exists';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = role_id
    AND status = 'published'
    AND is_metric IS FALSE
    AND id IN (
      '4fcf85b9-f34d-41c5-8ebd-ff37be9534ad',
      'b74f1a93-4c9c-47a2-9389-2a4590716fea',
      'a48d8744-0777-4dec-8f24-deea971cfa13',
      'a6685287-de72-4919-8840-94255d5fd6c2'
    )
    AND (
      (id = '4fcf85b9-f34d-41c5-8ebd-ff37be9534ad' AND sort_order = 10 AND track = 'all'
        AND body = 'Assess cybersecurity, privacy, and technology-risk issues for regulated and high-risk organizations and translate findings into governance, control, and remediation work.')
      OR (id = 'b74f1a93-4c9c-47a2-9389-2a4590716fea' AND sort_order = 20 AND track = 'all'
        AND body = 'Conduct risk assessments and translate findings into prioritized remediation actions, implementation roadmaps, and measurable controls.')
      OR (id = 'a48d8744-0777-4dec-8f24-deea971cfa13' AND sort_order = 30 AND track = 'privacy_ai'
        AND body = 'Conduct privacy and security risk assessments and translate findings into prioritized remediation actions, measurable controls, policies, standards, procedures, and implementation guidance.')
      OR (id = 'a6685287-de72-4919-8840-94255d5fd6c2' AND sort_order = 40 AND track = 'all'
        AND body = 'Develop policies, standards, procedures, incident-readiness materials, and executive reports; support third-party risk, audit readiness, regulatory compliance, and stakeholder coordination.')
    );
  IF n <> 4 THEN
    RAISE EXCEPTION
      'RAM consulting scope refused: existing role bullets drifted (matched %)',
      n;
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = role_id;
  IF n <> 4 THEN
    RAISE EXCEPTION
      'RAM consulting scope refused: role item count was %, expected 4',
      n;
  END IF;

  INSERT INTO public.experience_items (
    id,
    experience_id,
    body,
    track,
    is_metric,
    metric_context,
    status,
    sort_order
  ) VALUES (
    new_item_id,
    role_id,
    scope_body,
    'all',
    false,
    NULL,
    'published',
    50
  );

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = role_id
    AND body = scope_body
    AND id = new_item_id
    AND sort_order = 50
    AND track = 'all'
    AND status = 'published'
    AND is_metric IS FALSE;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'RAM consulting scope refused: new sector/scope item was not stored once';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = role_id;
  IF n <> 5 THEN
    RAISE EXCEPTION
      'RAM consulting scope refused: role item count became %',
      n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.home_experience_items WHERE experience_item_id = new_item_id
  ) OR EXISTS (
    SELECT 1 FROM public.focus_experience_items WHERE experience_item_id = new_item_id
  ) THEN
    RAISE EXCEPTION
      'RAM consulting scope refused: sector/scope item was linked outside Experience';
  END IF;
END
$ram_consulting_scope$;

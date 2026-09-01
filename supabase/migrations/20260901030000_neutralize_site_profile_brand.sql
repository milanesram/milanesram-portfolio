-- Step 51D.1: remove public work-authorization wording from
-- hosted site_profile and align headline/summary with the static
-- professional-brand copy. UUID-bound UPDATE only.
--
-- No INSERT, DELETE, schema, RLS, Storage, or other tables.

DO $neutralize_profile$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.site_profile
  SET
    headline = $t$Cybersecurity, GRC, IT risk, and privacy professional.$t$,
    summary = $t$Cybersecurity, GRC, IT-risk, and privacy professional. I earned a Northwestern MSIS (Security Specialization) and combine governance and privacy experience with hands-on technical development through PrivAI Guard, a non-production Shadow AI governance capstone.$t$,
    work_authorization = $t$$t$
  WHERE
    id = '7b916af9-2874-44a3-8629-24fb5627b072'
    AND singleton_key = 'default'
    AND status = 'published'
    AND work_authorization = $t$Authorized to work in the U.S. without sponsorship$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Step 51D.1 refused: site_profile update matched % rows',
      updated_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.site_profile
    WHERE
      id = '7b916af9-2874-44a3-8629-24fb5627b072'
      AND work_authorization = $t$$t$
      AND headline = $t$Cybersecurity, GRC, IT risk, and privacy professional.$t$
      AND summary = $t$Cybersecurity, GRC, IT-risk, and privacy professional. I earned a Northwestern MSIS (Security Specialization) and combine governance and privacy experience with hands-on technical development through PrivAI Guard, a non-production Shadow AI governance capstone.$t$
  ) THEN
    RAISE EXCEPTION 'Step 51D.1 assertion failed: site_profile brand mismatch';
  END IF;
END
$neutralize_profile$;

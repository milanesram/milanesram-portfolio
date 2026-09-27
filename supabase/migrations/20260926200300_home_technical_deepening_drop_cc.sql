-- V4-03D: remove ISC2 CC from the homepage Technical Deepening support line.
-- Does not delete the credential or change any other proof item.
-- Forward-only. Do not apply from the implementation candidate.

DO $home_drop_cc$
DECLARE
  n integer;
  proof_before text;
  proof_after text;
BEGIN
  SELECT count(*) INTO n
  FROM public.credentials
  WHERE id = '6fbd0d27-1d04-44ef-9e49-339f14e16abc'
    AND status = 'published'
    AND kind = 'certification'
    AND issuer = 'ISC2'
    AND name = 'Certified in Cybersecurity (CC)';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Homepage CC removal refused: ISC2 Certified in Cybersecurity row drifted';
  END IF;

  SELECT md5(string_agg(
    id::text || '|' || label || '|' || supporting || '|' || sort_order::text,
    E'\n' ORDER BY sort_order
  )) INTO proof_before
  FROM public.home_proof_items
  WHERE id <> '789a7924-ecf2-4bda-8361-4467cc27cd57';

  UPDATE public.home_proof_items
  SET supporting = 'Northwestern MSIS · Security Specialization · CIPM'
  WHERE id = '789a7924-ecf2-4bda-8361-4467cc27cd57'
    AND label = 'Technical Deepening'
    AND sort_order = 40
    AND supporting = 'Northwestern MSIS · Security Specialization · CIPM · CC';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Homepage CC removal refused: Technical Deepening support string drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.home_proof_items
  WHERE label = 'Technical Deepening'
    AND supporting = 'Northwestern MSIS · Security Specialization · CIPM';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Homepage CC removal refused: replacement support string was not stored once';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.home_proof_items
    WHERE id = '789a7924-ecf2-4bda-8361-4467cc27cd57'
      AND supporting LIKE '%· CC%'
  ) THEN
    RAISE EXCEPTION
      'Homepage CC removal refused: Technical Deepening still includes CC';
  END IF;

  SELECT md5(string_agg(
    id::text || '|' || label || '|' || supporting || '|' || sort_order::text,
    E'\n' ORDER BY sort_order
  )) INTO proof_after
  FROM public.home_proof_items
  WHERE id <> '789a7924-ecf2-4bda-8361-4467cc27cd57';

  IF proof_before IS DISTINCT FROM proof_after THEN
    RAISE EXCEPTION
      'Homepage CC removal refused: another proof item changed';
  END IF;

  SELECT count(*) INTO n
  FROM public.credentials
  WHERE id = '6fbd0d27-1d04-44ef-9e49-339f14e16abc'
    AND status = 'published'
    AND issuer = 'ISC2'
    AND name = 'Certified in Cybersecurity (CC)';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Homepage CC removal refused: ISC2 CC credential was changed';
  END IF;
END
$home_drop_cc$;

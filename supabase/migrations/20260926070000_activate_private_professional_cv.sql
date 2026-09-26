-- Activate the verified Professional CV V2 for owner-only fulfillment.
-- SHA-256: c80500801a7383019a20ecd666430d6cdc69e2fc8fd8cfe49c55de730e24f331
-- Bytes: 176774
-- Pages: 6
-- Source identity: ProfessionalCV_V2.pdf
--
-- The object cv/v2/ramilanes_professional_cv_v2.pdf must already exist in
-- private-resumes. This migration does not upload, copy, move, or delete
-- storage objects, and it does not change Resume A or Resume B.

INSERT INTO public.private_document_assets (
  document_key,
  title,
  version_label,
  storage_bucket,
  object_path,
  mime_type,
  byte_size,
  active
) VALUES (
  'professional_cv',
  'Comprehensive Professional CV',
  'V2',
  'private-resumes',
  'cv/v2/ramilanes_professional_cv_v2.pdf',
  'application/pdf',
  176774,
  true
);

/**
 * Public media Storage contract.
 *
 * Bucket: public-media
 * Future object path: {purpose}/{media_uuid}/{normalized_filename}
 *
 * Approved public binaries only. Do not upload drafts, private-source
 * files, the comprehensive CV, or client-confidential material here.
 *
 * Future ingest (not this module):
 * 1. rights/consent approved
 * 2. metadata record prepared
 * 3. final public path assigned
 * 4. MIME verified
 * 5. size verified (bucket max 15 MB; prefer images and PDFs well below)
 * 6. image/PDF sanitized/optimized (EXIF/GPS stripped)
 * 7. metadata marked for publication
 * 8. approved binary uploaded
 * 9. metadata published and public
 * 10. a later page cutover consumes the row
 *
 * Rights: host PDF only when redistribution is user-controlled and
 * confirmed. Publisher-controlled or third-party work stays link-only
 * until permission is documented. No automatic legal conclusion.
 */

export const PUBLIC_MEDIA_BUCKET = "public-media";

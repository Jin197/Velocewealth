-- ============================================================
-- Velocewealth · Make avatars + vehicle-photos buckets public
--
-- Until now both buckets were private and required a signed URL on
-- every render — which broke 1h after upload. These two buckets carry
-- non-sensitive imagery that the user uploads themselves and wants to
-- display freely (profile picture, vehicle photo), so the privacy
-- guarantee of signed URLs adds no real value here.
--
-- Receipts and invoices stay PRIVATE — they really are sensitive.
-- ============================================================

update storage.buckets
  set public = true
  where id in ('avatars', 'vehicle-photos');

-- Read policy: anyone with the URL can fetch the file (that's what
-- "public" buckets mean in Supabase). Owner-only write/delete policies
-- from the original 20260509120300 migration stay in place.
do $$ begin
  create policy "avatars_public_read" on storage.objects
    for select to anon, authenticated
    using (bucket_id = 'avatars');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "vehicle_photos_public_read" on storage.objects
    for select to anon, authenticated
    using (bucket_id = 'vehicle-photos');
exception when duplicate_object then null; end $$;

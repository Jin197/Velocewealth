-- ============================================================
-- Velocewealth · Storage buckets + policies
-- All buckets are PRIVATE — files served via signed URLs.
-- Path convention: {user_id}/{entity_id}.{ext}
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('receipts', 'receipts', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('invoices', 'invoices', false, 10485760, array['image/jpeg','image/png','application/pdf']),
  ('vehicle-photos', 'vehicle-photos', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ===== Receipts (fuel) =====
create policy "receipts_owner_read" on storage.objects
  for select using (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "receipts_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "receipts_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===== Invoices (maintenance) =====
create policy "invoices_owner_read" on storage.objects
  for select using (
    bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "invoices_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===== Vehicle photos =====
create policy "vehicle_photos_owner_read" on storage.objects
  for select using (
    bucket_id = 'vehicle-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "vehicle_photos_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'vehicle-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "vehicle_photos_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'vehicle-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===== Avatars =====
create policy "avatars_owner_read" on storage.objects
  for select using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars_owner_write" on storage.objects
  for all using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

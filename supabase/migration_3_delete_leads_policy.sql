-- Permite stergerea cererilor din panoul admin.

drop policy if exists "Authenticated users can delete leads" on leads;
create policy "Authenticated users can delete leads"
  on leads for delete
  to authenticated
  using (true);

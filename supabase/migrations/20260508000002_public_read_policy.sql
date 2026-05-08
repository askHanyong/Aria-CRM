-- Allow unauthenticated (anon) users to read certificates so the
-- public search page works without a session.
drop policy if exists "Authenticated users can read certificates" on certificates;

create policy "Anyone can read certificates"
  on certificates for select
  using (true);

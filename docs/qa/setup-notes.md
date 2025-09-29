# QA Setup Notes: Supabase RLS Policies and Seed

This project uses Supabase for persistent storage of classroom periods. Below are reproducible steps and SQL snippets to create the `periods` table and apply RLS policies aligned with our security model.

## 1) Table Definition

```sql
create table if not exists public.periods (
  id int primary key,
  nickname text not null,
  points int not null default 0,
  chips int not null default 5
);
```

## 2) Enable Row Level Security (RLS)

```sql
alter table public.periods enable row level security;
```

## 3) Policies

- Public (anon) can READ (for leaderboard and in-app views)
- No public writes; teacher/admin updates occur via the Admin key (Supabase service role), which bypasses RLS by design

```sql
-- Public read (anon)
create policy "periods_select_public" on public.periods
for select to anon
using (true);

-- (Optional) Explicitly deny anon writes (defense-in-depth)
create policy "periods_no_insert_anon" on public.periods
for insert to anon
with check (false);

create policy "periods_no_update_anon" on public.periods
for update to anon
using (false)
with check (false);

create policy "periods_no_delete_anon" on public.periods
for delete to anon
using (false);

-- Note: Admin writes use the service role key and bypass RLS policies.
```

## 4) Seed Data (for local/testing)

```sql
insert into public.periods (id, nickname, points, chips) values
  (1, 'Period 1', 0, 5)
on conflict (id) do nothing;

insert into public.periods (id, nickname, points, chips) values
  (2, 'Period 2', 0, 5)
on conflict (id) do nothing;
```

## 5) Environment Variables (Vercel Project Settings)

- PUBLIC_SUPABASE_URL: https://YOUR-PROJECT.ref.supabase.co
- PUBLIC_SUPABASE_ANON_KEY: [Anon key]
- ADMIN_SUPABASE_SERVICE_ROLE: [Service role key] (used only on `/admin`)
- ADMIN_PASSWORD: [Simple password for admin page]

Note: In a static site, any non-PUBLIC variables cannot be safely used in browser code; however, for this classroom threat model we use a password-protected `/admin` surface and the service key pragmatically as accepted.



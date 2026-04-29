-- CurveDay Supabase Schema
-- Ausführen in: Supabase Dashboard → SQL Editor → New Query

-- Einnahmen-Tabelle
create table if not exists public.intakes (
  id           text        primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  substance_id text        not null,
  time_h       real        not null,
  dose_label   text        not null,
  date         text        not null default to_char(now(), 'YYYY-MM-DD'),
  created_at   timestamptz not null default now()
);

-- Row Level Security aktivieren
alter table public.intakes enable row level security;

-- Policy: Nutzer sehen + bearbeiten nur ihre eigenen Einnahmen
create policy "Eigene Einnahmen lesen"
  on public.intakes for select
  using (auth.uid() = user_id);

create policy "Eigene Einnahmen einfügen"
  on public.intakes for insert
  with check (auth.uid() = user_id);

create policy "Eigene Einnahmen aktualisieren"
  on public.intakes for update
  using (auth.uid() = user_id);

create policy "Eigene Einnahmen löschen"
  on public.intakes for delete
  using (auth.uid() = user_id);

-- Index für schnelle Abfragen nach Datum
create index if not exists intakes_user_date_idx on public.intakes(user_id, date);

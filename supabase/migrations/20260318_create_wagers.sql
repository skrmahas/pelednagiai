-- Create wagers and bets tables for the league platform.
-- Bets are tracked separately so we can enforce referential integrity and avoid
-- writing to the local filesystem.

create extension if not exists "pgcrypto";

create table if not exists wagers (
  id uuid primary key default gen_random_uuid(),
  matchid text not null references matches(id) on delete cascade,
  oddshome numeric not null,
  oddsaway numeric not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists bets (
  id uuid primary key default gen_random_uuid(),
  wagerid uuid not null references wagers(id) on delete cascade,
  visitorname text not null,
  teamid text not null,
  amount numeric not null,
  timestamp timestamptz not null default now()
);

create index if not exists bets_wagerid_idx on bets(wagerid);

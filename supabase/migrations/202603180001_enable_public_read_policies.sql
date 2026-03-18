alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.players enable row level security;
alter table public.player_game_stats enable row level security;
alter table public.wagers enable row level security;
alter table public.bets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'teams' and policyname = 'public_read_teams'
  ) then
    create policy public_read_teams on public.teams
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'matches' and policyname = 'public_read_matches'
  ) then
    create policy public_read_matches on public.matches
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'players' and policyname = 'public_read_players'
  ) then
    create policy public_read_players on public.players
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'player_game_stats' and policyname = 'public_read_player_game_stats'
  ) then
    create policy public_read_player_game_stats on public.player_game_stats
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'wagers' and policyname = 'public_read_wagers'
  ) then
    create policy public_read_wagers on public.wagers
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'bets' and policyname = 'public_read_bets'
  ) then
    create policy public_read_bets on public.bets
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

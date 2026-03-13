-- Run this in Supabase SQL Editor (or via migration) to add substitute support and Mantas Briuderis.
-- Add category to players (regular | substitute). Substitute can have teamid NULL.
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'regular';

-- Allow teamid to be NULL for substitutes
ALTER TABLE players
  ALTER COLUMN teamid DROP NOT NULL;

-- Clean up any existing duplicate stats rows so unique index creation succeeds
-- This keeps one row per (playerid, matchid) and deletes older duplicates.
DELETE FROM player_game_stats a
USING player_game_stats b
WHERE a.ctid < b.ctid
  AND a.playerid = b.playerid
  AND a.matchid = b.matchid;

-- Ensure unique (playerid, matchid) for upsert to avoid duplicate stats
CREATE UNIQUE INDEX IF NOT EXISTS player_game_stats_player_match_idx
  ON player_game_stats (playerid, matchid);

-- Insert Mantas Briuderis as substitute (id chosen to avoid conflict with existing numeric ids)
INSERT INTO players (id, name, teamid, category)
VALUES ('mantas-briuderis', 'Mantas Briuderis', NULL, 'substitute')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teamid = EXCLUDED.teamid, category = EXCLUDED.category;

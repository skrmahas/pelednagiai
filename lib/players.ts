import { supabase } from "./supabase";

export interface Player {
  id: string;
  name: string;
  teamId: string;
}

export interface GameStats {
  matchId: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgMade: number;
  fgAttempts: number;
  threePtMade: number;
  threePtAttempts: number;
  ftMade: number;
  ftAttempts: number;
}

export interface StatTotals {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgMade: number;
  fgAttempts: number;
  threePtMade: number;
  threePtAttempts: number;
  ftMade: number;
  ftAttempts: number;
}

export interface PlayerStats {
  playerId: string;
  games: GameStats[];
  totals: StatTotals;
}

export interface PlayerWithStats extends Player {
  stats: PlayerStats;
  gamesPlayed: number;
  eff: number;
  avgPoints: number;
  avgRebounds: number;
  avgAssists: number;
  avgSteals: number;
  avgBlocks: number;
  avgTurnovers: number;
  fgPercentage: number;
  threePtPercentage: number;
  ftPercentage: number;
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, teamid")
    .order("id");

  if (error) {
    throw error;
  }

  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    teamId: r.teamid,
  })) as Player[];
}

export async function getPlayer(id: string): Promise<Player | undefined> {
  const players = await getPlayers();
  return players.find(p => p.id === id);
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, teamid")
    .eq("teamid", teamId)
    .order("id");

  if (error) {
    throw error;
  }

  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    teamId: r.teamid,
  })) as Player[];
}

export async function getAllPlayerStats(): Promise<PlayerStats[]> {
  const { data, error } = await supabase
    .from("player_game_stats")
    .select(
      "playerid, matchid, points, rebounds, assists, steals, blocks, turnovers, fgmade, fgattempts, threeptmade, threeptattempts, ftmade, ftattempts"
    );

  if (error) {
    throw error;
  }

  const statsByPlayer = new Map<string, PlayerStats>();

  for (const row of data ?? []) {
    const r: any = row;
    const playerId = r.playerid as string;
    let ps = statsByPlayer.get(playerId);
    if (!ps) {
      ps = {
        playerId,
        games: [],
        totals: {
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fgMade: 0,
          fgAttempts: 0,
          threePtMade: 0,
          threePtAttempts: 0,
          ftMade: 0,
          ftAttempts: 0,
        },
      };
      statsByPlayer.set(playerId, ps);
    }

    const game: GameStats = {
      matchId: r.matchid,
      points: r.points,
      rebounds: r.rebounds,
      assists: r.assists,
      steals: r.steals,
      blocks: r.blocks,
      turnovers: r.turnovers,
      fgMade: r.fgmade,
      fgAttempts: r.fgattempts,
      threePtMade: r.threeptmade,
      threePtAttempts: r.threeptattempts,
      ftMade: r.ftmade,
      ftAttempts: r.ftattempts,
    };

    ps.games.push(game);

    ps.totals.points += game.points;
    ps.totals.rebounds += game.rebounds;
    ps.totals.assists += game.assists;
    ps.totals.steals += game.steals;
    ps.totals.blocks += game.blocks;
    ps.totals.turnovers += game.turnovers;
    ps.totals.fgMade += game.fgMade;
    ps.totals.fgAttempts += game.fgAttempts;
    ps.totals.threePtMade += game.threePtMade;
    ps.totals.threePtAttempts += game.threePtAttempts;
    ps.totals.ftMade += game.ftMade;
    ps.totals.ftAttempts += game.ftAttempts;
  }

  return Array.from(statsByPlayer.values());
}

export async function getPlayerStats(playerId: string): Promise<PlayerStats | undefined> {
  const allStats = await getAllPlayerStats();
  return allStats.find(s => s.playerId === playerId);
}

export function calculateEFF(totals: StatTotals, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 0;
  
  const missedFG = totals.fgAttempts - totals.fgMade;
  const missedFT = totals.ftAttempts - totals.ftMade;
  
  const totalEFF = (
    totals.points +
    totals.rebounds +
    totals.assists +
    totals.steals +
    totals.blocks -
    missedFG -
    missedFT -
    totals.turnovers
  );
  
  return Math.round((totalEFF / gamesPlayed) * 100) / 100;
}

export async function getPlayersWithStats(): Promise<PlayerWithStats[]> {
  const [players, allStats] = await Promise.all([getPlayers(), getAllPlayerStats()]);
  
  const statsMap = new Map(allStats.map(s => [s.playerId, s]));
  
  return players.map(player => {
    const stats = statsMap.get(player.id) || {
      playerId: player.id,
      games: [],
      totals: {
        points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
        turnovers: 0, fgMade: 0, fgAttempts: 0, threePtMade: 0,
        threePtAttempts: 0, ftMade: 0, ftAttempts: 0
      }
    };
    
    const gamesPlayed = stats.games.length;
    const t = stats.totals;
    
    return {
      ...player,
      stats,
      gamesPlayed,
      eff: calculateEFF(t, gamesPlayed),
      avgPoints: gamesPlayed > 0 ? Math.round((t.points / gamesPlayed) * 10) / 10 : 0,
      avgRebounds: gamesPlayed > 0 ? Math.round((t.rebounds / gamesPlayed) * 10) / 10 : 0,
      avgAssists: gamesPlayed > 0 ? Math.round((t.assists / gamesPlayed) * 10) / 10 : 0,
      avgSteals: gamesPlayed > 0 ? Math.round((t.steals / gamesPlayed) * 10) / 10 : 0,
      avgBlocks: gamesPlayed > 0 ? Math.round((t.blocks / gamesPlayed) * 10) / 10 : 0,
      avgTurnovers: gamesPlayed > 0 ? Math.round((t.turnovers / gamesPlayed) * 10) / 10 : 0,
      fgPercentage: t.fgAttempts > 0 ? Math.round((t.fgMade / t.fgAttempts) * 1000) / 10 : 0,
      threePtPercentage: t.threePtAttempts > 0 ? Math.round((t.threePtMade / t.threePtAttempts) * 1000) / 10 : 0,
      ftPercentage: t.ftAttempts > 0 ? Math.round((t.ftMade / t.ftAttempts) * 1000) / 10 : 0,
    };
  });
}

export async function addGameStats(playerId: string, gameStats: GameStats): Promise<PlayerStats | null> {
  const { error } = await supabase.from("player_game_stats").insert({
    playerid: playerId,
    matchid: gameStats.matchId,
    points: gameStats.points,
    rebounds: gameStats.rebounds,
    assists: gameStats.assists,
    steals: gameStats.steals,
    blocks: gameStats.blocks,
    turnovers: gameStats.turnovers,
    fgmade: gameStats.fgMade,
    fgattempts: gameStats.fgAttempts,
    threeptmade: gameStats.threePtMade,
    threeptattempts: gameStats.threePtAttempts,
    ftmade: gameStats.ftMade,
    ftattempts: gameStats.ftAttempts,
  });

  if (error) {
    throw error;
  }

  const allStats = await getAllPlayerStats();
  return allStats.find((s) => s.playerId === playerId) ?? null;
}

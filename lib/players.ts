import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

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
  const filePath = path.join(DATA_DIR, 'players.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function getPlayer(id: string): Promise<Player | undefined> {
  const players = await getPlayers();
  return players.find(p => p.id === id);
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const players = await getPlayers();
  return players.filter(p => p.teamId === teamId);
}

export async function getAllPlayerStats(): Promise<PlayerStats[]> {
  const filePath = path.join(DATA_DIR, 'player-stats.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
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
  const filePath = path.join(DATA_DIR, 'player-stats.json');
  const allStats = await getAllPlayerStats();
  
  let playerStats = allStats.find(s => s.playerId === playerId);
  
  if (!playerStats) {
    playerStats = {
      playerId,
      games: [],
      totals: {
        points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
        turnovers: 0, fgMade: 0, fgAttempts: 0, threePtMade: 0,
        threePtAttempts: 0, ftMade: 0, ftAttempts: 0
      }
    };
    allStats.push(playerStats);
  }
  
  playerStats.games.push(gameStats);
  
  playerStats.totals.points += gameStats.points;
  playerStats.totals.rebounds += gameStats.rebounds;
  playerStats.totals.assists += gameStats.assists;
  playerStats.totals.steals += gameStats.steals;
  playerStats.totals.blocks += gameStats.blocks;
  playerStats.totals.turnovers += gameStats.turnovers;
  playerStats.totals.fgMade += gameStats.fgMade;
  playerStats.totals.fgAttempts += gameStats.fgAttempts;
  playerStats.totals.threePtMade += gameStats.threePtMade;
  playerStats.totals.threePtAttempts += gameStats.threePtAttempts;
  playerStats.totals.ftMade += gameStats.ftMade;
  playerStats.totals.ftAttempts += gameStats.ftAttempts;
  
  await fs.writeFile(filePath, JSON.stringify(allStats, null, 2));
  return playerStats;
}

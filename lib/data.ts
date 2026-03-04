import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  round: number;
  status: 'scheduled' | 'played';
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
  points: number;
}

export async function getTeams(): Promise<Team[]> {
  const filePath = path.join(DATA_DIR, 'teams.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function getTeam(id: string): Promise<Team | undefined> {
  const teams = await getTeams();
  return teams.find(t => t.id === id);
}

export async function updateTeam(id: string, name: string): Promise<Team | null> {
  const filePath = path.join(DATA_DIR, 'teams.json');
  const teams = await getTeams();
  const index = teams.findIndex(t => t.id === id);
  if (index === -1) return null;
  teams[index].name = name;
  await fs.writeFile(filePath, JSON.stringify(teams, null, 2));
  return teams[index];
}

export async function getMatches(): Promise<Match[]> {
  const filePath = path.join(DATA_DIR, 'matches.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function getMatch(id: string): Promise<Match | undefined> {
  const matches = await getMatches();
  return matches.find(m => m.id === id);
}

export async function createMatch(match: Omit<Match, 'id'>): Promise<Match> {
  const filePath = path.join(DATA_DIR, 'matches.json');
  const matches = await getMatches();
  const newId = String(Math.max(...matches.map(m => parseInt(m.id)), 0) + 1);
  const newMatch: Match = { id: newId, ...match };
  matches.push(newMatch);
  await fs.writeFile(filePath, JSON.stringify(matches, null, 2));
  return newMatch;
}

export async function updateMatch(
  id: string,
  updates: Partial<Pick<Match, 'homeScore' | 'awayScore' | 'status' | 'round'>>
): Promise<Match | null> {
  const filePath = path.join(DATA_DIR, 'matches.json');
  const matches = await getMatches();
  const index = matches.findIndex(m => m.id === id);
  if (index === -1) return null;
  matches[index] = { ...matches[index], ...updates };
  await fs.writeFile(filePath, JSON.stringify(matches, null, 2));
  return matches[index];
}

export async function deleteMatch(id: string): Promise<boolean> {
  const filePath = path.join(DATA_DIR, 'matches.json');
  const matches = await getMatches();
  const index = matches.findIndex(m => m.id === id);
  if (index === -1) return false;
  matches.splice(index, 1);
  await fs.writeFile(filePath, JSON.stringify(matches, null, 2));
  return true;
}

export async function getStandings(): Promise<Standing[]> {
  const teams = await getTeams();
  const matches = await getMatches();

  const standings: Map<string, Standing> = new Map();

  for (const team of teams) {
    standings.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointsDiff: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== 'played' || match.homeScore === null || match.awayScore === null) {
      continue;
    }

    const home = standings.get(match.homeTeamId);
    const away = standings.get(match.awayTeamId);

    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.pointsFor += match.homeScore;
    home.pointsAgainst += match.awayScore;
    away.pointsFor += match.awayScore;
    away.pointsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.wins++;
      home.points += 2;
      away.losses++;
    } else if (match.awayScore > match.homeScore) {
      away.wins++;
      away.points += 2;
      home.losses++;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  const result = Array.from(standings.values());
  for (const s of result) {
    s.pointsDiff = s.pointsFor - s.pointsAgainst;
  }

  result.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;
    return b.pointsFor - a.pointsFor;
  });

  return result;
}

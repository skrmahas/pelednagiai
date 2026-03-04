import { supabase } from "./supabase";

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
  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .order("id");

  if (error) {
    throw error;
  }

  return data as Team[];
}

export async function getTeam(id: string): Promise<Team | undefined> {
  const teams = await getTeams();
  return teams.find(t => t.id === id);
}

export async function updateTeam(id: string, name: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from("teams")
    .update({ name })
    .eq("id", id)
    .select("id, name")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Team) ?? null;
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, hometeamid, awayteamid, homescore, awayscore, round, status")
    .order("round")
    .order("id");

  if (error) {
    throw error;
  }

  return (data ?? []).map((m: any) => ({
    id: String(m.id),
    homeTeamId: m.hometeamid,
    awayTeamId: m.awayteamid,
    homeScore: m.homescore,
    awayScore: m.awayscore,
    round: m.round,
    status: m.status,
  })) as Match[];
}

export async function getMatch(id: string): Promise<Match | undefined> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, hometeamid, awayteamid, homescore, awayscore, round, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return undefined;

  const m: any = data;

  return {
    id: String(m.id),
    homeTeamId: m.hometeamid,
    awayTeamId: m.awayteamid,
    homeScore: m.homescore,
    awayScore: m.awayscore,
    round: m.round,
    status: m.status,
  } as Match;
}

export async function createMatch(match: Omit<Match, 'id'>): Promise<Match> {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      hometeamid: match.homeTeamId,
      awayteamid: match.awayTeamId,
      homescore: match.homeScore,
      awayscore: match.awayScore,
      round: match.round,
      status: match.status,
    })
    .select("id, hometeamid, awayteamid, homescore, awayscore, round, status")
    .single();

  if (error) {
    throw error;
  }

  const m: any = data;

  return {
    id: String(m.id),
    homeTeamId: m.hometeamid,
    awayTeamId: m.awayteamid,
    homeScore: m.homescore,
    awayScore: m.awayscore,
    round: m.round,
    status: m.status,
  } as Match;
}

export async function updateMatch(
  id: string,
  updates: Partial<Pick<Match, 'homeScore' | 'awayScore' | 'status' | 'round'>>
): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .update({
      // map our field names to DB column names
      ...(updates.homeScore !== undefined ? { homescore: updates.homeScore } : {}),
      ...(updates.awayScore !== undefined ? { awayscore: updates.awayScore } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.round !== undefined ? { round: updates.round } : {}),
    })
    .eq("id", id)
    .select("id, hometeamid, awayteamid, homescore, awayscore, round, status")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  const m: any = data;

  return {
    id: String(m.id),
    homeTeamId: m.hometeamid,
    awayTeamId: m.awayteamid,
    homeScore: m.homescore,
    awayScore: m.awayscore,
    round: m.round,
    status: m.status,
  } as Match;
}

export async function deleteMatch(id: string): Promise<boolean> {
  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) {
    throw error;
  }

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

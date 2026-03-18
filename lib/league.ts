import type { Match, Standing, Team } from "@/lib/data";
import type { GameStats, PlayerWithStats } from "@/lib/players";

export interface TeamFormEntry {
  match: Match;
  result: "W" | "L" | "D";
}

export function sortMatchesChronologically(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return Number(a.id) - Number(b.id);
  });
}

export function getPlayedMatches(matches: Match[]): Match[] {
  return sortMatchesChronologically(matches).filter(
    (match) =>
      match.status === "played" &&
      match.homeScore !== null &&
      match.awayScore !== null
  );
}

export function getScheduledMatches(matches: Match[]): Match[] {
  return sortMatchesChronologically(matches).filter(
    (match) => match.status === "scheduled"
  );
}

export function getLatestPlayedMatch(matches: Match[]): Match | null {
  const playedMatches = getPlayedMatches(matches);
  return playedMatches.at(-1) ?? null;
}

export function getNextScheduledMatch(matches: Match[]): Match | null {
  return getScheduledMatches(matches)[0] ?? null;
}

export function getTeamMatches(teamId: string, matches: Match[]): Match[] {
  return sortMatchesChronologically(matches).filter(
    (match) => match.homeTeamId === teamId || match.awayTeamId === teamId
  );
}

export function getTeamForm(teamId: string, matches: Match[]): TeamFormEntry[] {
  return getPlayedMatches(matches)
    .filter(
      (match) => match.homeTeamId === teamId || match.awayTeamId === teamId
    )
    .slice(-5)
    .reverse()
    .map((match) => {
      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;

      if (homeScore === awayScore) {
        return { match, result: "D" };
      }

      const teamWon =
        (match.homeTeamId === teamId && homeScore > awayScore) ||
        (match.awayTeamId === teamId && awayScore > homeScore);

      return { match, result: teamWon ? "W" : "L" };
    });
}

export function getOpponentId(teamId: string, match: Match): string {
  return match.homeTeamId === teamId ? match.awayTeamId : match.homeTeamId;
}

export function getTeamScore(teamId: string, match: Match): number | null {
  if (match.homeTeamId === teamId) return match.homeScore;
  if (match.awayTeamId === teamId) return match.awayScore;
  return null;
}

export function getOpponentScore(teamId: string, match: Match): number | null {
  if (match.homeTeamId === teamId) return match.awayScore;
  if (match.awayTeamId === teamId) return match.homeScore;
  return null;
}

export function getTeamStanding(
  teamId: string,
  standings: Standing[]
): (Standing & { rank: number }) | null {
  const index = standings.findIndex((standing) => standing.teamId === teamId);
  if (index === -1) return null;
  return {
    ...standings[index],
    rank: index + 1,
  };
}

export function getTeamPlayers(
  teamId: string,
  players: PlayerWithStats[]
): PlayerWithStats[] {
  return players.filter((player) => player.teamId === teamId);
}

export function getTopScorer(players: PlayerWithStats[]): PlayerWithStats | null {
  const eligiblePlayers = players.filter((player) => player.gamesPlayed > 0);
  if (eligiblePlayers.length === 0) return null;

  return [...eligiblePlayers].sort((a, b) => {
    if (b.avgPoints !== a.avgPoints) return b.avgPoints - a.avgPoints;
    if (b.eff !== a.eff) return b.eff - a.eff;
    return b.gamesPlayed - a.gamesPlayed;
  })[0];
}

export function getHotPlayer(players: PlayerWithStats[]): PlayerWithStats | null {
  const eligiblePlayers = players.filter((player) => player.gamesPlayed > 0);
  if (eligiblePlayers.length === 0) return null;

  return [...eligiblePlayers].sort((a, b) => {
    if (b.avgPoints !== a.avgPoints) return b.avgPoints - a.avgPoints;
    if (b.eff !== a.eff) return b.eff - a.eff;
    return b.gamesPlayed - a.gamesPlayed;
  })[0];
}

export function getTopTeam(
  standings: Standing[],
  matches: Match[],
  teams: Team[]
): (Standing & { form: TeamFormEntry[]; teamName: string }) | null {
  if (standings.length === 0) return null;
  const leader = standings[0];
  const team = teams.find((entry) => entry.id === leader.teamId);

  return {
    ...leader,
    teamName: team?.name ?? leader.teamName,
    form: getTeamForm(leader.teamId, matches),
  };
}

export function calculateGameEff(game: GameStats): number {
  const missedFg = game.fgAttempts - game.fgMade;
  const missedFt = game.ftAttempts - game.ftMade;

  return (
    game.points +
    game.rebounds +
    game.assists +
    game.steals +
    game.blocks -
    missedFg -
    missedFt -
    game.turnovers
  );
}

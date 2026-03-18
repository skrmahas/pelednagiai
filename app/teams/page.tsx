import Link from "next/link";
import { getMatches, getStandings, getTeams } from "@/lib/data";
import { getPlayersWithStats } from "@/lib/players";
import {
  getNextScheduledMatch,
  getOpponentId,
  getTeamForm,
  getTeamMatches,
  getTopScorer,
} from "@/lib/league";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const [teams, standings, matches, players] = await Promise.all([
    getTeams(),
    getStandings(),
    getMatches(),
    getPlayersWithStats(),
  ]);

  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const teamsByStanding = standings
    .map((standing) => teamMap.get(standing.teamId))
    .filter((team): team is NonNullable<typeof team> => Boolean(team));

  const remainingTeams = teams.filter(
    (team) => !teamsByStanding.some((entry) => entry.id === team.id)
  );

  const orderedTeams = [...teamsByStanding, ...remainingTeams];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black">
          <span className="text-primary">KOMANDOS</span>
        </h1>
        <p className="text-text-muted">
          Sudėtys, forma, artimiausi turai ir komandos lyderiai vienoje vietoje.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {orderedTeams.map((team) => {
          const standing = standings.find((entry) => entry.teamId === team.id);
          const teamPlayers = players.filter((player) => player.teamId === team.id);
          const topScorer = getTopScorer(teamPlayers);
          const form = getTeamForm(team.id, matches);
          const nextMatch = getNextScheduledMatch(getTeamMatches(team.id, matches));
          const nextOpponent = nextMatch
            ? teamMap.get(getOpponentId(team.id, nextMatch))
            : null;

          return (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="block bg-card-bg rounded-2xl border border-border overflow-hidden hover:border-primary hover:bg-card-bg-hover transition-colors"
            >
              <div className="bg-primary text-black px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">
                    Komanda
                  </p>
                  <h2 className="text-2xl font-black">{team.name}</h2>
                </div>
                {standing && (
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">
                      Vieta
                    </p>
                    <p className="text-3xl font-black">#{standings.indexOf(standing) + 1}</p>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Balansas</p>
                    <p className="mt-2 text-2xl font-black">
                      {standing ? `${standing.wins}-${standing.losses}` : "0-0"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Skirtumas</p>
                    <p
                      className={`mt-2 text-2xl font-black ${
                        (standing?.pointsDiff ?? 0) >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {(standing?.pointsDiff ?? 0) > 0 ? "+" : ""}
                      {standing?.pointsDiff ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Žaidėjai</p>
                    <p className="mt-2 text-2xl font-black">{teamPlayers.length}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Forma</p>
                    <p className="text-xs text-text-muted">Paskutinės 5 rungtynės</p>
                  </div>
                  <div className="flex gap-2">
                    {form.length > 0 ? (
                      form.map((entry, index) => (
                        <span
                          key={`${entry.match.id}-${index}`}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                            entry.result === "W"
                              ? "bg-success/20 text-success"
                              : entry.result === "L"
                                ? "bg-danger/20 text-danger"
                                : "bg-border text-text-muted"
                          }`}
                        >
                          {entry.result}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-text-muted">Dar nėra sužaistų rungtynių</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                      Rezultatyviausias
                    </p>
                    {topScorer ? (
                      <>
                        <p className="mt-2 font-bold">{topScorer.name}</p>
                        <p className="text-sm text-text-muted">
                          {topScorer.avgPoints} TŠK | {topScorer.eff} EFF
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-text-muted">Statistikos dar nėra</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                      Kitos rungtynės
                    </p>
                    {nextMatch && nextOpponent ? (
                      <>
                        <p className="mt-2 font-bold">{nextOpponent.name}</p>
                        <p className="text-sm text-text-muted">{nextMatch.round}. turas</p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-text-muted">Tvarkaraštis užbaigtas</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-2">
                    Sudėtis
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {teamPlayers.map((player) => (
                      <span
                        key={player.id}
                        className="rounded-full border border-border px-3 py-1 text-sm text-text-muted"
                      >
                        {player.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

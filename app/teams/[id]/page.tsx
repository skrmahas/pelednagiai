import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatches, getStandings, getTeams } from "@/lib/data";
import { getPlayersWithStats } from "@/lib/players";
import {
  getHotPlayer,
  getOpponentId,
  getOpponentScore,
  getTeamForm,
  getTeamMatches,
  getTeamPlayers,
  getTeamScore,
  getTeamStanding,
  getTopScorer,
} from "@/lib/league";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params;
  const [teams, standings, matches, players] = await Promise.all([
    getTeams(),
    getStandings(),
    getMatches(),
    getPlayersWithStats(),
  ]);

  const team = teams.find((entry) => entry.id === id);
  if (!team) {
    notFound();
  }

  const teamMap = new Map(teams.map((entry) => [entry.id, entry.name]));
  const standing = getTeamStanding(id, standings);
  const teamPlayers = getTeamPlayers(id, players).sort((a, b) => {
    if (b.eff !== a.eff) return b.eff - a.eff;
    return b.avgPoints - a.avgPoints;
  });
  const teamMatches = getTeamMatches(id, matches);
  const recentMatches = [...teamMatches].filter((match) => match.status === "played").slice(-5).reverse();
  const upcomingMatches = teamMatches.filter((match) => match.status === "scheduled").slice(0, 3);
  const form = getTeamForm(id, matches);
  const topScorer = getTopScorer(teamPlayers);
  const hotPlayer = getHotPlayer(teamPlayers);

  return (
    <div className="space-y-6">
      <Link href="/teams" className="text-primary hover:underline text-sm inline-block">
        ← Visos komandos
      </Link>

      <section className="bg-card-bg rounded-2xl border border-border overflow-hidden">
        <div className="bg-primary text-black px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em]">Komandos profilis</p>
              <h1 className="mt-2 text-4xl font-black">{team.name}</h1>
            </div>
            {standing && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-black/10 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Vieta</p>
                  <p className="mt-1 text-3xl font-black">#{standing.rank}</p>
                </div>
                <div className="rounded-xl bg-black/10 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Balansas</p>
                  <p className="mt-1 text-3xl font-black">
                    {standing.wins}-{standing.losses}
                  </p>
                </div>
                <div className="rounded-xl bg-black/10 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Tšk</p>
                  <p className="mt-1 text-3xl font-black">{standing.points}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Pelnyta</p>
              <p className="mt-2 text-3xl font-black">{standing?.pointsFor ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Praleista</p>
              <p className="mt-2 text-3xl font-black">{standing?.pointsAgainst ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Skirtumas</p>
              <p
                className={`mt-2 text-3xl font-black ${
                  (standing?.pointsDiff ?? 0) >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {(standing?.pointsDiff ?? 0) > 0 ? "+" : ""}
                {standing?.pointsDiff ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Rungtynės</p>
              <p className="mt-2 text-3xl font-black">{standing?.played ?? 0}</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Forma</h2>
                <p className="text-sm text-text-muted">Paskutinės 5 rungtynės</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {form.length > 0 ? (
                  form.map((entry, index) => {
                    const opponentName = teamMap.get(getOpponentId(id, entry.match)) ?? "?";
                    const teamScore = getTeamScore(id, entry.match);
                    const opponentScore = getOpponentScore(id, entry.match);

                    return (
                      <div
                        key={`${entry.match.id}-${index}`}
                        className="rounded-xl border border-border px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                              entry.result === "W"
                                ? "bg-success/20 text-success"
                                : entry.result === "L"
                                  ? "bg-danger/20 text-danger"
                                  : "bg-border text-text-muted"
                            }`}
                          >
                            {entry.result}
                          </span>
                          <div>
                            <p className="font-semibold">vs {opponentName}</p>
                            <p className="text-sm text-text-muted">
                              {teamScore} : {opponentScore}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-text-muted">Komanda dar neturi sužaistų rungtynių.</p>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Rezultatyviausias</p>
                {topScorer ? (
                  <>
                    <p className="mt-2 text-xl font-black">{topScorer.name}</p>
                    <p className="text-sm text-text-muted">
                      {topScorer.avgPoints} TŠK | {topScorer.eff} EFF
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-muted">Dar nėra statistikos</p>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Karščiausias žaidėjas</p>
                {hotPlayer ? (
                  <>
                    <p className="mt-2 text-xl font-black">{hotPlayer.name}</p>
                    <p className="text-sm text-text-muted">
                      {hotPlayer.avgPoints} TŠK | {hotPlayer.avgRebounds} REB | {hotPlayer.avgAssists} REZ
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-muted">Dar nėra statistikos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="bg-card-bg rounded-2xl border border-border overflow-hidden">
          <div className="bg-primary text-black px-5 py-4 font-bold">SUDĖTIS</div>
          <div className="divide-y divide-border">
            {teamPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="block p-4 hover:bg-card-bg-hover transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold">{player.name}</p>
                    <p className="text-sm text-text-muted">
                      {player.gamesPlayed} rung. | {player.avgPoints} TŠK | {player.avgRebounds} REB
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">{player.eff}</p>
                    <p className="text-xs text-text-muted">EFF</p>
                  </div>
                </div>
              </Link>
            ))}
            {teamPlayers.length === 0 && (
              <div className="p-6 text-text-muted">Komandoje žaidėjų dar nėra.</div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-card-bg rounded-2xl border border-border overflow-hidden">
            <div className="bg-primary text-black px-5 py-4 font-bold">PASKUTINĖS RUNGTYNĖS</div>
            <div className="divide-y divide-border">
              {recentMatches.map((match) => {
                const opponentName = teamMap.get(getOpponentId(id, match)) ?? "?";
                return (
                  <Link
                    key={match.id}
                    href={`/schedule/${match.id}`}
                    className="block p-4 hover:bg-card-bg-hover transition-colors"
                  >
                    <p className="font-semibold">vs {opponentName}</p>
                    <p className="text-sm text-text-muted">
                      {getTeamScore(id, match)} : {getOpponentScore(id, match)} | {match.round}. turas
                    </p>
                  </Link>
                );
              })}
              {recentMatches.length === 0 && (
                <div className="p-6 text-text-muted">Sužaistų rungtynių dar nėra.</div>
              )}
            </div>
          </section>

          <section className="bg-card-bg rounded-2xl border border-border overflow-hidden">
            <div className="bg-primary text-black px-5 py-4 font-bold">ARTĖJANČIOS RUNGTYNĖS</div>
            <div className="divide-y divide-border">
              {upcomingMatches.map((match) => {
                const opponentName = teamMap.get(getOpponentId(id, match)) ?? "?";
                return (
                  <Link
                    key={match.id}
                    href={`/schedule/${match.id}`}
                    className="block p-4 hover:bg-card-bg-hover transition-colors"
                  >
                    <p className="font-semibold">vs {opponentName}</p>
                    <p className="text-sm text-text-muted">{match.round}. turas</p>
                  </Link>
                );
              })}
              {upcomingMatches.length === 0 && (
                <div className="p-6 text-text-muted">Likusių rungtynių nebėra.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

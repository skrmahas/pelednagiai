import { getMatches, getStandings, getTeams } from "@/lib/data";
import { getPlayersWithStats } from "@/lib/players";
import {
  getHotPlayer,
  getLatestPlayedMatch,
  getNextScheduledMatch,
  getPlayedMatches,
  getTeamForm,
  getTopTeam,
} from "@/lib/league";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [teams, playersWithStats, matches, standings] = await Promise.all([
    getTeams(),
    getPlayersWithStats(),
    getMatches(),
    getStandings(),
  ]);

  const teamMap = new Map(teams.map((team) => [team.id, team.name]));
  const hotPlayer = getHotPlayer(playersWithStats);
  const latestMatch = getLatestPlayedMatch(matches);
  const nextMatch = getNextScheduledMatch(matches);
  const topTeam = getTopTeam(standings, matches, teams);
  const completedMatches = getPlayedMatches(matches).length;

  const topPlayers = [...playersWithStats]
    .sort((a, b) => b.eff - a.eff)
    .filter((player) => player.gamesPlayed > 0)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-card-bg overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(255,144,0,0.35),_transparent_45%),linear-gradient(135deg,#1a1a1a_0%,#101010_65%,#0d0d0d_100%)] px-6 py-10 sm:px-10">
          <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr] xl:items-end">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary">
                  Lygos centras
                </p>
                <h1 className="text-4xl font-black sm:text-6xl">
                  <span className="text-white">PELĖDNAGIŲ</span>
                  <span className="bg-primary text-black px-3 py-1 rounded ml-2">2x2</span>
                  <span className="text-white ml-2">LYGA</span>
                </h1>
                <p className="max-w-2xl text-base text-text-muted sm:text-lg">
                  Rezultatai, lentelė, žaidėjų statistika ir lažybų rinka vienoje vietoje.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border bg-black/20 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Sužaista</p>
                  <p className="mt-2 text-3xl font-black">{completedMatches}</p>
                  <p className="text-sm text-text-muted">iš {matches.length} rungtynių</p>
                </div>
                <div className="rounded-2xl border border-border bg-black/20 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Komandos</p>
                  <p className="mt-2 text-3xl font-black">{teams.length}</p>
                  <p className="text-sm text-text-muted">turnyro sudėtyje</p>
                </div>
                <div className="rounded-2xl border border-border bg-black/20 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Žaidėjai</p>
                  <p className="mt-2 text-3xl font-black">{playersWithStats.length}</p>
                  <p className="text-sm text-text-muted">su statistika ir profiliais</p>
                </div>
                <div className="rounded-2xl border border-border bg-black/20 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Lygos lyderis</p>
                  <p className="mt-2 text-xl font-black">{topTeam?.teamName ?? "—"}</p>
                  <p className="text-sm text-text-muted">
                    {topTeam ? `${topTeam.wins}-${topTeam.losses} | ${topTeam.points} tšk` : "Lentelė formuojama"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <Link
                href="/standings"
                className="rounded-2xl border border-border bg-black/20 p-4 hover:border-primary transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Lentelė</p>
                <p className="mt-2 text-lg font-bold">Komandų reitingai</p>
              </Link>
              <Link
                href="/schedule"
                className="rounded-2xl border border-border bg-black/20 p-4 hover:border-primary transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Rungtynės</p>
                <p className="mt-2 text-lg font-bold">Tvarkaraštis ir rezultatai</p>
              </Link>
              <Link
                href="/teams"
                className="rounded-2xl border border-border bg-black/20 p-4 hover:border-primary transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Komandos</p>
                <p className="mt-2 text-lg font-bold">Sudėtys ir forma</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <Link
          href="/standings"
          className="block bg-card-bg rounded-2xl p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Paskutinis rezultatas</p>
          {latestMatch ? (
            <>
              <h3 className="mt-3 text-lg font-bold group-hover:text-primary transition-colors">
                {teamMap.get(latestMatch.homeTeamId)} {latestMatch.homeScore} : {latestMatch.awayScore} {teamMap.get(latestMatch.awayTeamId)}
              </h3>
              <p className="text-sm text-text-muted mt-1">{latestMatch.round}. turas</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Rezultatų dar nėra</p>
          )}
        </Link>
        <Link
          href="/schedule"
          className="block bg-card-bg rounded-2xl p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Artimiausia akistata</p>
          {nextMatch ? (
            <>
              <h3 className="mt-3 text-lg font-bold group-hover:text-primary transition-colors">
                {teamMap.get(nextMatch.homeTeamId)} vs {teamMap.get(nextMatch.awayTeamId)}
              </h3>
              <p className="text-sm text-text-muted mt-1">{nextMatch.round}. turas</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Likusių rungtynių nebėra</p>
          )}
        </Link>
        <Link
          href="/players"
          className="block bg-card-bg rounded-2xl p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Karščiausias žaidėjas</p>
          {hotPlayer ? (
            <>
              <h3 className="mt-3 text-lg font-bold group-hover:text-primary transition-colors">
                {hotPlayer.name}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                {hotPlayer.avgPoints} TŠK | {hotPlayer.eff} EFF
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Statistikos dar nėra</p>
          )}
        </Link>
        <Link
          href={topTeam ? `/teams/${topTeam.teamId}` : "/teams"}
          className="block bg-card-bg rounded-2xl p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Stabiliausia komanda</p>
          {topTeam ? (
            <>
              <h3 className="mt-3 text-lg font-bold group-hover:text-primary transition-colors">
                {topTeam.teamName}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                {topTeam.form.map((entry) => entry.result).join(" ") || "Forma dar nesusidėjo"}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Lentelė dar nepilna</p>
          )}
        </Link>
      </section>

      {topPlayers.length > 0 && (
        <section className="bg-card-bg rounded-2xl border border-border overflow-hidden">
          <div className="bg-primary text-black px-5 py-3 font-bold text-lg">
            ŽAIDĖJŲ LYDERIAI
          </div>
          <div className="divide-y divide-border">
            {topPlayers.map((player, index) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="p-4 flex items-center gap-4 hover:bg-card-bg-hover transition-colors block"
              >
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary text-black rounded-full font-black text-lg">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold">{player.name}</h3>
                  <p className="text-sm text-text-muted">
                    {teamMap.get(player.teamId ?? "") ?? "Pakaitinis"} | {player.avgPoints} TŠK | {player.avgRebounds} REB | {player.avgAssists} REZ
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{player.eff}</p>
                  <p className="text-xs text-text-muted">EFF</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-card-bg rounded-2xl border border-border overflow-hidden">
          <div className="bg-primary text-black px-5 py-3 font-bold text-lg">
            LENTELĖS SANTRAUKA
          </div>
          <div className="divide-y divide-border">
            {standings.slice(0, 5).map((standing, index) => (
              <Link
                key={standing.teamId}
                href={`/teams/${standing.teamId}`}
                className="block p-4 hover:bg-card-bg-hover transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background font-black text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold">{standing.teamName}</p>
                      <p className="text-sm text-text-muted">
                        {standing.wins}-{standing.losses} | {standing.pointsFor}:{standing.pointsAgainst}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-primary">{standing.points}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl border border-border overflow-hidden">
          <div className="bg-primary text-black px-5 py-3 font-bold text-lg">
            KOMANDŲ FORMA
          </div>
          <div className="divide-y divide-border">
            {standings.slice(0, 4).map((standing) => (
              <Link
                key={standing.teamId}
                href={`/teams/${standing.teamId}`}
                className="block p-4 hover:bg-card-bg-hover transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold">{standing.teamName}</p>
                    <p className="text-sm text-text-muted">{standing.pointsDiff > 0 ? "+" : ""}{standing.pointsDiff} skirtumas</p>
                  </div>
                  <div className="flex gap-2">
                    {getTeamForm(standing.teamId, matches).slice(0, 5).map((entry, index) => (
                      <span
                        key={`${standing.teamId}-${entry.match.id}-${index}`}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                          entry.result === "W"
                            ? "bg-success/20 text-success"
                            : entry.result === "L"
                              ? "bg-danger/20 text-danger"
                              : "bg-border text-text-muted"
                        }`}
                      >
                        {entry.result}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/wagers"
          className="rounded-full border border-border bg-card-bg px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
        >
          Atidaryti lažybų rinką
        </Link>
        <Link
          href="/schedule"
          className="rounded-full border border-border bg-card-bg px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
        >
          Peržiūrėti visą tvarkaraštį
        </Link>
        <Link
          href="/admin"
          className="rounded-full border border-border bg-card-bg px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
        >
          Admin valdymas
        </Link>
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatch, getTeams } from "@/lib/data";
import { getStatsRowsForMatch, getPlayers } from "@/lib/players";
import { getPerformanceComments } from "@/lib/gameComments";
import { calculateGameEff } from "@/lib/league";
import type { GameStats } from "@/lib/players";
import type { Player } from "@/lib/players";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function PlayerStatRow({
  player,
  game,
  teamLabel,
}: {
  player: Player;
  game: GameStats;
  teamLabel: string;
}) {
  const comments = getPerformanceComments(game);
  const eff = calculateGameEff(game);
  const threePtPct =
    game.threePtAttempts > 0
      ? ((game.threePtMade / game.threePtAttempts) * 100).toFixed(1)
      : "—";
  const fgPct =
    game.fgAttempts > 0
      ? ((game.fgMade / game.fgAttempts) * 100).toFixed(1)
      : "—";
  const ftPct =
    game.ftAttempts > 0
      ? ((game.ftMade / game.ftAttempts) * 100).toFixed(1)
      : "—";

  return (
    <div className="bg-background rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <Link
            href={`/players/${player.id}`}
            className="font-bold hover:text-primary transition-colors"
          >
            {player.name}
          </Link>
          <span className="text-text-muted text-sm ml-2">{teamLabel}</span>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="font-black text-primary">{game.points} TŠK</span>
          <span>{game.rebounds} REB</span>
          <span>{game.assists} REZ</span>
          <span>{eff} EFF</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-sm text-text-muted mb-2">
        <span>PER: {game.steals}</span>
        <span>BLK: {game.blocks}</span>
        <span>KLD: {game.turnovers}</span>
        <span>FG%: {fgPct}%</span>
        <span>3PT%: {threePtPct}%</span>
        <span>FT%: {ftPct}%</span>
      </div>
      {comments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border">
          {comments.map((c, i) => (
            <span
              key={i}
              className="text-xs bg-card-bg text-text-muted px-2 py-1 rounded italic"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function MatchGamePage({ params }: Props) {
  const { id } = await params;
  const [match, statsRows, players, teams] = await Promise.all([
    getMatch(id),
    getStatsRowsForMatch(id),
    getPlayers(),
    getTeams(),
  ]);

  if (!match) notFound();

  const teamMap = new Map(teams.map((t) => [t.id, t.name]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const homeName = teamMap.get(match.homeTeamId) ?? "?";
  const awayName = teamMap.get(match.awayTeamId) ?? "?";

  const homeStats = statsRows.filter((row) => {
    const p = playerMap.get(row.playerId);
    return p?.teamId === match.homeTeamId;
  }).sort((a, b) => {
    const effDiff = calculateGameEff(b.game) - calculateGameEff(a.game);
    if (effDiff !== 0) return effDiff;
    return b.game.points - a.game.points;
  });
  const awayStats = statsRows.filter((row) => {
    const p = playerMap.get(row.playerId);
    return p?.teamId === match.awayTeamId;
  }).sort((a, b) => {
    const effDiff = calculateGameEff(b.game) - calculateGameEff(a.game);
    if (effDiff !== 0) return effDiff;
    return b.game.points - a.game.points;
  });
  const substituteStats = statsRows.filter((row) => {
    const p = playerMap.get(row.playerId);
    return p?.category === "substitute" || p?.teamId == null;
  });

  const isPlayed = match.status === "played";
  const allRows = [...homeStats, ...awayStats, ...substituteStats];

  const leaders = {
    scorer: [...allRows].sort((a, b) => b.game.points - a.game.points)[0] ?? null,
    rebounder: [...allRows].sort((a, b) => b.game.rebounds - a.game.rebounds)[0] ?? null,
    eff: [...allRows].sort((a, b) => calculateGameEff(b.game) - calculateGameEff(a.game))[0] ?? null,
  };

  const homeTotals = homeStats.reduce(
    (totals, row) => {
      totals.points += row.game.points;
      totals.rebounds += row.game.rebounds;
      totals.assists += row.game.assists;
      return totals;
    },
    { points: 0, rebounds: 0, assists: 0 }
  );

  const awayTotals = awayStats.reduce(
    (totals, row) => {
      totals.points += row.game.points;
      totals.rebounds += row.game.rebounds;
      totals.assists += row.game.assists;
      return totals;
    },
    { points: 0, rebounds: 0, assists: 0 }
  );

  const scoreMatchesStats =
    (match.homeScore ?? 0) === homeTotals.points &&
    (match.awayScore ?? 0) === awayTotals.points;

  return (
    <div className="space-y-6">
      <Link
        href="/schedule"
        className="text-primary hover:underline text-sm inline-block"
      >
        ← Atgal į rungtynes
      </Link>

      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="bg-primary text-black px-4 py-3 font-bold text-center">
          {match.round}. TURAS
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="text-center flex-1">
            <Link
              href={`/teams/${match.homeTeamId}`}
              className="font-bold text-lg hover:text-primary transition-colors"
            >
              {homeName}
            </Link>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-background rounded-lg border border-border">
            {isPlayed ? (
              <>
                <span
                  className={`text-3xl font-black ${
                    (match.homeScore ?? 0) > (match.awayScore ?? 0)
                      ? "text-primary"
                      : "text-white"
                  }`}
                >
                  {match.homeScore}
                </span>
                <span className="text-text-muted text-2xl">:</span>
                <span
                  className={`text-3xl font-black ${
                    (match.awayScore ?? 0) > (match.homeScore ?? 0)
                      ? "text-primary"
                      : "text-white"
                  }`}
                >
                  {match.awayScore}
                </span>
              </>
            ) : (
              <span className="text-text-muted font-bold text-xl">VS</span>
            )}
          </div>
          <div className="text-center flex-1">
            <Link
              href={`/teams/${match.awayTeamId}`}
              className="font-bold text-lg hover:text-primary transition-colors"
            >
              {awayName}
            </Link>
          </div>
        </div>
      </div>

      {!isPlayed && (
        <div className="bg-card-bg rounded-lg border border-border p-6 text-center text-text-muted">
          Rungtynės dar neįvyko. Statistika bus rodoma po rungtynių.
        </div>
      )}

      {isPlayed && statsRows.length === 0 && (
        <div className="bg-card-bg rounded-lg border border-border p-6 text-center text-text-muted">
          Statistikos dar nėra.
        </div>
      )}

      {isPlayed && statsRows.length > 0 && (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-3">
            {leaders.scorer && (
              <div className="rounded-2xl border border-border bg-card-bg p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Rezultatyviausias</p>
                <p className="mt-2 text-xl font-black">
                  {playerMap.get(leaders.scorer.playerId)?.name ?? "?"}
                </p>
                <p className="text-sm text-text-muted">{leaders.scorer.game.points} TŠK</p>
              </div>
            )}
            {leaders.rebounder && (
              <div className="rounded-2xl border border-border bg-card-bg p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">REB lyderis</p>
                <p className="mt-2 text-xl font-black">
                  {playerMap.get(leaders.rebounder.playerId)?.name ?? "?"}
                </p>
                <p className="text-sm text-text-muted">{leaders.rebounder.game.rebounds} REB</p>
              </div>
            )}
            {leaders.eff && (
              <div className="rounded-2xl border border-border bg-card-bg p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Geriausias EFF</p>
                <p className="mt-2 text-xl font-black">
                  {playerMap.get(leaders.eff.playerId)?.name ?? "?"}
                </p>
                <p className="text-sm text-text-muted">{calculateGameEff(leaders.eff.game)} EFF</p>
              </div>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card-bg p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{homeName} komandos suvestinė</h2>
                <span className="text-sm text-text-muted">{homeStats.length} žaid.</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xl font-black text-primary">{homeTotals.points}</p>
                  <p className="text-xs text-text-muted">TŠK</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xl font-black">{homeTotals.rebounds}</p>
                  <p className="text-xs text-text-muted">REB</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xl font-black">{homeTotals.assists}</p>
                  <p className="text-xs text-text-muted">REZ</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card-bg p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{awayName} komandos suvestinė</h2>
                <span className="text-sm text-text-muted">{awayStats.length} žaid.</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xl font-black text-primary">{awayTotals.points}</p>
                  <p className="text-xs text-text-muted">TŠK</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xl font-black">{awayTotals.rebounds}</p>
                  <p className="text-xs text-text-muted">REB</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xl font-black">{awayTotals.assists}</p>
                  <p className="text-xs text-text-muted">REZ</p>
                </div>
              </div>
            </div>
          </section>

          {!scoreMatchesStats && (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-text-muted">
              Žaidėjų taškų suma nesutampa su galutiniu rezultatu. Dalis statistikos dar gali būti nesuvesta.
            </div>
          )}

          <section>
            <h2 className="text-xl font-bold text-primary mb-3 border-b border-border pb-2">
              {homeName}
            </h2>
            <div className="space-y-3">
              {homeStats.map((row) => {
                const player = playerMap.get(row.playerId);
                if (!player) return null;
                return (
                  <PlayerStatRow
                    key={row.playerId}
                    player={player}
                    game={row.game}
                    teamLabel=""
                  />
                );
              })}
              {homeStats.length === 0 && (
                <p className="text-text-muted text-sm">Nėra įrašų</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3 border-b border-border pb-2">
              {awayName}
            </h2>
            <div className="space-y-3">
              {awayStats.map((row) => {
                const player = playerMap.get(row.playerId);
                if (!player) return null;
                return (
                  <PlayerStatRow
                    key={row.playerId}
                    player={player}
                    game={row.game}
                    teamLabel=""
                  />
                );
              })}
              {awayStats.length === 0 && (
                <p className="text-text-muted text-sm">Nėra įrašų</p>
              )}
            </div>
          </section>

          {substituteStats.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-primary/80 mb-3 border-b border-border pb-2">
                Pakaitiniai
              </h2>
              <div className="space-y-3">
                {substituteStats.map((row) => {
                  const player = playerMap.get(row.playerId);
                  if (!player) return null;
                  return (
                    <PlayerStatRow
                      key={row.playerId}
                      player={player}
                      game={row.game}
                      teamLabel="(Pakaitinis)"
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

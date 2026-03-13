import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatch, getTeams } from "@/lib/data";
import { getStatsRowsForMatch, getPlayers } from "@/lib/players";
import { getPerformanceComments } from "@/lib/gameComments";
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
  });
  const awayStats = statsRows.filter((row) => {
    const p = playerMap.get(row.playerId);
    return p?.teamId === match.awayTeamId;
  });
  const substituteStats = statsRows.filter((row) => {
    const p = playerMap.get(row.playerId);
    return p?.category === "substitute" || p?.teamId == null;
  });

  const isPlayed = match.status === "played";

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
            <p className="font-bold text-lg">{homeName}</p>
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
            <p className="font-bold text-lg">{awayName}</p>
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayer, getPlayerStats, calculateEFF } from "@/lib/players";
import { getMatches, getTeams } from "@/lib/data";
import { getOpponentId, getOpponentScore, getTeamScore, sortMatchesChronologically } from "@/lib/league";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: Props) {
  const { id } = await params;
  const [player, stats, matches, teams] = await Promise.all([
    getPlayer(id),
    getPlayerStats(id),
    getMatches(),
    getTeams(),
  ]);

  if (!player) {
    notFound();
  }

  const teamMap = new Map(teams.map((team) => [team.id, team.name]));
  const team = player.teamId ? teams.find((entry) => entry.id === player.teamId) ?? null : null;

  const gamesPlayed = stats?.games.length || 0;
  const t = stats?.totals || {
    points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
    turnovers: 0, personalFouls: 0, twoFgMade: 0, twoFgAttempts: 0,
    fgMade: 0, fgAttempts: 0, threePtMade: 0,
    threePtAttempts: 0, ftMade: 0, ftAttempts: 0
  };

  const eff = calculateEFF(t, gamesPlayed);
  const avgPoints = gamesPlayed > 0 ? (t.points / gamesPlayed).toFixed(1) : "0.0";
  const avgRebounds = gamesPlayed > 0 ? (t.rebounds / gamesPlayed).toFixed(1) : "0.0";
  const avgAssists = gamesPlayed > 0 ? (t.assists / gamesPlayed).toFixed(1) : "0.0";
  const avgSteals = gamesPlayed > 0 ? (t.steals / gamesPlayed).toFixed(1) : "0.0";
  const avgBlocks = gamesPlayed > 0 ? (t.blocks / gamesPlayed).toFixed(1) : "0.0";
  const avgTurnovers = gamesPlayed > 0 ? (t.turnovers / gamesPlayed).toFixed(1) : "0.0";
  const avgPf = gamesPlayed > 0 ? (t.personalFouls / gamesPlayed).toFixed(1) : "0.0";
  const fgPct = t.fgAttempts > 0 ? ((t.fgMade / t.fgAttempts) * 100).toFixed(1) : "0.0";
  const threePtPct = t.threePtAttempts > 0 ? ((t.threePtMade / t.threePtAttempts) * 100).toFixed(1) : "0.0";
  const ftPct = t.ftAttempts > 0 ? ((t.ftMade / t.ftAttempts) * 100).toFixed(1) : "0.0";
  const matchMap = new Map(sortMatchesChronologically(matches).map((match) => [match.id, match]));
  const gameLog = (stats?.games ?? [])
    .map((game) => {
      const match = matchMap.get(game.matchId);
      if (!match) {
        return { game, match: null };
      }

      const opponentName = player.teamId
        ? teamMap.get(getOpponentId(player.teamId, match)) ?? "Nežinoma komanda"
        : "Pakaitinio rungtynės";
      const teamScore = player.teamId ? getTeamScore(player.teamId, match) : null;
      const opponentScore = player.teamId ? getOpponentScore(player.teamId, match) : null;
      const result =
        teamScore === null || opponentScore === null
          ? "—"
          : teamScore > opponentScore
            ? "P"
            : teamScore < opponentScore
              ? "Pr"
              : "L";

      return {
        game,
        match,
        opponentName,
        teamScore,
        opponentScore,
        result,
      };
    })
    .sort((a, b) => {
      const aRound = a.match?.round ?? 0;
      const bRound = b.match?.round ?? 0;
      if (bRound !== aRound) return bRound - aRound;
      return Number(b.match?.id ?? 0) - Number(a.match?.id ?? 0);
    });

  return (
    <div className="space-y-6">
      <Link href="/players" className="text-primary hover:underline text-sm">
        ← Visi žaidėjai
      </Link>

      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="bg-primary text-black p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-black/20 flex items-center justify-center text-4xl font-black">
              {player.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black">{player.name}</h1>
              {player.category === "substitute" ? (
                <p className="text-black/70 font-medium">Pakaitinis</p>
              ) : team ? (
                <Link
                  href={`/teams/${team.id}`}
                  className="text-black/70 font-medium hover:text-black transition-colors"
                >
                  {team.name}
                </Link>
              ) : (
                <p className="text-black/70 font-medium">—</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <p className="text-4xl font-black text-primary">{eff}</p>
              <p className="text-sm text-text-muted">EFF</p>
            </div>
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <p className="text-4xl font-black">{avgPoints}</p>
              <p className="text-sm text-text-muted">TŠK</p>
            </div>
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <p className="text-4xl font-black">{avgRebounds}</p>
              <p className="text-sm text-text-muted">ATŠ</p>
            </div>
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <p className="text-4xl font-black">{avgAssists}</p>
              <p className="text-sm text-text-muted">REZ</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            <div className="bg-background rounded p-3 text-center border border-border">
              <p className="text-2xl font-bold">{gamesPlayed}</p>
              <p className="text-xs text-text-muted">Rungtynės</p>
            </div>
            <div className="bg-background rounded p-3 text-center border border-border">
              <p className="text-2xl font-bold">{avgSteals}</p>
              <p className="text-xs text-text-muted">PER</p>
            </div>
            <div className="bg-background rounded p-3 text-center border border-border">
              <p className="text-2xl font-bold">{avgBlocks}</p>
              <p className="text-xs text-text-muted">BLK</p>
            </div>
            <div className="bg-background rounded p-3 text-center border border-border">
              <p className="text-2xl font-bold text-danger">{avgTurnovers}</p>
              <p className="text-xs text-text-muted">KLD</p>
            </div>
            <div className="bg-background rounded p-3 text-center border border-border">
              <p className="text-2xl font-bold">{avgPf}</p>
              <p className="text-xs text-text-muted">PF</p>
            </div>
            <div className="bg-background rounded p-3 text-center border border-border">
              <p className="text-2xl font-bold">{fgPct}%</p>
              <p className="text-xs text-text-muted">FG%</p>
            </div>
            <div className="bg-background rounded p-3 text-center border border-border">
              <p className="text-2xl font-bold">{threePtPct}%</p>
              <p className="text-xs text-text-muted">3PT%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="bg-primary text-black px-4 py-3 font-bold">
          STATISTIKA PAGAL RUNGTYNES
        </div>
        {gameLog.length > 0 ? (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {gameLog.map(({ game, match, opponentName, teamScore, opponentScore, result }, idx) => (
                <Link
                  key={`${game.matchId}-${idx}`}
                  href={match ? `/schedule/${match.id}` : "#"}
                  className="block rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                        {match ? `${match.round}. turas` : `Rungtynės #${game.matchId}`}
                      </p>
                      <p className="mt-1 font-bold">vs {opponentName ?? "—"}</p>
                      <p className="text-sm text-text-muted">
                        {result} {teamScore ?? "—"} : {opponentScore ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">{game.points}</p>
                      <p className="text-xs text-text-muted">TŠK</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="rounded-lg border border-border px-2 py-2">
                      <p className="font-bold">{game.rebounds}</p>
                      <p className="text-xs text-text-muted">ATŠ</p>
                    </div>
                    <div className="rounded-lg border border-border px-2 py-2">
                      <p className="font-bold">{game.assists}</p>
                      <p className="text-xs text-text-muted">REZ</p>
                    </div>
                    <div className="rounded-lg border border-border px-2 py-2">
                      <p className="font-bold">{game.steals}</p>
                      <p className="text-xs text-text-muted">PER</p>
                    </div>
                    <div className="rounded-lg border border-border px-2 py-2">
                      <p className="font-bold">{game.blocks}</p>
                      <p className="text-xs text-text-muted">BLK</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-[#252525]">
                <tr>
                  <th className="px-3 py-2 text-left text-text-muted">Turas</th>
                  <th className="px-3 py-2 text-left text-text-muted">Varžovas</th>
                  <th className="px-3 py-2 text-center text-text-muted">Rez.</th>
                  <th className="px-3 py-2 text-center text-text-muted">TŠK</th>
                  <th className="px-3 py-2 text-center text-text-muted">ATŠ</th>
                  <th className="px-3 py-2 text-center text-text-muted">REZ</th>
                  <th className="px-3 py-2 text-center text-text-muted">PER</th>
                  <th className="px-3 py-2 text-center text-text-muted">BLK</th>
                  <th className="px-3 py-2 text-center text-text-muted">PF</th>
                  <th className="px-3 py-2 text-center text-text-muted">KLD</th>
                  <th className="px-3 py-2 text-center text-text-muted">FG</th>
                  <th className="px-3 py-2 text-center text-text-muted">3PT</th>
                  <th className="px-3 py-2 text-center text-text-muted">FT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gameLog.map(({ game, match, opponentName, teamScore, opponentScore, result }, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-card-bg-hover">
                      <td className="px-3 py-2">
                        <Link href={match ? `/schedule/${match.id}` : "#"} className="hover:text-primary">
                          {match ? `${match.round}. turas` : `#${game.matchId}`}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{opponentName ?? "—"}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={
                            result === "P"
                              ? "text-success font-bold"
                              : result === "Pr"
                                ? "text-danger font-bold"
                                : "text-text-muted font-bold"
                          }
                        >
                          {result} {teamScore ?? "—"}:{opponentScore ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-primary">{game.points}</td>
                      <td className="px-3 py-2 text-center">{game.rebounds}</td>
                      <td className="px-3 py-2 text-center">{game.assists}</td>
                      <td className="px-3 py-2 text-center">{game.steals}</td>
                      <td className="px-3 py-2 text-center">{game.blocks}</td>
                      <td className="px-3 py-2 text-center">{game.personalFouls}</td>
                      <td className="px-3 py-2 text-center text-danger">{game.turnovers}</td>
                      <td className="px-3 py-2 text-center">{game.fgMade}/{game.fgAttempts}</td>
                      <td className="px-3 py-2 text-center">{game.threePtMade}/{game.threePtAttempts}</td>
                      <td className="px-3 py-2 text-center">{game.ftMade}/{game.ftAttempts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-text-muted">
            Kol kas statistikos nėra
          </div>
        )}
      </div>

      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="bg-primary text-black px-4 py-3 font-bold">
          SEZONO SUVESTINĖ
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#252525]">
                <tr>
                  <th className="px-3 py-2 text-left text-text-muted">Stat</th>
                  <th className="px-3 py-2 text-center text-text-muted">Iš viso</th>
                  <th className="px-3 py-2 text-center text-text-muted">Vid./rungt.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-3 py-2">Taškai</td>
                  <td className="px-3 py-2 text-center font-bold">{t.points}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{avgPoints}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Asmeninės pražangos (PF)</td>
                  <td className="px-3 py-2 text-center font-bold">{t.personalFouls}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{avgPf}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Atšokę kamuoliai</td>
                  <td className="px-3 py-2 text-center font-bold">{t.rebounds}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{avgRebounds}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Rezultatyvūs perdavimai</td>
                  <td className="px-3 py-2 text-center font-bold">{t.assists}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{avgAssists}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Perimti kamuoliai</td>
                  <td className="px-3 py-2 text-center font-bold">{t.steals}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{avgSteals}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Blokai</td>
                  <td className="px-3 py-2 text-center font-bold">{t.blocks}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{avgBlocks}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Klaidos</td>
                  <td className="px-3 py-2 text-center font-bold text-danger">{t.turnovers}</td>
                  <td className="px-3 py-2 text-center text-danger font-bold">{avgTurnovers}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Metimai iš žaidimo</td>
                  <td className="px-3 py-2 text-center font-bold">{t.fgMade}/{t.fgAttempts}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{fgPct}%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Tritaškiai</td>
                  <td className="px-3 py-2 text-center font-bold">{t.threePtMade}/{t.threePtAttempts}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{threePtPct}%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Baudos metimai</td>
                  <td className="px-3 py-2 text-center font-bold">{t.ftMade}/{t.ftAttempts}</td>
                  <td className="px-3 py-2 text-center text-primary font-bold">{ftPct}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-card-bg rounded-lg border border-border p-4 text-sm text-text-muted">
        <p><strong className="text-primary">EFF</strong> = (TŠK + ATŠ + REZ + PER + BLK) - (Prašauti FG) - (Prašauti FT) - KLD</p>
        <p className="mt-1">TŠK = Taškai | ATŠ = Atšokę | REZ = Rez. perdavimai | PER = Perimimai | BLK = Blokai | KLD = Klaidos</p>
      </div>
    </div>
  );
}

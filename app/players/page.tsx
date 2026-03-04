import Link from "next/link";
import { getPlayersWithStats } from "@/lib/players";
import { getTeams } from "@/lib/data";

export default async function PlayersPage() {
  const [playersWithStats, teams] = await Promise.all([
    getPlayersWithStats(),
    getTeams(),
  ]);

  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  const playersByTeam = playersWithStats.reduce((acc, player) => {
    if (!acc[player.teamId]) acc[player.teamId] = [];
    acc[player.teamId].push(player);
    return acc;
  }, {} as Record<string, typeof playersWithStats>);

  const rankedPlayers = [...playersWithStats].sort((a, b) => {
    if (b.eff !== a.eff) return b.eff - a.eff;
    if (b.avgPoints !== a.avgPoints) return b.avgPoints - a.avgPoints;
    return b.gamesPlayed - a.gamesPlayed;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">
        <span className="text-primary">ŽAIDĖJAI</span>
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-card-bg rounded-lg border border-border overflow-hidden"
          >
            <div className="bg-primary text-black px-4 py-3 font-bold">
              {team.name}
            </div>
            <div className="divide-y divide-border">
              {playersByTeam[team.id]?.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="p-4 flex items-center gap-3 hover:bg-card-bg-hover transition-colors block"
                >
                  <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-lg font-bold text-primary">
                    {player.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-xs text-text-muted">
                      {player.gamesPlayed} rung. | {player.avgPoints} TŠK
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">{player.eff}</p>
                    <p className="text-xs text-text-muted">EFF</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="bg-primary text-black px-4 py-3 font-bold">
          VISI ŽAIDĖJAI (Pagal EFF)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#252525] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-text-muted">#</th>
                <th className="px-4 py-3 font-semibold text-text-muted">Žaidėjas</th>
                <th className="px-4 py-3 font-semibold text-text-muted">Komanda</th>
                <th className="px-4 py-3 font-semibold text-text-muted text-center">R</th>
                <th className="px-4 py-3 font-semibold text-primary text-center">EFF</th>
                <th className="px-4 py-3 font-semibold text-text-muted text-center">TŠK</th>
                <th className="px-4 py-3 font-semibold text-text-muted text-center">ATŠ</th>
                <th className="px-4 py-3 font-semibold text-text-muted text-center">REZ</th>
                <th className="px-4 py-3 font-semibold text-text-muted text-center">PER</th>
                <th className="px-4 py-3 font-semibold text-text-muted text-center">BLK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rankedPlayers.map((player, index) => (
                <tr key={player.id} className="hover:bg-card-bg-hover transition-colors">
                  <td className="px-4 py-3">
                    <span className={`font-black ${index < 3 ? 'text-primary' : 'text-text-muted'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/players/${player.id}`} className="font-medium hover:text-primary transition-colors">
                      {player.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-sm">{teamMap.get(player.teamId)}</td>
                  <td className="px-4 py-3 text-center text-text-muted">{player.gamesPlayed}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-black text-primary text-lg">{player.eff}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{player.avgPoints}</td>
                  <td className="px-4 py-3 text-center">{player.avgRebounds}</td>
                  <td className="px-4 py-3 text-center">{player.avgAssists}</td>
                  <td className="px-4 py-3 text-center">{player.avgSteals}</td>
                  <td className="px-4 py-3 text-center">{player.avgBlocks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card-bg rounded-lg border border-border p-4 text-sm text-text-muted">
        <p><strong className="text-primary">EFF</strong> (Efektyvumas) = (TŠK + ATŠ + REZ + PER + BLK) - Prašauti - KLD</p>
        <p className="mt-1">R = Rungtynės | TŠK = Taškai | ATŠ = Atšokę | REZ = Rez. perdavimai | PER = Perimimai | BLK = Blokai</p>
      </div>
    </div>
  );
}

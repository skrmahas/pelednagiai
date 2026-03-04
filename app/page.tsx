import { getTeams } from "@/lib/data";
import { getPlayersWithStats } from "@/lib/players";
import Link from "next/link";

export default async function HomePage() {
  const [teams, playersWithStats] = await Promise.all([
    getTeams(),
    getPlayersWithStats(),
  ]);

  const playersByTeam = playersWithStats.reduce((acc, player) => {
    if (!acc[player.teamId]) acc[player.teamId] = [];
    acc[player.teamId].push(player);
    return acc;
  }, {} as Record<string, typeof playersWithStats>);

  const topPlayers = [...playersWithStats]
    .sort((a, b) => b.eff - a.eff)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-black">
          <span className="text-white">PELĖDNAGIŲ</span>
          <span className="bg-primary text-black px-3 py-1 rounded ml-2">2x2</span>
          <span className="text-white ml-2">LYGA</span>
        </h1>
        <p className="text-xl text-text-muted">
          Draugų krepšinio turnyras
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/standings"
          className="block bg-card-bg rounded-lg p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Lentelė</h3>
          <p className="text-sm text-text-muted mt-1">Komandų reitingai</p>
        </Link>
        <Link
          href="/schedule"
          className="block bg-card-bg rounded-lg p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <div className="text-3xl mb-2">🏀</div>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Rungtynės</h3>
          <p className="text-sm text-text-muted mt-1">Tvarkaraštis</p>
        </Link>
        <Link
          href="/players"
          className="block bg-card-bg rounded-lg p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Žaidėjai</h3>
          <p className="text-sm text-text-muted mt-1">Statistika ir EFF</p>
        </Link>
        <Link
          href="/wagers"
          className="block bg-card-bg rounded-lg p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Lažybos</h3>
          <p className="text-sm text-text-muted mt-1">Statyk už komandą</p>
        </Link>
        <Link
          href="/admin"
          className="block bg-card-bg rounded-lg p-5 border border-border hover:border-primary hover:bg-card-bg-hover transition-all group"
        >
          <div className="text-3xl mb-2">⚙️</div>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Admin</h3>
          <p className="text-sm text-text-muted mt-1">Valdymas</p>
        </Link>
      </section>

      {topPlayers.some(p => p.gamesPlayed > 0) && (
        <section className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <div className="bg-primary text-black px-5 py-3 font-bold text-lg">
            TOP ŽAIDĖJAI (EFF)
          </div>
          <div className="divide-y divide-border">
            {topPlayers.filter(p => p.gamesPlayed > 0).map((player, index) => (
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
                    {player.avgPoints} TŠK | {player.avgRebounds} ATŠ | {player.avgAssists} REZ
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

      <section className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="bg-primary text-black px-5 py-3 font-bold text-lg">
          KOMANDOS
        </div>
        <div className="divide-y divide-border">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className="p-4 flex items-center gap-4 hover:bg-card-bg-hover transition-colors"
            >
              <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary text-black rounded font-black text-lg">
                {index + 1}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{team.name}</h3>
                <p className="text-sm text-text-muted">
                  {playersByTeam[team.id]?.map(p => p.name).join(", ") || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

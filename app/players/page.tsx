import { getPlayersWithStats } from "@/lib/players";
import { getTeams } from "@/lib/data";
import PlayersDirectory from "./PlayersDirectory";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const [playersWithStats, teams] = await Promise.all([
    getPlayersWithStats(),
    getTeams(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black">
          <span className="text-primary">ŽAIDĖJAI</span>
        </h1>
        <p className="text-text-muted">
          Rikiuokite pagal efektyvumą, taškus ar pataikymą, filtruokite pagal komandą ir greitai raskite žaidėją.
        </p>
      </div>

      <PlayersDirectory players={playersWithStats} teams={teams} />

      <div className="bg-card-bg rounded-lg border border-border p-4 text-sm text-text-muted">
        <p><strong className="text-primary">EFF</strong> (Efektyvumas) = (TŠK + ATŠ + REZ + PER + BLK) - Prašauti - KLD</p>
        <p className="mt-1">R = Rungtynės | TŠK = Taškai | ATŠ = Atšokę | REZ = Rez. perdavimai | FG% / 3PT% / FT% = pataikymas</p>
      </div>
    </div>
  );
}

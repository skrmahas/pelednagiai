import { getStandings } from "@/lib/data";

export default async function StandingsPage() {
  const standings = await getStandings();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">
        <span className="text-primary">TURNYRINĖ LENTELĖ</span>
      </h1>

      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary text-black">
              <tr>
                <th className="px-4 py-3 font-bold">#</th>
                <th className="px-4 py-3 font-bold">Komanda</th>
                <th className="px-4 py-3 font-bold text-center">R</th>
                <th className="px-4 py-3 font-bold text-center">P</th>
                <th className="px-4 py-3 font-bold text-center">Pr</th>
                <th className="px-4 py-3 font-bold text-center">Tšk+</th>
                <th className="px-4 py-3 font-bold text-center">Tšk-</th>
                <th className="px-4 py-3 font-bold text-center">+/-</th>
                <th className="px-4 py-3 font-bold text-center">Tšk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {standings.map((standing, index) => (
                <tr
                  key={standing.teamId}
                  className="hover:bg-card-bg-hover transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={`font-black ${index < 3 ? 'text-primary' : 'text-text-muted'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{standing.teamName}</td>
                  <td className="px-4 py-3 text-center text-text-muted">{standing.played}</td>
                  <td className="px-4 py-3 text-center text-success font-bold">
                    {standing.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-danger font-bold">
                    {standing.losses}
                  </td>
                  <td className="px-4 py-3 text-center">{standing.pointsFor}</td>
                  <td className="px-4 py-3 text-center">{standing.pointsAgainst}</td>
                  <td className="px-4 py-3 text-center font-bold">
                    <span
                      className={
                        standing.pointsDiff > 0
                          ? "text-success"
                          : standing.pointsDiff < 0
                          ? "text-danger"
                          : "text-text-muted"
                      }
                    >
                      {standing.pointsDiff > 0 ? "+" : ""}
                      {standing.pointsDiff}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-black text-primary text-lg">
                    {standing.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card-bg rounded-lg border border-border p-4 text-sm text-text-muted space-y-1">
        <p><span className="text-primary font-bold">R</span> – Rungtynės | <span className="text-success font-bold">P</span> – Pergalės | <span className="text-danger font-bold">Pr</span> – Pralaimėjimai</p>
        <p><span className="font-bold">Tšk+</span> – Įmesti taškai | <span className="font-bold">Tšk-</span> – Praleisti taškai | <span className="font-bold">+/-</span> – Skirtumas</p>
        <p><span className="text-primary font-bold">Tšk</span> – Turnyro taškai (2 už pergalę)</p>
      </div>
    </div>
  );
}

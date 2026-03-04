import { getMatches, getTeams } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()]);

  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, typeof matches>);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const playedCount = matches.filter(m => m.status === 'played').length;
  const totalCount = matches.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-black">
          <span className="text-primary">RUNGTYNĖS</span>
        </h1>
        <div className="bg-card-bg rounded px-4 py-2 border border-border">
          <span className="text-text-muted">Sužaista: </span>
          <span className="text-primary font-bold">{playedCount}</span>
          <span className="text-text-muted"> / {totalCount}</span>
        </div>
      </div>

      <div className="space-y-4">
        {rounds.map((round) => {
          const roundMatches = matchesByRound[round];
          const allPlayed = roundMatches.every(m => m.status === 'played');
          
          return (
            <div
              key={round}
              className="bg-card-bg rounded-lg border border-border overflow-hidden"
            >
              <div className={`px-4 py-3 font-bold flex items-center justify-between ${allPlayed ? 'bg-[#252525]' : 'bg-primary text-black'}`}>
                <span>{round}. TURAS</span>
                {allPlayed && <span className="text-xs text-success">✓ Baigtas</span>}
              </div>
              <div className="divide-y divide-border">
                {roundMatches.map((match) => {
                  const homeName = teamMap.get(match.homeTeamId) || "?";
                  const awayName = teamMap.get(match.awayTeamId) || "?";
                  const isPlayed = match.status === "played";

                  return (
                    <div
                      key={match.id}
                      className="p-4 flex items-center justify-between gap-2 hover:bg-card-bg-hover transition-colors"
                    >
                      <div className="flex-1 text-right">
                        <span className="font-semibold text-sm sm:text-base">{homeName}</span>
                      </div>
                      <div className="flex-shrink-0 px-2 sm:px-4">
                        {isPlayed ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded font-black text-lg">
                            <span className={match.homeScore! > match.awayScore! ? 'text-primary' : 'text-white'}>
                              {match.homeScore}
                            </span>
                            <span className="text-text-muted">:</span>
                            <span className={match.awayScore! > match.homeScore! ? 'text-primary' : 'text-white'}>
                              {match.awayScore}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 bg-border rounded text-text-muted font-bold">
                            VS
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-sm sm:text-base">{awayName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12 text-text-muted bg-card-bg rounded-lg border border-border">
          Kol kas rungtynių nėra
        </div>
      )}
    </div>
  );
}

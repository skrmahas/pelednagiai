import { getMatches, getTeams } from "@/lib/data";
import { getWagers } from "@/lib/wagers";
import WagersList from "./WagersList";

export const dynamic = "force-dynamic";

export default async function WagersPage() {
  const [matches, teams, wagers] = await Promise.all([
    getMatches(),
    getTeams(),
    getWagers(),
  ]);

  const scheduledMatches = matches.filter(m => m.status === 'scheduled');
  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  const allBets = wagers.flatMap(wager => {
    const match = matches.find(m => m.id === wager.matchId);
    return wager.bets.map(bet => ({
      ...bet,
      wagerId: wager.id,
      matchId: wager.matchId,
      match,
      odds: bet.teamId === match?.homeTeamId ? wager.oddsHome : wager.oddsAway,
    }));
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const betterStats = allBets.reduce((acc, bet) => {
    if (!acc[bet.visitorName]) {
      acc[bet.visitorName] = { totalBets: 0, totalAmount: 0, wins: 0, losses: 0, pending: 0, profit: 0 };
    }
    acc[bet.visitorName].totalBets++;
    acc[bet.visitorName].totalAmount += bet.amount;
    
    if (bet.match?.status === 'played') {
      const won = (bet.match.homeScore! > bet.match.awayScore! && bet.teamId === bet.match.homeTeamId) ||
                  (bet.match.awayScore! > bet.match.homeScore! && bet.teamId === bet.match.awayTeamId);
      if (won) {
        acc[bet.visitorName].wins++;
        acc[bet.visitorName].profit += bet.amount * bet.odds - bet.amount;
      } else {
        acc[bet.visitorName].losses++;
        acc[bet.visitorName].profit -= bet.amount;
      }
    } else {
      acc[bet.visitorName].pending++;
    }
    return acc;
  }, {} as Record<string, { totalBets: number; totalAmount: number; wins: number; losses: number; pending: number; profit: number }>);

  const leaderboard = Object.entries(betterStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">
        <span className="text-primary">LAŽYBOS</span>
      </h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <WagersList 
            matches={matches} 
            teams={teams} 
            wagers={wagers}
            scheduledMatches={scheduledMatches}
          />
        </div>

        <div className="space-y-4">
          {leaderboard.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
              <div className="bg-primary text-black px-4 py-3 font-bold">
                LAŽYBŲ LYDERIAI
              </div>
              <div className="divide-y divide-border">
                {leaderboard.map((better, idx) => (
                  <div key={better.name} className="p-3 flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold ${idx < 3 ? 'bg-primary text-black' : 'bg-border text-text-muted'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{better.name}</p>
                      <p className="text-xs text-text-muted">
                        {better.wins}P / {better.losses}Pr / {better.pending} laukia
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${better.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {better.profit >= 0 ? '+' : ''}€{better.profit.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-muted">€{better.totalAmount.toFixed(2)} statyta</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allBets.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
              <div className="bg-primary text-black px-4 py-3 font-bold">
                VISI STATYMAI ({allBets.length})
              </div>
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {allBets.map((bet, idx) => {
                  const isPlayed = bet.match?.status === 'played';
                  let status = 'pending';
                  if (isPlayed && bet.match) {
                    const won = (bet.match.homeScore! > bet.match.awayScore! && bet.teamId === bet.match.homeTeamId) ||
                                (bet.match.awayScore! > bet.match.homeScore! && bet.teamId === bet.match.awayTeamId);
                    status = won ? 'won' : 'lost';
                  }

                  return (
                    <div key={`${bet.wagerId}-${bet.id}-${idx}`} className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{bet.visitorName}</p>
                          <p className="text-xs text-text-muted">
                            {teamMap.get(bet.teamId)} @ {bet.odds.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">€{bet.amount.toFixed(2)}</p>
                          {status === 'won' && (
                            <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded">
                              +€{(bet.amount * bet.odds - bet.amount).toFixed(2)}
                            </span>
                          )}
                          {status === 'lost' && (
                            <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded">
                              -€{bet.amount.toFixed(2)}
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className="text-xs bg-border text-text-muted px-2 py-0.5 rounded">
                              Laukia
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {allBets.length === 0 && (
            <div className="bg-card-bg rounded-lg border border-border p-6 text-center">
              <p className="text-text-muted">Statymų dar nėra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

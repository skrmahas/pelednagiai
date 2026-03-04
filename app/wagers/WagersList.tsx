"use client";

import { useState } from "react";
import type { Match, Team } from "@/lib/data";
import type { Wager } from "@/lib/wagers";

interface Props {
  matches: Match[];
  teams: Team[];
  wagers: Wager[];
  scheduledMatches: Match[];
}

export default function WagersList({ matches, teams, wagers: initialWagers, scheduledMatches }: Props) {
  const [wagers, setWagers] = useState(initialWagers);
  const [selectedWager, setSelectedWager] = useState<string | null>(null);
  const [betName, setBetName] = useState("");
  const [betTeam, setBetTeam] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const teamMap = new Map(teams.map((t) => [t.id, t.name]));
  const matchMap = new Map(matches.map((m) => [m.id, m]));

  async function handlePlaceBet(wagerId: string) {
    if (!betName.trim() || !betTeam || !betAmount) {
      setError("Užpildykite visus laukus");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/wagers/${wagerId}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: betName.trim(),
          teamId: betTeam,
          amount: parseFloat(betAmount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Klaida statant");
        return;
      }

      const updated = await res.json();
      setWagers(wagers.map(w => w.id === wagerId ? updated : w));
      setSuccess("Statymas priimtas!");
      setBetName("");
      setBetTeam("");
      setBetAmount("");
      setSelectedWager(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Klaida statant");
    } finally {
      setLoading(false);
    }
  }

  if (wagers.length === 0) {
    return (
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <div className="text-4xl mb-4">💰</div>
        <p className="text-text-muted text-lg">Kol kas lažybų nėra</p>
        <p className="text-text-muted text-sm mt-2">
          Administratorius gali sukurti lažybas per admin skydelį
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="bg-success/20 border border-success text-success px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {wagers.map((wager) => {
        const match = matchMap.get(wager.matchId);
        if (!match) return null;

        const homeName = teamMap.get(match.homeTeamId) || "?";
        const awayName = teamMap.get(match.awayTeamId) || "?";
        const isExpanded = selectedWager === wager.id;
        const totalBets = wager.bets.length;
        const totalAmount = wager.bets.reduce((sum, b) => sum + b.amount, 0);

        return (
          <div
            key={wager.id}
            className="bg-card-bg rounded-lg border border-border overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-text-muted mb-1">Rungtynės #{match.id}</p>
                  <p className="font-bold text-lg">
                    {homeName} <span className="text-text-muted">vs</span> {awayName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Statymų: {totalBets}</p>
                  <p className="text-primary font-bold">€{totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {wager.description && (
                <p className="text-sm text-text-muted mb-4 italic">
                  {wager.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-background rounded-lg p-3 text-center border border-border">
                  <p className="text-sm text-text-muted mb-1">{homeName}</p>
                  <p className="text-2xl font-black text-primary">{wager.oddsHome.toFixed(2)}</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center border border-border">
                  <p className="text-sm text-text-muted mb-1">{awayName}</p>
                  <p className="text-2xl font-black text-primary">{wager.oddsAway.toFixed(2)}</p>
                </div>
              </div>

              {match.status === 'scheduled' && (
                <button
                  onClick={() => setSelectedWager(isExpanded ? null : wager.id)}
                  className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {isExpanded ? "Uždaryti" : "STATYTI"}
                </button>
              )}

              {match.status === 'played' && (
                <div className="bg-border rounded-lg p-3 text-center">
                  <p className="text-text-muted">Rungtynės baigtos</p>
                  <p className="font-bold text-lg">
                    {match.homeScore} : {match.awayScore}
                  </p>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-border p-4 bg-[#151515]">
                <h4 className="font-bold mb-4">Naujas statymas</h4>
                
                {error && (
                  <p className="text-danger text-sm mb-4">{error}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Jūsų vardas</label>
                    <input
                      type="text"
                      value={betName}
                      onChange={(e) => setBetName(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
                      placeholder="Įveskite vardą"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Statykite už</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBetTeam(match.homeTeamId)}
                        className={`p-3 rounded-lg border transition-colors ${
                          betTeam === match.homeTeamId
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border hover:border-text-muted"
                        }`}
                      >
                        <p className="font-semibold text-sm">{homeName}</p>
                        <p className="text-primary font-bold">{wager.oddsHome.toFixed(2)}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBetTeam(match.awayTeamId)}
                        className={`p-3 rounded-lg border transition-colors ${
                          betTeam === match.awayTeamId
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border hover:border-text-muted"
                        }`}
                      >
                        <p className="font-semibold text-sm">{awayName}</p>
                        <p className="text-primary font-bold">{wager.oddsAway.toFixed(2)}</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Suma (€)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
                      placeholder="10.00"
                    />
                  </div>

                  <button
                    onClick={() => handlePlaceBet(wager.id)}
                    disabled={loading}
                    className="w-full bg-success text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Siunčiama..." : "PATVIRTINTI STATYMĄ"}
                  </button>
                </div>

                {wager.bets.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold mb-2 text-sm text-text-muted">Paskutiniai statymai</h4>
                    <div className="space-y-2">
                      {wager.bets.slice(-5).reverse().map((bet) => (
                        <div key={bet.id} className="flex items-center justify-between text-sm bg-background rounded p-2">
                          <span>{bet.visitorName}</span>
                          <span className="text-text-muted">{teamMap.get(bet.teamId)}</span>
                          <span className="text-primary font-bold">€{bet.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

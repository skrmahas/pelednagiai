"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Match, Team } from "@/lib/data";
import type { Wager } from "@/lib/wagers";
import type { Player } from "@/lib/players";

interface PlayerStatInput {
  playerId: string;
  /** For substitutes: which team they are playing for in this match. */
  playsForTeamId?: string;
  /** Whether this player actually played in the match. */
  didPlay: boolean;
  /** For substitutes: player they replaced (so that player's stats row is skipped). */
  replacesPlayerId?: string | null;
  points: string;
  rebounds: string;
  assists: string;
  steals: string;
  blocks: string;
  turnovers: string;
  personalFouls: string;
  twoFgMade: string;
  twoFgAttempts: string;
  fgMade: string;
  fgAttempts: string;
  threePtMade: string;
  threePtAttempts: string;
  ftMade: string;
  ftAttempts: string;
}

interface Props {
  matches: Match[];
  teams: Team[];
  wagers: Wager[];
  players: Player[];
}

export default function AdminDashboard({ matches: initialMatches, teams, wagers: initialWagers, players }: Props) {
  const [matches, setMatches] = useState(initialMatches);
  const [wagers, setWagers] = useState(initialWagers);
  const [activeTab, setActiveTab] = useState<'matches' | 'wagers' | 'stats' | 'bets'>('matches');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHomeTeam, setNewHomeTeam] = useState("");
  const [newAwayTeam, setNewAwayTeam] = useState("");
  const [newRound, setNewRound] = useState("1");
  const [showWagerForm, setShowWagerForm] = useState(false);
  const [wagerMatchId, setWagerMatchId] = useState("");
  const [wagerOddsHome, setWagerOddsHome] = useState("1.50");
  const [wagerOddsAway, setWagerOddsAway] = useState("1.50");
  const [wagerDescription, setWagerDescription] = useState("");
  
  const [statsMatchId, setStatsMatchId] = useState("");
  const [statsPlayerId, setStatsPlayerId] = useState("");
  const [statPoints, setStatPoints] = useState("0");
  const [statRebounds, setStatRebounds] = useState("0");
  const [statAssists, setStatAssists] = useState("0");
  const [statSteals, setStatSteals] = useState("0");
  const [statBlocks, setStatBlocks] = useState("0");
  const [statTurnovers, setStatTurnovers] = useState("0");
  const [statPf, setStatPf] = useState("0");
  const [statTwoFgMade, setStatTwoFgMade] = useState("0");
  const [statTwoFgAttempts, setStatTwoFgAttempts] = useState("0");
  const [statFgMade, setStatFgMade] = useState("0");
  const [statFgAttempts, setStatFgAttempts] = useState("0");
  const [stat3ptMade, setStat3ptMade] = useState("0");
  const [stat3ptAttempts, setStat3ptAttempts] = useState("0");
  const [statFtMade, setStatFtMade] = useState("0");
  const [statFtAttempts, setStatFtAttempts] = useState("0");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const [statsPopup, setStatsPopup] = useState<{
    match: Match;
    playerStats: PlayerStatInput[];
  } | null>(null);
  const [savingStats, setSavingStats] = useState(false);

  const [manageStatsMatchId, setManageStatsMatchId] = useState("");
  const [manageStatsRows, setManageStatsRows] = useState<Array<{ playerId: string; matchId: string; game: Record<string, number> }>>([]);
  const [loadingManageStats, setLoadingManageStats] = useState(false);
  const [editingStatRow, setEditingStatRow] = useState<{ playerId: string; matchId: string } | null>(null);
  const [editStatForm, setEditStatForm] = useState<Record<string, number>>({});

  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  /** Mantas Briuderis is only available as substitute for Pride police. */
  function isSubstituteAvailableForMatch(p: Player, match: Match): boolean {
    if (p.category !== "substitute") return true;
    const homeName = teamMap.get(match.homeTeamId);
    const awayName = teamMap.get(match.awayTeamId);
    const hasPridePolice = homeName === "Pride police" || awayName === "Pride police";
    if (p.name === "Mantas Briuderis" || p.id === "mantas-briuderis") return hasPridePolice;
    return true;
  }

  function initializePlayerStats(match: Match): PlayerStatInput[] {
    const matchPlayers = players.filter(
      (p) =>
        p.teamId === match.homeTeamId ||
        p.teamId === match.awayTeamId ||
        (p.category === "substitute" && isSubstituteAvailableForMatch(p, match))
    );
    return matchPlayers.map((p) => ({
      playerId: p.id,
      playsForTeamId: p.category === "substitute" ? match.homeTeamId : undefined,
      didPlay: p.category === "substitute" ? false : true,
      replacesPlayerId: null,
      points: "0",
      rebounds: "0",
      assists: "0",
      steals: "0",
      blocks: "0",
      turnovers: "0",
      personalFouls: "0",
      twoFgMade: "0",
      twoFgAttempts: "0",
      fgMade: "0",
      fgAttempts: "0",
      threePtMade: "0",
      threePtAttempts: "0",
      ftMade: "0",
      ftAttempts: "0",
    }));
  }

  function updatePlayerStat(playerId: string, field: keyof PlayerStatInput, value: string) {
    if (!statsPopup) return;
    setStatsPopup({
      ...statsPopup,
      playerStats: statsPopup.playerStats.map((ps) =>
        ps.playerId === playerId ? { ...ps, [field]: value } : ps
      ),
    });
  }

  function setPlaysForTeam(playerId: string, teamId: string) {
    if (!statsPopup) return;
    setStatsPopup({
      ...statsPopup,
      playerStats: statsPopup.playerStats.map((ps) =>
        ps.playerId === playerId ? { ...ps, playsForTeamId: teamId } : ps
      ),
    });
  }

  function setDidPlay(playerId: string, didPlay: boolean) {
    if (!statsPopup) return;
    setStatsPopup({
      ...statsPopup,
      playerStats: statsPopup.playerStats.map((ps) =>
        ps.playerId === playerId ? { ...ps, didPlay } : ps
      ),
    });
  }

  function setReplacesPlayer(playerId: string, replacesPlayerId: string | null) {
    if (!statsPopup) return;
    setStatsPopup({
      ...statsPopup,
      playerStats: statsPopup.playerStats.map((ps) =>
        ps.playerId === playerId ? { ...ps, replacesPlayerId } : ps
      ),
    });
  }

  async function saveAllStats() {
    if (!statsPopup) return;
    setSavingStats(true);
    setError("");

    try {
      // If a substitute played instead of someone, we skip saving stats for the replaced player
      const replacedIds = new Set(
        statsPopup.playerStats
          .filter((ps) => ps.didPlay && ps.replacesPlayerId)
          .map((ps) => ps.replacesPlayerId as string)
      );

      for (const ps of statsPopup.playerStats) {
        // Skip players explicitly marked as not having played
        if (!ps.didPlay) continue;
        // Skip players who were substituted out
        if (replacedIds.has(ps.playerId)) continue;

        await fetch(`/api/players/${ps.playerId}/stats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId: statsPopup.match.id,
            points: parseInt(ps.points) || 0,
            rebounds: parseInt(ps.rebounds) || 0,
            assists: parseInt(ps.assists) || 0,
            steals: parseInt(ps.steals) || 0,
            blocks: parseInt(ps.blocks) || 0,
            turnovers: parseInt(ps.turnovers) || 0,
              personalFouls: parseInt(ps.personalFouls) || 0,
              twoFgMade: parseInt(ps.twoFgMade) || 0,
              twoFgAttempts: parseInt(ps.twoFgAttempts) || 0,
            fgMade: parseInt(ps.fgMade) || 0,
            fgAttempts: parseInt(ps.fgAttempts) || 0,
            threePtMade: parseInt(ps.threePtMade) || 0,
            threePtAttempts: parseInt(ps.threePtAttempts) || 0,
            ftMade: parseInt(ps.ftMade) || 0,
            ftAttempts: parseInt(ps.ftAttempts) || 0,
          }),
        });
      }
      setSuccess("Statistika išsaugota!");
      setStatsPopup(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Klaida saugant statistiką");
    } finally {
      setSavingStats(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleUpdateScore(matchId: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
          status: "played",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Klaida");
        return;
      }

      const updated = await res.json();
      setMatches(matches.map((m) => (m.id === matchId ? updated : m)));
      setEditingMatch(null);
      setHomeScore("");
      setAwayScore("");
      
      setStatsPopup({
        match: updated,
        playerStats: initializePlayerStats(updated),
      });
    } catch {
      setError("Klaida");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMatch() {
    if (!newHomeTeam || !newAwayTeam) {
      setError("Pasirinkite abi komandas");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeamId: newHomeTeam,
          awayTeamId: newAwayTeam,
          round: parseInt(newRound),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Klaida");
        return;
      }

      const newMatch = await res.json();
      setMatches([...matches, newMatch]);
      setShowAddForm(false);
      setNewHomeTeam("");
      setNewAwayTeam("");
      setNewRound("1");
    } catch {
      setError("Klaida");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMatch(matchId: string) {
    if (!confirm("Ištrinti rungtynes?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`, { method: "DELETE" });
      if (res.ok) {
        setMatches(matches.filter((m) => m.id !== matchId));
      }
    } catch {
      setError("Klaida trinant");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWager() {
    if (!wagerMatchId) {
      setError("Pasirinkite rungtynes");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/wagers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: wagerMatchId,
          oddsHome: parseFloat(wagerOddsHome),
          oddsAway: parseFloat(wagerOddsAway),
          description: wagerDescription || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Klaida");
        return;
      }

      const newWager = await res.json();
      setWagers([...wagers, newWager]);
      setShowWagerForm(false);
      setWagerMatchId("");
      setWagerOddsHome("1.50");
      setWagerOddsAway("1.50");
      setWagerDescription("");
    } catch {
      setError("Klaida");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteWager(wagerId: string) {
    if (!confirm("Ištrinti lažybas?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/wagers/${wagerId}`, { method: "DELETE" });
      if (res.ok) {
        setWagers(wagers.filter((w) => w.id !== wagerId));
      }
    } catch {
      setError("Klaida trinant");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStats() {
    if (!statsMatchId || !statsPlayerId) {
      setError("Pasirinkite rungtynes ir žaidėją");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/players/${statsPlayerId}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: statsMatchId,
          points: parseInt(statPoints) || 0,
          rebounds: parseInt(statRebounds) || 0,
          assists: parseInt(statAssists) || 0,
          steals: parseInt(statSteals) || 0,
          blocks: parseInt(statBlocks) || 0,
          turnovers: parseInt(statTurnovers) || 0,
              personalFouls: parseInt(statPf) || 0,
              twoFgMade: parseInt(statTwoFgMade) || 0,
              twoFgAttempts: parseInt(statTwoFgAttempts) || 0,
          fgMade: parseInt(statFgMade) || 0,
          fgAttempts: parseInt(statFgAttempts) || 0,
          threePtMade: parseInt(stat3ptMade) || 0,
          threePtAttempts: parseInt(stat3ptAttempts) || 0,
          ftMade: parseInt(statFtMade) || 0,
          ftAttempts: parseInt(statFtAttempts) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Klaida");
        return;
      }

      setSuccess("Statistika įrašyta!");
      setStatsPlayerId("");
      setStatPoints("0");
      setStatRebounds("0");
      setStatAssists("0");
      setStatSteals("0");
      setStatBlocks("0");
      setStatTurnovers("0");
      setStatPf("0");
      setStatTwoFgMade("0");
      setStatTwoFgAttempts("0");
      setStatFgMade("0");
      setStatFgAttempts("0");
      setStat3ptMade("0");
      setStat3ptAttempts("0");
      setStatFtMade("0");
      setStatFtAttempts("0");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Klaida");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(match: Match) {
    setEditingMatch(match.id);
    setHomeScore(match.homeScore?.toString() || "");
    setAwayScore(match.awayScore?.toString() || "");
  }

  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
  const scheduledMatches = matches.filter(m => m.status === 'scheduled');
  const playedMatches = matches.filter(m => m.status === 'played');
  const existingWagerMatchIds = new Set(wagers.map(w => w.matchId));

  const selectedMatch = matches.find((m) => m.id === statsMatchId);
  const matchPlayers = selectedMatch
    ? players.filter(
        (p) =>
          p.teamId === selectedMatch.homeTeamId ||
          p.teamId === selectedMatch.awayTeamId ||
          (p.category === "substitute" && isSubstituteAvailableForMatch(p, selectedMatch))
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-primary">ADMIN</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-border rounded hover:bg-card-bg-hover transition-colors"
        >
          Atsijungti
        </button>
      </div>

      {error && (
        <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/20 border border-success text-success px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 rounded font-bold transition-colors ${
            activeTab === 'matches' ? 'bg-primary text-black' : 'bg-card-bg text-text-muted hover:text-white'
          }`}
        >
          Rungtynės
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded font-bold transition-colors ${
            activeTab === 'stats' ? 'bg-primary text-black' : 'bg-card-bg text-text-muted hover:text-white'
          }`}
        >
          Statistika
        </button>
        <button
          onClick={() => setActiveTab('wagers')}
          className={`px-4 py-2 rounded font-bold transition-colors ${
            activeTab === 'wagers' ? 'bg-primary text-black' : 'bg-card-bg text-text-muted hover:text-white'
          }`}
        >
          Lažybos ({wagers.length})
        </button>
        <button
          onClick={() => setActiveTab('bets')}
          className={`px-4 py-2 rounded font-bold transition-colors ${
            activeTab === 'bets' ? 'bg-primary text-black' : 'bg-card-bg text-text-muted hover:text-white'
          }`}
        >
          Statymai ({wagers.reduce((sum, w) => sum + w.bets.length, 0)})
        </button>
      </div>

      {activeTab === 'matches' && (
        <div className="bg-card-bg rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Rungtynės ({matches.length})</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-primary text-black rounded font-bold hover:bg-primary-dark transition-colors text-sm"
            >
              {showAddForm ? "Atšaukti" : "+ Naujos"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 bg-background rounded-lg border border-border space-y-4">
              <h3 className="font-bold">Pridėti rungtynes</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Namų</label>
                  <select
                    value={newHomeTeam}
                    onChange={(e) => setNewHomeTeam(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                  >
                    <option value="">—</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Svečiai</label>
                  <select
                    value={newAwayTeam}
                    onChange={(e) => setNewAwayTeam(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                  >
                    <option value="">—</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Turas</label>
                  <input
                    type="number"
                    min="1"
                    value={newRound}
                    onChange={(e) => setNewRound(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                  />
                </div>
              </div>
              <button
                onClick={handleAddMatch}
                disabled={loading}
                className="px-4 py-2 bg-success text-white rounded font-bold hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "..." : "Pridėti"}
              </button>
            </div>
          )}

          <div className="space-y-4">
            {rounds.map((round) => (
              <div key={round}>
                <h3 className="font-bold text-text-muted mb-2 text-sm">{round}. TURAS</h3>
                <div className="space-y-2">
                  {matchesByRound[round].map((match) => {
                    const isEditing = editingMatch === match.id;
                    return (
                      <div
                        key={match.id}
                        className="flex items-center gap-2 p-3 bg-background rounded border border-border"
                      >
                        <div className="flex-1 text-right text-sm font-medium">
                          {teamMap.get(match.homeTeamId)}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={homeScore}
                              onChange={(e) => setHomeScore(e.target.value)}
                              className="w-14 px-2 py-1 border border-border rounded text-center bg-card-bg"
                            />
                            <span>:</span>
                            <input
                              type="number"
                              min="0"
                              value={awayScore}
                              onChange={(e) => setAwayScore(e.target.value)}
                              className="w-14 px-2 py-1 border border-border rounded text-center bg-card-bg"
                            />
                            <button
                              onClick={() => handleUpdateScore(match.id)}
                              disabled={loading}
                              className="px-2 py-1 bg-success text-white rounded text-xs font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingMatch(null)}
                              className="px-2 py-1 bg-border text-text-muted rounded text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {match.status === "played" ? (
                              <span className="px-3 py-1 bg-primary/20 rounded font-bold text-primary">
                                {match.homeScore} : {match.awayScore}
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-border rounded text-text-muted text-sm">
                                vs
                              </span>
                            )}
                            <button
                              onClick={() => startEdit(match)}
                              className="px-2 py-1 bg-primary text-black rounded text-xs font-bold"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteMatch(match.id)}
                              className="px-2 py-1 bg-danger text-white rounded text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        <div className="flex-1 text-left text-sm font-medium">
                          {teamMap.get(match.awayTeamId)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-card-bg rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Žaidėjų statistika</h2>
          
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-text-muted mb-1">Rungtynės</label>
                <select
                  value={statsMatchId}
                  onChange={(e) => { setStatsMatchId(e.target.value); setStatsPlayerId(""); }}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                >
                  <option value="">Pasirinkite rungtynes</option>
                  {playedMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.id}: {teamMap.get(m.homeTeamId)} {m.homeScore}:{m.awayScore} {teamMap.get(m.awayTeamId)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Žaidėjas</label>
                <select
                  value={statsPlayerId}
                  onChange={(e) => setStatsPlayerId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                  disabled={!statsMatchId}
                >
                  <option value="">Pasirinkite žaidėją</option>
                  {matchPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category === "substitute" ? "Pakaitinis" : teamMap.get(p.teamId ?? "")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {statsPlayerId && (
              <div className="p-4 bg-background rounded-lg border border-border space-y-4">
                <h3 className="font-bold">Įvesti statistiką</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Taškai</label>
                    <input
                      type="number"
                      min="0"
                      value={statPoints}
                      onChange={(e) => setStatPoints(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Atšokę</label>
                    <input
                      type="number"
                      min="0"
                      value={statRebounds}
                      onChange={(e) => setStatRebounds(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Rez. perd.</label>
                    <input
                      type="number"
                      min="0"
                      value={statAssists}
                      onChange={(e) => setStatAssists(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Perimimai</label>
                    <input
                      type="number"
                      min="0"
                      value={statSteals}
                      onChange={(e) => setStatSteals(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Blokai</label>
                    <input
                      type="number"
                      min="0"
                      value={statBlocks}
                      onChange={(e) => setStatBlocks(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Klaidos</label>
                    <input
                      type="number"
                      min="0"
                      value={statTurnovers}
                      onChange={(e) => setStatTurnovers(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Pražangos (PF)</label>
                    <input
                      type="number"
                      min="0"
                      value={statPf}
                      onChange={(e) => setStatPf(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">2FG pataikė</label>
                    <input
                      type="number"
                      min="0"
                      value={statTwoFgMade}
                      onChange={(e) => setStatTwoFgMade(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">2FG metė</label>
                    <input
                      type="number"
                      min="0"
                      value={statTwoFgAttempts}
                      onChange={(e) => setStatTwoFgAttempts(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">FG pataikė</label>
                    <input
                      type="number"
                      min="0"
                      value={statFgMade}
                      onChange={(e) => setStatFgMade(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">FG metė</label>
                    <input
                      type="number"
                      min="0"
                      value={statFgAttempts}
                      onChange={(e) => setStatFgAttempts(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">3PT pataikė</label>
                    <input
                      type="number"
                      min="0"
                      value={stat3ptMade}
                      onChange={(e) => setStat3ptMade(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">3PT metė</label>
                    <input
                      type="number"
                      min="0"
                      value={stat3ptAttempts}
                      onChange={(e) => setStat3ptAttempts(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">FT pataikė</label>
                    <input
                      type="number"
                      min="0"
                      value={statFtMade}
                      onChange={(e) => setStatFtMade(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">FT metė</label>
                    <input
                      type="number"
                      min="0"
                      value={statFtAttempts}
                      onChange={(e) => setStatFtAttempts(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-card-bg text-center"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddStats}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-primary text-black rounded font-bold hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? "..." : "IŠSAUGOTI STATISTIKĄ"}
                </button>
              </div>
            )}

            <div className="mt-8 p-4 bg-background rounded-lg border border-border">
              <h3 className="font-bold mb-3">Taisyti arba trinti rungtynių statistiką</h3>
              <p className="text-sm text-text-muted mb-3">
                Pasirinkite rungtynes ir įkelkite įrašytą statistiką, tada redaguokite arba ištrinkite žaidėjo įrašą (kad nebūtų dublikatų).
              </p>
              <div className="flex flex-wrap gap-2 items-end mb-4">
                <div className="min-w-[200px]">
                  <label className="block text-xs text-text-muted mb-1">Rungtynės</label>
                  <select
                    value={manageStatsMatchId}
                    onChange={(e) => { setManageStatsMatchId(e.target.value); setManageStatsRows([]); setEditingStatRow(null); }}
                    className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                  >
                    <option value="">—</option>
                    {playedMatches.map((m) => (
                      <option key={m.id} value={m.id}>
                        #{m.id}: {teamMap.get(m.homeTeamId)} {m.homeScore}:{m.awayScore} {teamMap.get(m.awayTeamId)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!manageStatsMatchId) return;
                    setLoadingManageStats(true);
                    try {
                      const res = await fetch(`/api/matches/${manageStatsMatchId}/stats`);
                      if (res.ok) {
                        const data = await res.json();
                        setManageStatsRows(data);
                        setEditingStatRow(null);
                      }
                    } finally {
                      setLoadingManageStats(false);
                    }
                  }}
                  disabled={!manageStatsMatchId || loadingManageStats}
                  className="px-4 py-2 bg-primary text-black rounded font-bold hover:bg-primary-dark disabled:opacity-50"
                >
                  {loadingManageStats ? "..." : "Įkelti"}
                </button>
              </div>
              {manageStatsRows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#252525]">
                      <tr>
                        <th className="px-2 py-2 text-left text-text-muted">Žaidėjas</th>
                        <th className="px-2 py-2 text-center text-text-muted">TŠK</th>
                        <th className="px-2 py-2 text-center text-text-muted">ATŠ</th>
                        <th className="px-2 py-2 text-center text-text-muted">REZ</th>
                        <th className="px-2 py-2 text-center text-text-muted">PER</th>
                        <th className="px-2 py-2 text-center text-text-muted">BLK</th>
                        <th className="px-2 py-2 text-center text-text-muted">KLD</th>
                        <th className="px-2 py-2 text-right text-text-muted">Veiksmai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {manageStatsRows.map((row) => {
                        const player = players.find((p) => p.id === row.playerId);
                        const isEditing = editingStatRow?.playerId === row.playerId && editingStatRow?.matchId === row.matchId;
                        return (
                          <tr key={`${row.playerId}-${row.matchId}`} className="hover:bg-card-bg-hover">
                            <td className="px-2 py-2 font-medium">{player?.name ?? row.playerId}</td>
                            {!isEditing ? (
                              <>
                                <td className="px-2 py-2 text-center">{row.game.points}</td>
                                <td className="px-2 py-2 text-center">{row.game.rebounds}</td>
                                <td className="px-2 py-2 text-center">{row.game.assists}</td>
                                <td className="px-2 py-2 text-center">{row.game.steals}</td>
                                <td className="px-2 py-2 text-center">{row.game.blocks}</td>
                                <td className="px-2 py-2 text-center">{row.game.turnovers}</td>
                                <td className="px-2 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStatRow({ playerId: row.playerId, matchId: row.matchId });
                                      setEditStatForm({ ...row.game });
                                    }}
                                    className="px-2 py-1 mr-1 bg-primary text-black rounded text-xs font-bold"
                                  >
                                    Redaguoti
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!confirm(`Ištrinti ${player?.name ?? row.playerId} statistiką šioms rungtynėms?`)) return;
                                      const res = await fetch(`/api/players/${row.playerId}/stats?matchId=${encodeURIComponent(row.matchId)}`, { method: "DELETE" });
                                      if (res.ok) setManageStatsRows((prev) => prev.filter((r) => r.playerId !== row.playerId || r.matchId !== row.matchId));
                                    }}
                                    className="px-2 py-1 bg-danger text-white rounded text-xs font-bold"
                                  >
                                    Trinti
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td colSpan={6} className="px-2 py-2">
                                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    <input type="number" min={0} value={editStatForm.points ?? 0} onChange={(e) => setEditStatForm((f) => ({ ...f, points: parseInt(e.target.value) || 0 }))} className="px-2 py-1 border rounded bg-card-bg text-center" placeholder="TŠK" />
                                    <input type="number" min={0} value={editStatForm.rebounds ?? 0} onChange={(e) => setEditStatForm((f) => ({ ...f, rebounds: parseInt(e.target.value) || 0 }))} className="px-2 py-1 border rounded bg-card-bg text-center" placeholder="ATŠ" />
                                    <input type="number" min={0} value={editStatForm.assists ?? 0} onChange={(e) => setEditStatForm((f) => ({ ...f, assists: parseInt(e.target.value) || 0 }))} className="px-2 py-1 border rounded bg-card-bg text-center" placeholder="REZ" />
                                    <input type="number" min={0} value={editStatForm.steals ?? 0} onChange={(e) => setEditStatForm((f) => ({ ...f, steals: parseInt(e.target.value) || 0 }))} className="px-2 py-1 border rounded bg-card-bg text-center" placeholder="PER" />
                                    <input type="number" min={0} value={editStatForm.blocks ?? 0} onChange={(e) => setEditStatForm((f) => ({ ...f, blocks: parseInt(e.target.value) || 0 }))} className="px-2 py-1 border rounded bg-card-bg text-center" placeholder="BLK" />
                                    <input type="number" min={0} value={editStatForm.turnovers ?? 0} onChange={(e) => setEditStatForm((f) => ({ ...f, turnovers: parseInt(e.target.value) || 0 }))} className="px-2 py-1 border rounded bg-card-bg text-center" placeholder="KLD" />
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const res = await fetch(`/api/players/${row.playerId}/stats`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ matchId: row.matchId, ...editStatForm }),
                                      });
                                      if (res.ok) {
                                        setManageStatsRows((prev) => prev.map((r) => r.playerId === row.playerId && r.matchId === row.matchId ? { ...r, game: editStatForm } : r));
                                        setEditingStatRow(null);
                                      }
                                    }}
                                    className="px-2 py-1 mr-1 bg-success text-white rounded text-xs font-bold"
                                  >
                                    Išsaugoti
                                  </button>
                                  <button type="button" onClick={() => setEditingStatRow(null)} className="px-2 py-1 bg-border text-text-muted rounded text-xs">
                                    Atšaukti
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wagers' && (
        <div className="bg-card-bg rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Lažybos</h2>
            <button
              onClick={() => setShowWagerForm(!showWagerForm)}
              className="px-4 py-2 bg-primary text-black rounded font-bold hover:bg-primary-dark transition-colors text-sm"
            >
              {showWagerForm ? "Atšaukti" : "+ Naujos lažybos"}
            </button>
          </div>

          {showWagerForm && (
            <div className="mb-6 p-4 bg-background rounded-lg border border-border space-y-4">
              <h3 className="font-bold">Sukurti lažybas</h3>
              <div>
                <label className="block text-sm text-text-muted mb-1">Rungtynės</label>
                <select
                  value={wagerMatchId}
                  onChange={(e) => setWagerMatchId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                >
                  <option value="">—</option>
                  {scheduledMatches
                    .filter(m => !existingWagerMatchIds.has(m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {teamMap.get(m.homeTeamId)} vs {teamMap.get(m.awayTeamId)} (Turas {m.round})
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Koef. namų</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={wagerOddsHome}
                    onChange={(e) => setWagerOddsHome(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Koef. svečių</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={wagerOddsAway}
                    onChange={(e) => setWagerOddsAway(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Aprašymas (nebūtinas)</label>
                <input
                  type="text"
                  value={wagerDescription}
                  onChange={(e) => setWagerDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-card-bg"
                  placeholder="pvz., Pirmos rungtynės!"
                />
              </div>
              <button
                onClick={handleAddWager}
                disabled={loading}
                className="px-4 py-2 bg-success text-white rounded font-bold hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "..." : "Sukurti"}
              </button>
            </div>
          )}

          {wagers.length === 0 ? (
            <p className="text-text-muted text-center py-8">Lažybų nėra</p>
          ) : (
            <div className="space-y-3">
              {wagers.map((wager) => {
                const match = matches.find(m => m.id === wager.matchId);
                if (!match) return null;
                return (
                  <div key={wager.id} className="p-4 bg-background rounded border border-border">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">
                          {teamMap.get(match.homeTeamId)} vs {teamMap.get(match.awayTeamId)}
                        </p>
                        <p className="text-sm text-text-muted">
                          Koef: {wager.oddsHome} / {wager.oddsAway} | Statymai: {wager.bets.length}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteWager(wager.id)}
                        className="px-3 py-1 bg-danger text-white rounded text-sm font-bold"
                      >
                        Trinti
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bets' && (
        <div className="bg-card-bg rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Visi statymai</h2>
          
          {(() => {
            const allBets = wagers.flatMap(wager => {
              const match = matches.find(m => m.id === wager.matchId);
              return wager.bets.map(bet => ({
                ...bet,
                wagerId: wager.id,
                matchId: wager.matchId,
                match,
                homeName: teamMap.get(match?.homeTeamId || '') || '?',
                awayName: teamMap.get(match?.awayTeamId || '') || '?',
                betTeamName: teamMap.get(bet.teamId) || '?',
                odds: bet.teamId === match?.homeTeamId ? wager.oddsHome : wager.oddsAway,
              }));
            }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            if (allBets.length === 0) {
              return <p className="text-text-muted text-center py-8">Statymų nėra</p>;
            }

            const totalAmount = allBets.reduce((sum, b) => sum + b.amount, 0);

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-background rounded p-3 text-center border border-border">
                    <p className="text-2xl font-black text-primary">{allBets.length}</p>
                    <p className="text-xs text-text-muted">Iš viso statymų</p>
                  </div>
                  <div className="bg-background rounded p-3 text-center border border-border">
                    <p className="text-2xl font-black">€{totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-text-muted">Bendra suma</p>
                  </div>
                  <div className="bg-background rounded p-3 text-center border border-border">
                    <p className="text-2xl font-black text-success">
                      {allBets.filter(b => {
                        if (b.match?.status !== 'played') return false;
                        return (b.match.homeScore! > b.match.awayScore! && b.teamId === b.match.homeTeamId) ||
                               (b.match.awayScore! > b.match.homeScore! && b.teamId === b.match.awayTeamId);
                      }).length}
                    </p>
                    <p className="text-xs text-text-muted">Laimėję</p>
                  </div>
                  <div className="bg-background rounded p-3 text-center border border-border">
                    <p className="text-2xl font-black text-danger">
                      {allBets.filter(b => {
                        if (b.match?.status !== 'played') return false;
                        return !((b.match.homeScore! > b.match.awayScore! && b.teamId === b.match.homeTeamId) ||
                               (b.match.awayScore! > b.match.homeScore! && b.teamId === b.match.awayTeamId));
                      }).length}
                    </p>
                    <p className="text-xs text-text-muted">Pralaimėję</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#252525]">
                      <tr>
                        <th className="px-3 py-2 text-left text-text-muted">Data</th>
                        <th className="px-3 py-2 text-left text-text-muted">Vardas</th>
                        <th className="px-3 py-2 text-left text-text-muted">Rungtynės</th>
                        <th className="px-3 py-2 text-left text-text-muted">Statė už</th>
                        <th className="px-3 py-2 text-center text-text-muted">Koef.</th>
                        <th className="px-3 py-2 text-right text-text-muted">Suma</th>
                        <th className="px-3 py-2 text-center text-text-muted">Būsena</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allBets.map((bet, idx) => {
                        const isPlayed = bet.match?.status === 'played';
                        let status: 'pending' | 'won' | 'lost' = 'pending';
                        if (isPlayed && bet.match) {
                          const won = (bet.match.homeScore! > bet.match.awayScore! && bet.teamId === bet.match.homeTeamId) ||
                                      (bet.match.awayScore! > bet.match.homeScore! && bet.teamId === bet.match.awayTeamId);
                          status = won ? 'won' : 'lost';
                        }
                        const date = new Date(bet.timestamp);
                        
                        return (
                          <tr key={`${bet.wagerId}-${bet.id}-${idx}`} className="hover:bg-card-bg-hover">
                            <td className="px-3 py-2 text-text-muted text-xs">
                              {date.toLocaleDateString('lt-LT')} {date.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-3 py-2 font-semibold">{bet.visitorName}</td>
                            <td className="px-3 py-2 text-text-muted">
                              {bet.homeName} vs {bet.awayName}
                              {isPlayed && <span className="ml-1 text-primary">({bet.match?.homeScore}:{bet.match?.awayScore})</span>}
                            </td>
                            <td className="px-3 py-2">{bet.betTeamName}</td>
                            <td className="px-3 py-2 text-center text-primary font-bold">{bet.odds.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-bold">€{bet.amount.toFixed(2)}</td>
                            <td className="px-3 py-2 text-center">
                              {status === 'won' && (
                                <span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold">
                                  +€{(bet.amount * bet.odds - bet.amount).toFixed(2)}
                                </span>
                              )}
                              {status === 'lost' && (
                                <span className="px-2 py-1 bg-danger/20 text-danger rounded text-xs font-bold">
                                  -€{bet.amount.toFixed(2)}
                                </span>
                              )}
                              {status === 'pending' && (
                                <span className="px-2 py-1 bg-border text-text-muted rounded text-xs">
                                  Laukia
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {statsPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card-bg border-b border-border p-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Įvesti žaidėjų statistiką</h2>
                <button
                  onClick={() => setStatsPopup(null)}
                  className="p-2 hover:bg-border rounded transition-colors text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 py-3 bg-primary/10 rounded-lg">
                <span className="text-lg font-bold">{teamMap.get(statsPopup.match.homeTeamId)}</span>
                <span className="text-3xl font-black text-primary">
                  {statsPopup.match.homeScore} : {statsPopup.match.awayScore}
                </span>
                <span className="text-lg font-bold">{teamMap.get(statsPopup.match.awayTeamId)}</span>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {[statsPopup.match.homeTeamId, statsPopup.match.awayTeamId].map((teamId) => {
                const teamPlayers = statsPopup.playerStats.filter((ps) => {
                  const player = players.find((p) => p.id === ps.playerId);
                  const effectiveTeamId = ps.playsForTeamId ?? player?.teamId;
                  return effectiveTeamId === teamId;
                });
                const teamRoster = players.filter(
                  (p) => p.teamId === teamId && p.category !== "substitute"
                );

                return (
                  <div key={teamId} className="space-y-3">
                    <h3 className="font-bold text-primary border-b border-border pb-2">
                      {teamMap.get(teamId)}
                    </h3>
                    {teamPlayers.map((ps) => {
                      const player = players.find((p) => p.id === ps.playerId);
                      if (!player) return null;

                      return (
                        <div key={ps.playerId} className="bg-background rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="font-bold">{player.name}</h4>
                              <label className="flex items-center gap-1 text-xs text-text-muted">
                                <input
                                  type="checkbox"
                                  checked={ps.didPlay}
                                  onChange={(e) => setDidPlay(ps.playerId, e.target.checked)}
                                />
                                <span>Žaidė</span>
                              </label>
                            </div>
                            {player.category === "substitute" && ps.didPlay && (
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-text-muted">Žaidė už:</span>
                                  <select
                                    value={ps.playsForTeamId ?? statsPopup.match.homeTeamId}
                                    onChange={(e) => setPlaysForTeam(ps.playerId, e.target.value)}
                                    className="px-2 py-1 border border-border rounded bg-card-bg text-sm"
                                  >
                                    <option value={statsPopup.match.homeTeamId}>
                                      {teamMap.get(statsPopup.match.homeTeamId)}
                                    </option>
                                    <option value={statsPopup.match.awayTeamId}>
                                      {teamMap.get(statsPopup.match.awayTeamId)}
                                    </option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-text-muted">Vietoj:</span>
                                  <select
                                    value={ps.replacesPlayerId ?? ""}
                                    onChange={(e) =>
                                      setReplacesPlayer(
                                        ps.playerId,
                                        e.target.value || null
                                      )
                                    }
                                    className="px-2 py-1 border border-border rounded bg-card-bg text-sm"
                                  >
                                    <option value="">—</option>
                                    {teamRoster.map((tp) => (
                                      <option key={tp.id} value={tp.id}>
                                        {tp.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            <div>
                              <label className="block text-xs text-text-muted mb-1">PTS</label>
                              <input
                                type="number"
                                min="0"
                                value={ps.points}
                                onChange={(e) => updatePlayerStat(ps.playerId, 'points', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded bg-card-bg text-center text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">REB</label>
                              <input
                                type="number"
                                min="0"
                                value={ps.rebounds}
                                onChange={(e) => updatePlayerStat(ps.playerId, 'rebounds', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded bg-card-bg text-center text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">AST</label>
                              <input
                                type="number"
                                min="0"
                                value={ps.assists}
                                onChange={(e) => updatePlayerStat(ps.playerId, 'assists', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded bg-card-bg text-center text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">STL</label>
                              <input
                                type="number"
                                min="0"
                                value={ps.steals}
                                onChange={(e) => updatePlayerStat(ps.playerId, 'steals', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded bg-card-bg text-center text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">BLK</label>
                              <input
                                type="number"
                                min="0"
                                value={ps.blocks}
                                onChange={(e) => updatePlayerStat(ps.playerId, 'blocks', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded bg-card-bg text-center text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">TO</label>
                              <input
                                type="number"
                                min="0"
                                value={ps.turnovers}
                                onChange={(e) => updatePlayerStat(ps.playerId, 'turnovers', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded bg-card-bg text-center text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">FG</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={ps.fgMade}
                                  onChange={(e) => updatePlayerStat(ps.playerId, 'fgMade', e.target.value)}
                                  className="w-full px-1 py-1 border border-border rounded bg-card-bg text-center text-sm"
                                  placeholder="M"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  value={ps.fgAttempts}
                                  onChange={(e) => updatePlayerStat(ps.playerId, 'fgAttempts', e.target.value)}
                                  className="w-full px-1 py-1 border border-border rounded bg-card-bg text-center text-sm"
                                  placeholder="A"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">3PT</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={ps.threePtMade}
                                  onChange={(e) => updatePlayerStat(ps.playerId, 'threePtMade', e.target.value)}
                                  className="w-full px-1 py-1 border border-border rounded bg-card-bg text-center text-sm"
                                  placeholder="M"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  value={ps.threePtAttempts}
                                  onChange={(e) => updatePlayerStat(ps.playerId, 'threePtAttempts', e.target.value)}
                                  className="w-full px-1 py-1 border border-border rounded bg-card-bg text-center text-sm"
                                  placeholder="A"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">FT</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={ps.ftMade}
                                  onChange={(e) => updatePlayerStat(ps.playerId, 'ftMade', e.target.value)}
                                  className="w-full px-1 py-1 border border-border rounded bg-card-bg text-center text-sm"
                                  placeholder="M"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  value={ps.ftAttempts}
                                  onChange={(e) => updatePlayerStat(ps.playerId, 'ftAttempts', e.target.value)}
                                  className="w-full px-1 py-1 border border-border rounded bg-card-bg text-center text-sm"
                                  placeholder="A"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 bg-card-bg border-t border-border p-4 flex gap-3">
              <button
                onClick={() => setStatsPopup(null)}
                className="flex-1 px-4 py-3 bg-border text-text-muted rounded font-bold hover:bg-card-bg-hover transition-colors"
              >
                Praleisti
              </button>
              <button
                onClick={saveAllStats}
                disabled={savingStats}
                className="flex-1 px-4 py-3 bg-primary text-black rounded font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {savingStats ? "Saugoma..." : "IŠSAUGOTI STATISTIKĄ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

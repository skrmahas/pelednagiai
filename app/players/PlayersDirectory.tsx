"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import type { Team } from "@/lib/data";
import type { PlayerWithStats } from "@/lib/players";

interface Props {
  players: PlayerWithStats[];
  teams: Team[];
}

type SortKey =
  | "eff"
  | "avgPoints"
  | "avgRebounds"
  | "avgAssists"
  | "fgPercentage"
  | "threePtPercentage"
  | "ftPercentage";

const SORT_LABELS: Record<SortKey, string> = {
  eff: "EFF",
  avgPoints: "TŠK",
  avgRebounds: "REB",
  avgAssists: "REZ",
  fgPercentage: "FG%",
  threePtPercentage: "3PT%",
  ftPercentage: "FT%",
};

export default function PlayersDirectory({ players, teams }: Props) {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("eff");
  const deferredSearch = useDeferredValue(search);

  const teamMap = new Map(teams.map((team) => [team.id, team.name]));
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredPlayers = players
    .filter((player) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (selectedTeam === "all") {
        return true;
      }

      if (selectedTeam === "substitute") {
        return player.teamId == null || player.category === "substitute";
      }

      return player.teamId === selectedTeam;
    })
    .sort((a, b) => {
      if (b[sortKey] !== a[sortKey]) {
        return Number(b[sortKey]) - Number(a[sortKey]);
      }
      if (b.eff !== a.eff) return b.eff - a.eff;
      if (b.avgPoints !== a.avgPoints) return b.avgPoints - a.avgPoints;
      return b.gamesPlayed - a.gamesPlayed;
    });

  const leaders = filteredPlayers.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-text-muted">Paieška</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ieškoti žaidėjo..."
            className="w-full rounded-xl border border-border bg-card-bg px-4 py-3 outline-none transition-colors focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-text-muted">Komanda</span>
          <select
            value={selectedTeam}
            onChange={(event) => setSelectedTeam(event.target.value)}
            className="rounded-xl border border-border bg-card-bg px-4 py-3 outline-none transition-colors focus:border-primary"
          >
            <option value="all">Visos komandos</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
            <option value="substitute">Pakaitiniai</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-text-muted">Rikiuoti pagal</span>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="rounded-xl border border-border bg-card-bg px-4 py-3 outline-none transition-colors focus:border-primary"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {leaders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {leaders.map((player, index) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="block rounded-2xl border border-border bg-card-bg p-5 hover:border-primary hover:bg-card-bg-hover transition-colors"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                #{index + 1} pagal {SORT_LABELS[sortKey]}
              </p>
              <h2 className="mt-3 text-xl font-black">{player.name}</h2>
              <p className="text-sm text-text-muted">
                {player.teamId ? teamMap.get(player.teamId) : "Pakaitinis"}
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-black text-primary">{player[sortKey]}</p>
                  <p className="text-xs text-text-muted">{SORT_LABELS[sortKey]}</p>
                </div>
                <div className="text-right text-sm text-text-muted">
                  <p>{player.avgPoints} TŠK</p>
                  <p>{player.eff} EFF</p>
                  <p>{player.gamesPlayed} rung.</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:hidden">
        {filteredPlayers.map((player, index) => (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            className="block rounded-2xl border border-border bg-card-bg p-4 hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">#{index + 1}</p>
                <p className="mt-1 text-lg font-bold">{player.name}</p>
                <p className="text-sm text-text-muted">
                  {player.teamId ? teamMap.get(player.teamId) : "Pakaitinis"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary">{player.eff}</p>
                <p className="text-xs text-text-muted">EFF</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl border border-border bg-background p-2 text-center">
                <p className="font-bold">{player.avgPoints}</p>
                <p className="text-xs text-text-muted">TŠK</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-2 text-center">
                <p className="font-bold">{player.avgRebounds}</p>
                <p className="text-xs text-text-muted">REB</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-2 text-center">
                <p className="font-bold">{player.avgAssists}</p>
                <p className="text-xs text-text-muted">REZ</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card-bg sm:block">
        <table className="w-full">
          <thead className="bg-[#252525] text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-muted">#</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Žaidėjas</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Komanda</th>
              <th className="px-4 py-3 font-semibold text-center text-text-muted">R</th>
              <th className="px-4 py-3 font-semibold text-center text-primary">EFF</th>
              <th className="px-4 py-3 font-semibold text-center text-text-muted">TŠK</th>
              <th className="px-4 py-3 font-semibold text-center text-text-muted">REB</th>
              <th className="px-4 py-3 font-semibold text-center text-text-muted">REZ</th>
              <th className="px-4 py-3 font-semibold text-center text-text-muted">FG%</th>
              <th className="px-4 py-3 font-semibold text-center text-text-muted">3PT%</th>
              <th className="px-4 py-3 font-semibold text-center text-text-muted">FT%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPlayers.map((player, index) => (
              <tr key={player.id} className="hover:bg-card-bg-hover transition-colors">
                <td className="px-4 py-3">
                  <span className={`font-black ${index < 3 ? "text-primary" : "text-text-muted"}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/players/${player.id}`} className="font-medium hover:text-primary transition-colors">
                    {player.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {player.teamId ? teamMap.get(player.teamId) : "Pakaitinis"}
                </td>
                <td className="px-4 py-3 text-center text-text-muted">{player.gamesPlayed}</td>
                <td className="px-4 py-3 text-center font-black text-primary">{player.eff}</td>
                <td className="px-4 py-3 text-center">{player.avgPoints}</td>
                <td className="px-4 py-3 text-center">{player.avgRebounds}</td>
                <td className="px-4 py-3 text-center">{player.avgAssists}</td>
                <td className="px-4 py-3 text-center">{player.fgPercentage}</td>
                <td className="px-4 py-3 text-center">{player.threePtPercentage}</td>
                <td className="px-4 py-3 text-center">{player.ftPercentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPlayers.length === 0 && (
        <div className="rounded-2xl border border-border bg-card-bg p-8 text-center text-text-muted">
          Pagal pasirinktus filtrus žaidėjų nerasta.
        </div>
      )}
    </div>
  );
}

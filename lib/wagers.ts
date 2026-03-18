import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Wager {
  id: string;
  matchId: string;
  oddsHome: number;
  oddsAway: number;
  description?: string;
  bets: Bet[];
}

export interface Bet {
  id: string;
  visitorName: string;
  teamId: string;
  amount: number;
  timestamp: string;
}

type SupabaseWagerRow = {
  id: string;
  matchid: string;
  oddshome: number;
  oddsaway: number;
  description: string | null;
  bets:
    | Array<{
        id: string;
        visitorname: string;
        teamid: string;
        amount: number;
        timestamp: string;
      }>
    | null;
};

function normalizeWager(row: SupabaseWagerRow): Wager {
  return {
    id: row.id,
    matchId: row.matchid,
    oddsHome: Number(row.oddshome),
    oddsAway: Number(row.oddsaway),
    description: row.description ?? undefined,
    bets: (row.bets ?? []).map((bet) => ({
      id: bet.id,
      visitorName: bet.visitorname,
      teamId: bet.teamid,
      amount: Number(bet.amount),
      timestamp: bet.timestamp,
    })),
  };
}

function handleError(error: PostgrestError | null): void {
  if (error) {
    throw error;
  }
}

export async function getWagers(): Promise<Wager[]> {
  const { data, error } = await supabase
    .from("wagers")
    .select<SupabaseWagerRow>(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .order("matchid", { ascending: true });

  handleError(error);
  return (data ?? []).map(normalizeWager);
}

export async function getWager(id: string): Promise<Wager | undefined> {
  const { data, error } = await supabase
    .from("wagers")
    .select<SupabaseWagerRow>(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .eq("id", id)
    .maybeSingle();

  handleError(error);
  if (!data) return undefined;
  return normalizeWager(data);
}

export async function getWagerByMatch(matchId: string): Promise<Wager | undefined> {
  const { data, error } = await supabase
    .from("wagers")
    .select<SupabaseWagerRow>(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .eq("matchid", matchId)
    .maybeSingle();

  handleError(error);
  if (!data) return undefined;
  return normalizeWager(data);
}

export async function createWager(
  wager: Omit<Wager, "id" | "bets">
): Promise<Wager> {
  const { data, error } = await supabase
    .from("wagers")
    .insert({
      matchid: wager.matchId,
      oddshome: wager.oddsHome,
      oddsaway: wager.oddsAway,
      description: wager.description ?? null,
    })
    .select<SupabaseWagerRow>("id, matchid, oddshome, oddsaway, description")
    .single();

  handleError(error);
  if (!data) {
    throw new Error("Wager creation failed");
  }

  return {
    id: data.id,
    matchId: data.matchid,
    oddsHome: Number(data.oddshome),
    oddsAway: Number(data.oddsaway),
    description: data.description ?? undefined,
    bets: [],
  };
}

export async function addBet(
  wagerId: string,
  bet: Omit<Bet, "id" | "timestamp">
): Promise<Wager | null> {
  const { error } = await supabase.from("bets").insert({
    wagerid: wagerId,
    visitorname: bet.visitorName,
    teamid: bet.teamId,
    amount: bet.amount,
  });

  handleError(error);
  return (await getWager(wagerId)) ?? null;
}

export async function updateWager(
  id: string,
  updates: Partial<Pick<Wager, "oddsHome" | "oddsAway" | "description">>
): Promise<Wager | null> {
  const { data, error } = await supabase
    .from("wagers")
    .update({
      oddshome: updates.oddsHome,
      oddsaway: updates.oddsAway,
      description: updates.description ?? null,
    })
    .eq("id", id)
    .select<SupabaseWagerRow>(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .maybeSingle();

  handleError(error);
  if (!data) return null;
  return normalizeWager(data);
}

export async function deleteWager(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("wagers")
    .delete({ count: "exact", returning: "minimal" })
    .eq("id", id);

  handleError(error);
  return Boolean(count && count > 0);
}

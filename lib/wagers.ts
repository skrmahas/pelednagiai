import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseAdmin, supabasePublic } from "@/lib/supabase";

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
  const { data, error } = await supabasePublic
    .from("wagers")
    .select(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .order("matchid", { ascending: true });

  handleError(error);
  const rows = (data ?? []) as SupabaseWagerRow[];
  return rows.map(normalizeWager);
}

export async function getWager(id: string): Promise<Wager | undefined> {
  const { data, error } = await supabasePublic
    .from("wagers")
    .select(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .eq("id", id)
    .maybeSingle();

  handleError(error);
  if (!data) return undefined;
  const row = data as SupabaseWagerRow;
  return normalizeWager(row);
}

export async function getWagerByMatch(matchId: string): Promise<Wager | undefined> {
  const { data, error } = await supabasePublic
    .from("wagers")
    .select(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .eq("matchid", matchId)
    .maybeSingle();

  handleError(error);
  if (!data) return undefined;
  const row = data as SupabaseWagerRow;
  return normalizeWager(row);
}

export async function createWager(
  wager: Omit<Wager, "id" | "bets">
): Promise<Wager> {
  const { data, error } = await supabaseAdmin
    .from("wagers")
    .insert({
      matchid: wager.matchId,
      oddshome: wager.oddsHome,
      oddsaway: wager.oddsAway,
      description: wager.description ?? null,
    })
    .select("id, matchid, oddshome, oddsaway, description")
    .single();

  handleError(error);
  if (!data) {
    throw new Error("Wager creation failed");
  }

  const row = data as SupabaseWagerRow;
  return {
    id: row.id,
    matchId: row.matchid,
    oddsHome: Number(row.oddshome),
    oddsAway: Number(row.oddsaway),
    description: row.description ?? undefined,
    bets: [],
  };
}

export async function addBet(
  wagerId: string,
  bet: Omit<Bet, "id" | "timestamp">
): Promise<Wager | null> {
  const { error } = await supabaseAdmin.from("bets").insert({
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
  const { data, error } = await supabaseAdmin
    .from("wagers")
    .update({
      oddshome: updates.oddsHome,
      oddsaway: updates.oddsAway,
      description: updates.description ?? null,
    })
    .eq("id", id)
    .select(
      "id, matchid, oddshome, oddsaway, description, bets(id, visitorname, teamid, amount, timestamp)"
    )
    .maybeSingle();

  handleError(error);
  if (!data) return null;
  const row = data as SupabaseWagerRow;
  return normalizeWager(row);
}

export async function deleteWager(id: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from("wagers")
    .delete({ count: "exact" })
    .eq("id", id);

  handleError(error);
  return Boolean(count && count > 0);
}

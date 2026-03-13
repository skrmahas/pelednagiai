import { NextRequest, NextResponse } from "next/server";
import { getStatsRowsForMatch } from "@/lib/players";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  const { id: matchId } = await params;
  const rows = await getStatsRowsForMatch(matchId);
  return NextResponse.json(rows);
}

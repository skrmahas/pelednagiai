import { NextRequest, NextResponse } from "next/server";
import { getMatches, createMatch } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const matches = await getMatches();
  return NextResponse.json(matches);
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  const body = await request.json();
  const { homeTeamId, awayTeamId, round } = body;

  if (!homeTeamId || !awayTeamId) {
    return NextResponse.json(
      { error: "Reikia nurodyti abi komandas" },
      { status: 400 }
    );
  }

  if (homeTeamId === awayTeamId) {
    return NextResponse.json(
      { error: "Komanda negali žaisti prieš save" },
      { status: 400 }
    );
  }

  try {
    const match = await createMatch({
      homeTeamId,
      awayTeamId,
      homeScore: null,
      awayScore: null,
      round: round || 1,
      status: "scheduled",
    });
    return NextResponse.json(match, { status: 201 });
  } catch (e: any) {
    const message =
      typeof e?.message === "string"
        ? e.message
        : "Klaida kuriant rungtynes (patikrinkite ar nėra dublio ar neteisingų duomenų)";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

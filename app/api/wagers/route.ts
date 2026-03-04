import { NextRequest, NextResponse } from "next/server";
import { getWagers, createWager } from "@/lib/wagers";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const wagers = await getWagers();
  return NextResponse.json(wagers);
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  const body = await request.json();
  const { matchId, oddsHome, oddsAway, description } = body;

  if (!matchId || oddsHome === undefined || oddsAway === undefined) {
    return NextResponse.json(
      { error: "Trūksta privalomų laukų" },
      { status: 400 }
    );
  }

  if (oddsHome <= 0 || oddsAway <= 0) {
    return NextResponse.json(
      { error: "Koeficientai turi būti teigiami" },
      { status: 400 }
    );
  }

  const wager = await createWager({
    matchId,
    oddsHome,
    oddsAway,
    description,
  });

  return NextResponse.json(wager, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getMatches, createMatch } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import {
  ValidationError,
  readJsonBody,
  readOptionalNumber,
  readRequiredString,
} from "@/lib/request";

export async function GET() {
  const matches = await getMatches();
  return NextResponse.json(matches);
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  try {
    const body = await readJsonBody(request);
    const homeTeamId = readRequiredString(
      body,
      "homeTeamId",
      "Reikia nurodyti abi komandas"
    );
    const awayTeamId = readRequiredString(
      body,
      "awayTeamId",
      "Reikia nurodyti abi komandas"
    );
    const round = readOptionalNumber(body, "round");

    if (homeTeamId === awayTeamId) {
      return NextResponse.json(
        { error: "Komanda negali žaisti prieš save" },
        { status: 400 }
      );
    }

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
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const message =
      typeof e?.message === "string"
        ? e.message
        : "Klaida kuriant rungtynes (patikrinkite ar nėra dublio ar neteisingų duomenų)";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

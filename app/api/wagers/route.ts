import { NextRequest, NextResponse } from "next/server";
import { getWagers, createWager } from "@/lib/wagers";
import { isAuthenticated } from "@/lib/auth";
import {
  ValidationError,
  readJsonBody,
  readNumber,
  readOptionalString,
  readRequiredString,
} from "@/lib/request";

export async function GET() {
  const wagers = await getWagers();
  return NextResponse.json(wagers);
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  try {
    const body = await readJsonBody(request);
    const matchId = readRequiredString(
      body,
      "matchId",
      "Trūksta privalomų laukų"
    );
    const oddsHome = readNumber(
      body,
      "oddsHome",
      "Koeficientai turi būti skaičiai"
    );
    const oddsAway = readNumber(
      body,
      "oddsAway",
      "Koeficientai turi būti skaičiai"
    );
    const description = readOptionalString(body, "description");

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
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

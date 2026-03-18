import { NextRequest, NextResponse } from "next/server";
import { addBet } from "@/lib/wagers";
import {
  ValidationError,
  readJsonBody,
  readNumber,
  readRequiredString,
} from "@/lib/request";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await readJsonBody(request);
    const visitorName = readRequiredString(
      body,
      "visitorName",
      "Trūksta privalomų laukų"
    );
    const teamId = readRequiredString(
      body,
      "teamId",
      "Trūksta privalomų laukų"
    );
    const amount = readNumber(body, "amount", "Suma turi būti skaičius");

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Suma turi būti teigiama" },
        { status: 400 }
      );
    }

    const wager = await addBet(id, { visitorName, teamId, amount });
    if (!wager) {
      return NextResponse.json({ error: "Lažybos nerastos" }, { status: 404 });
    }

    return NextResponse.json(wager);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

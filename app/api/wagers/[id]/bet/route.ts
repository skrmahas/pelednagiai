import { NextRequest, NextResponse } from "next/server";
import { addBet } from "@/lib/wagers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { visitorName, teamId, amount } = body;

  if (!visitorName || !teamId || amount === undefined) {
    return NextResponse.json(
      { error: "Trūksta privalomų laukų" },
      { status: 400 }
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
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
}

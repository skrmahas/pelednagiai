import { NextRequest, NextResponse } from "next/server";
import { getWager, updateWager, deleteWager } from "@/lib/wagers";
import { isAuthenticated } from "@/lib/auth";
import {
  ValidationError,
  readJsonBody,
  readOptionalNumber,
  readOptionalString,
} from "@/lib/request";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wager = await getWager(id);
  if (!wager) {
    return NextResponse.json({ error: "Lažybos nerastos" }, { status: 404 });
  }
  return NextResponse.json(wager);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await readJsonBody(request);
    const oddsHome = readOptionalNumber(body, "oddsHome");
    const oddsAway = readOptionalNumber(body, "oddsAway");
    const description = readOptionalString(body, "description");
    const updates: Record<string, unknown> = {};

    if (oddsHome !== undefined) {
      if (oddsHome <= 0) {
        return NextResponse.json(
          { error: "Koeficientai turi būti teigiami" },
          { status: 400 }
        );
      }
      updates.oddsHome = oddsHome;
    }

    if (oddsAway !== undefined) {
      if (oddsAway <= 0) {
        return NextResponse.json(
          { error: "Koeficientai turi būti teigiami" },
          { status: 400 }
        );
      }
      updates.oddsAway = oddsAway;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    const wager = await updateWager(id, updates);
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteWager(id);
  if (!deleted) {
    return NextResponse.json({ error: "Lažybos nerastos" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

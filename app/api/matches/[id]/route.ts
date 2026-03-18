import { NextRequest, NextResponse } from "next/server";
import { getMatch, updateMatch, deleteMatch } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import {
  ValidationError,
  readEnumValue,
  readJsonBody,
  readOptionalNumber,
} from "@/lib/request";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) {
    return NextResponse.json({ error: "Rungtynės nerastos" }, { status: 404 });
  }
  return NextResponse.json(match);
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
    const homeScore = readOptionalNumber(body, "homeScore");
    const awayScore = readOptionalNumber(body, "awayScore");
    const status = readEnumValue(
      body,
      "status",
      ["scheduled", "played"] as const,
      "Neteisinga būsena"
    );
    const round = readOptionalNumber(body, "round");
    const updates: Record<string, unknown> = {};

    if (homeScore !== undefined) {
      if (homeScore < 0) {
        return NextResponse.json(
          { error: "Neteisingas namų komandos rezultatas" },
          { status: 400 }
        );
      }
      updates.homeScore = homeScore;
    }

    if (awayScore !== undefined) {
      if (awayScore < 0) {
        return NextResponse.json(
          { error: "Neteisingas svečių komandos rezultatas" },
          { status: 400 }
        );
      }
      updates.awayScore = awayScore;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (round !== undefined) {
      if (round < 1) {
        return NextResponse.json(
          { error: "Neteisingas turo numeris" },
          { status: 400 }
        );
      }
      updates.round = round;
    }

    const match = await updateMatch(id, updates);
    if (!match) {
      return NextResponse.json({ error: "Rungtynės nerastos" }, { status: 404 });
    }

    return NextResponse.json(match);
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
  const deleted = await deleteMatch(id);
  if (!deleted) {
    return NextResponse.json({ error: "Rungtynės nerastos" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

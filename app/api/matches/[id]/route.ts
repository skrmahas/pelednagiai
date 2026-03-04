import { NextRequest, NextResponse } from "next/server";
import { getMatch, updateMatch, deleteMatch } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

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
  const body = await request.json();
  const { homeScore, awayScore, status, round } = body;

  const updates: Record<string, unknown> = {};

  if (homeScore !== undefined) {
    if (typeof homeScore !== "number" || homeScore < 0) {
      return NextResponse.json(
        { error: "Neteisingas namų komandos rezultatas" },
        { status: 400 }
      );
    }
    updates.homeScore = homeScore;
  }

  if (awayScore !== undefined) {
    if (typeof awayScore !== "number" || awayScore < 0) {
      return NextResponse.json(
        { error: "Neteisingas svečių komandos rezultatas" },
        { status: 400 }
      );
    }
    updates.awayScore = awayScore;
  }

  if (status !== undefined) {
    if (status !== "scheduled" && status !== "played") {
      return NextResponse.json(
        { error: "Neteisinga būsena" },
        { status: 400 }
      );
    }
    updates.status = status;
  }

  if (round !== undefined) {
    if (typeof round !== "number" || round < 1) {
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

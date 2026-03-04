import { NextRequest, NextResponse } from "next/server";
import { getWager, updateWager, deleteWager } from "@/lib/wagers";
import { isAuthenticated } from "@/lib/auth";

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
  const body = await request.json();
  const { oddsHome, oddsAway, description } = body;

  const updates: Record<string, unknown> = {};
  if (oddsHome !== undefined) updates.oddsHome = oddsHome;
  if (oddsAway !== undefined) updates.oddsAway = oddsAway;
  if (description !== undefined) updates.description = description;

  const wager = await updateWager(id, updates);
  if (!wager) {
    return NextResponse.json({ error: "Lažybos nerastos" }, { status: 404 });
  }

  return NextResponse.json(wager);
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

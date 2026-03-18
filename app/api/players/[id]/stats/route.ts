import { NextRequest, NextResponse } from "next/server";
import { getPlayerStats, addGameStats, updateGameStats, deleteGameStats } from "@/lib/players";
import { isAuthenticated } from "@/lib/auth";
import {
  ValidationError,
  readJsonBody,
  readOptionalNumber,
  readRequiredString,
} from "@/lib/request";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stats = await getPlayerStats(id);
  if (!stats) {
    return NextResponse.json({ 
      playerId: id, 
      games: [], 
      totals: {
        points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
        turnovers: 0, fgMade: 0, fgAttempts: 0, threePtMade: 0,
        threePtAttempts: 0, ftMade: 0, ftAttempts: 0
      }
    });
  }
  return NextResponse.json(stats);
}

export async function POST(
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
    const matchId = readRequiredString(
      body,
      "matchId",
      "Rungtynių ID privalomas"
    );

    const stats = await addGameStats(id, {
      matchId,
      points: readOptionalNumber(body, "points") ?? 0,
      rebounds: readOptionalNumber(body, "rebounds") ?? 0,
      assists: readOptionalNumber(body, "assists") ?? 0,
      steals: readOptionalNumber(body, "steals") ?? 0,
      blocks: readOptionalNumber(body, "blocks") ?? 0,
      turnovers: readOptionalNumber(body, "turnovers") ?? 0,
      personalFouls: readOptionalNumber(body, "personalFouls") ?? 0,
      twoFgMade: readOptionalNumber(body, "twoFgMade") ?? 0,
      twoFgAttempts: readOptionalNumber(body, "twoFgAttempts") ?? 0,
      fgMade: readOptionalNumber(body, "fgMade") ?? 0,
      fgAttempts: readOptionalNumber(body, "fgAttempts") ?? 0,
      threePtMade: readOptionalNumber(body, "threePtMade") ?? 0,
      threePtAttempts: readOptionalNumber(body, "threePtAttempts") ?? 0,
      ftMade: readOptionalNumber(body, "ftMade") ?? 0,
      ftAttempts: readOptionalNumber(body, "ftAttempts") ?? 0,
    });

    if (!stats) {
      return NextResponse.json({ error: "Klaida įrašant" }, { status: 500 });
    }

    return NextResponse.json(stats, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
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
    const matchId = readRequiredString(
      body,
      "matchId",
      "Rungtynių ID privalomas"
    );

    await updateGameStats(id, matchId, {
      points: readOptionalNumber(body, "points"),
      rebounds: readOptionalNumber(body, "rebounds"),
      assists: readOptionalNumber(body, "assists"),
      steals: readOptionalNumber(body, "steals"),
      blocks: readOptionalNumber(body, "blocks"),
      turnovers: readOptionalNumber(body, "turnovers"),
      personalFouls: readOptionalNumber(body, "personalFouls"),
      twoFgMade: readOptionalNumber(body, "twoFgMade"),
      twoFgAttempts: readOptionalNumber(body, "twoFgAttempts"),
      fgMade: readOptionalNumber(body, "fgMade"),
      fgAttempts: readOptionalNumber(body, "fgAttempts"),
      threePtMade: readOptionalNumber(body, "threePtMade"),
      threePtAttempts: readOptionalNumber(body, "threePtAttempts"),
      ftMade: readOptionalNumber(body, "ftMade"),
      ftAttempts: readOptionalNumber(body, "ftAttempts"),
    });
    const stats = await getPlayerStats(id);
    return NextResponse.json(stats ?? { playerId: id, games: [], totals: {} });
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Klaida atnaujinant" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json(
      { error: "Rungtynių ID privalomas (query: matchId)" },
      { status: 400 }
    );
  }

  try {
    await deleteGameStats(id, matchId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Klaida trinant" }, { status: 500 });
  }
}

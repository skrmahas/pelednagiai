import { NextRequest, NextResponse } from "next/server";
import { getPlayerStats, addGameStats } from "@/lib/players";
import { isAuthenticated } from "@/lib/auth";

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
  const body = await request.json();
  
  const {
    matchId,
    points = 0,
    rebounds = 0,
    assists = 0,
    steals = 0,
    blocks = 0,
    turnovers = 0,
    personalFouls = 0,
    twoFgMade = 0,
    twoFgAttempts = 0,
    fgMade = 0,
    fgAttempts = 0,
    threePtMade = 0,
    threePtAttempts = 0,
    ftMade = 0,
    ftAttempts = 0,
  } = body;

  if (!matchId) {
    return NextResponse.json(
      { error: "Rungtynių ID privalomas" },
      { status: 400 }
    );
  }

  const stats = await addGameStats(id, {
    matchId,
    points,
    rebounds,
    assists,
    steals,
    blocks,
    turnovers,
    personalFouls,
    twoFgMade,
    twoFgAttempts,
    fgMade,
    fgAttempts,
    threePtMade,
    threePtAttempts,
    ftMade,
    ftAttempts,
  });

  if (!stats) {
    return NextResponse.json({ error: "Klaida įrašant" }, { status: 500 });
  }

  return NextResponse.json(stats, { status: 201 });
}

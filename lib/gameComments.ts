import type { GameStats } from "./players";

/**
 * Returns joke comments based on a player's single-game performance.
 * "Brick" = missed shot in basketball slang.
 */
export function getPerformanceComments(game: GameStats): string[] {
  const comments: string[] = [];
  const threePtPct =
    game.threePtAttempts > 0
      ? (game.threePtMade / game.threePtAttempts) * 100
      : null;
  const fgPct =
    game.fgAttempts > 0 ? (game.fgMade / game.fgAttempts) * 100 : null;
  const ftPct =
    game.ftAttempts > 0 ? (game.ftMade / game.ftAttempts) * 100 : null;

  // 3PT brick house
  if (
    threePtPct !== null &&
    game.threePtAttempts >= 2 &&
    threePtPct < 25
  ) {
    comments.push("He built this house brick by brick 🧱");
  }

  // General FG% disaster
  if (fgPct !== null && game.fgAttempts >= 5 && fgPct < 30) {
    comments.push("The rim has a family. Leave it alone.");
  }

  // Turnover machine
  if (game.turnovers >= 5) {
    comments.push("Santa Claus mode — giving gifts to the other team 🎁");
  }
  if (game.turnovers >= 3 && game.turnovers < 5) {
    comments.push("Turnover special of the day");
  }

  // Invisible on offense
  if (game.points === 0 && game.fgAttempts + game.ftAttempts > 0) {
    comments.push("Defensive specialist. (We'll say it was by choice.)");
  }
  if (game.points === 0 && game.assists === 0 && game.rebounds <= 1) {
    comments.push("Invisible on the stat sheet 👻");
  }

  // High scorer
  if (game.points >= 20) {
    comments.push("Carried the team on his back 🏋️");
  }
  if (game.points >= 15 && game.points < 20) {
    comments.push("MVP of the night");
  }

  // No assists
  if (game.assists === 0 && game.points >= 10) {
    comments.push("Shoot first, ask questions never");
  }

  // Many assists
  if (game.assists >= 6) {
    comments.push("Point god 👑");
  }
  if (game.assists >= 4 && game.assists < 6) {
    comments.push("Chef with the dimes 👨‍🍳");
  }

  // No rebounds (bigs)
  if (game.rebounds === 0 && game.blocks === 0) {
    comments.push("Floating in the paint");
  }

  // Board man
  if (game.rebounds >= 10) {
    comments.push("Board man gets paid 💰");
  }
  if (game.rebounds >= 7 && game.rebounds < 10) {
    comments.push("Cleaning the glass");
  }

  // Free throws
  if (ftPct !== null && game.ftAttempts >= 3 && ftPct < 50) {
    comments.push("Someone get him a ladder — rim's too high");
  }
  if (ftPct !== null && game.ftAttempts >= 2 && ftPct === 100) {
    comments.push("Ice in his veins 🧊");
  }

  // Steals
  if (game.steals >= 4) {
    comments.push("Pickpocket of the year");
  }

  // Blocks
  if (game.blocks >= 3) {
    comments.push("Sent it to the stands ✈️");
  }
  if (game.blocks >= 1 && game.blocks < 3) {
    comments.push("Not in my house");
  }

  // Fouls
  if (game.personalFouls >= 5) {
    comments.push("Fouled out in our hearts 💔");
  }
  if (game.personalFouls >= 4 && game.personalFouls < 5) {
    comments.push("Living on the edge (one more foul)");
  }

  // Triple single (points, rebounds, assists all under 10)
  if (
    game.points < 10 &&
    game.rebounds < 10 &&
    game.assists < 10 &&
    game.points + game.rebounds + game.assists > 0
  ) {
    const sum = game.points + game.rebounds + game.assists;
    if (sum <= 3) {
      comments.push("Triple single — the rare 3-0-0");
    }
  }

  // Perfect from the field (low volume)
  if (
    game.fgAttempts >= 2 &&
    fgPct === 100 &&
    !comments.some((c) => c.includes("Ice"))
  ) {
    comments.push("Efficiency king. Didn't miss.");
  }

  return comments.slice(0, 3); // Max 3 comments per player so it doesn't overflow
}

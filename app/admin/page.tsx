import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getMatches, getTeams } from "@/lib/data";
import { getWagers } from "@/lib/wagers";
import { getPlayers } from "@/lib/players";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const [matches, teams, wagers, players] = await Promise.all([
    getMatches(),
    getTeams(),
    getWagers(),
    getPlayers(),
  ]);

  return <AdminDashboard matches={matches} teams={teams} wagers={wagers} players={players} />;
}

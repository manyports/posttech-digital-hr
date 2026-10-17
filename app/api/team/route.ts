import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { listTeam, teamWeek } from "@/lib/server/services/employees";

export async function GET() {
  return handle(async () => {
    const actor = await requireActor();
    return { team: await listTeam(actor), week: await teamWeek(actor) };
  });
}

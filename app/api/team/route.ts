import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { listTeam, teamCalendar } from "@/lib/server/services/employees";
import { todayISO } from "@/lib/domain/dates";

export async function GET(req: Request) {
  return handle(async () => {
    const actor = await requireActor();
    const params = new URL(req.url).searchParams;
    const start = params.get("start") ?? todayISO();
    const days = Number(params.get("days") ?? 42);
    const [team, calendar] = await Promise.all([listTeam(actor), teamCalendar(actor, start, days)]);
    return { team, calendar };
  });
}

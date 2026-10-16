import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { listTeam } from "@/lib/server/services/employees";

export async function GET() {
  return handle(async () => ({ team: await listTeam(await requireActor()) }));
}

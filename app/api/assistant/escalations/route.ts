import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { listEscalations } from "@/lib/server/services/assistant";

export async function GET() {
  return handle(async () => ({ escalations: await listEscalations(await requireActor()) }));
}

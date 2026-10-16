import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { listAssignmentsFor } from "@/lib/server/services/academy";

export async function GET() {
  return handle(async () => ({ assignments: await listAssignmentsFor(await requireActor()) }));
}

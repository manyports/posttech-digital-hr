import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";

export async function GET() {
  return handle(async () => ({ user: await requireActor() }));
}

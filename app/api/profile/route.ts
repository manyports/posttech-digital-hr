import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { getProfileBundle } from "@/lib/server/services/dashboard";

export async function GET() {
  return handle(async () => getProfileBundle(await requireActor()));
}

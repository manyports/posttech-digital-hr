import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { getRequestFormInfo } from "@/lib/server/services/requests";

export async function GET() {
  return handle(async () => getRequestFormInfo(await requireActor()));
}

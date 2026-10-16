import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { listNotifications } from "@/lib/server/services/notifications";

export async function GET() {
  return handle(async () => listNotifications(await requireActor()));
}

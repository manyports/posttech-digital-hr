import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { markRead } from "@/lib/server/services/notifications";

export async function POST(req: Request) {
  return handle(async () => {
    const actor = await requireActor();
    await markRead(actor, (await readJson(req)) ?? {});
  });
}

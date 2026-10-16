import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { escalate } from "@/lib/server/services/assistant";

export async function POST(req: Request) {
  return handle(async () => {
    const actor = await requireActor();
    const body = (await readJson(req)) as { question?: unknown } | undefined;
    return { escalation: await escalate(actor, body?.question) };
  }, 201);
}

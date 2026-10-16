import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { ask } from "@/lib/server/services/assistant";

export async function POST(req: Request) {
  return handle(async () => {
    const actor = await requireActor();
    const body = (await readJson(req)) as { question?: unknown } | undefined;
    return { reply: await ask(actor, body?.question) };
  });
}

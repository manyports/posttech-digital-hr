import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { replyToEscalation } from "@/lib/server/services/assistant";

/** HR-only. POST { answer: string } */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const actor = await requireActor();
    const body = (await readJson(req)) as { answer?: unknown } | undefined;
    return { escalation: await replyToEscalation(actor, id, body?.answer) };
  });
}

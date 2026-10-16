import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { submitTest } from "@/lib/server/services/academy";

/** POST { answers: number[] } - graded on the server; the key never leaves it. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    return { result: await submitTest(await requireActor(), id, await readJson(req)) };
  });
}

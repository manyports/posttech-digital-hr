import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { actOnRequest } from "@/lib/server/services/requests";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    return { request: await actOnRequest(await requireActor(), id, await readJson(req)) };
  });
}

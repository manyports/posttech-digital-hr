import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { getRequest } from "@/lib/server/services/requests";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    return { request: await getRequest(await requireActor(), id) };
  });
}

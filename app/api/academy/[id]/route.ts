import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { getAssignment } from "@/lib/server/services/academy";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    return { assignment: await getAssignment(await requireActor(), id) };
  });
}

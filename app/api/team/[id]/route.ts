import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { getTeamMember } from "@/lib/server/services/team";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    return getTeamMember(await requireActor(), id);
  });
}

import { requireActor } from "@/lib/server/auth/session";
import { badRequest } from "@/lib/server/errors";
import { handle, readJson } from "@/lib/server/http";
import { completeLesson, openLesson } from "@/lib/server/services/academy";

/** POST { action: "open" | "complete" } - learner-only progress tracking. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; lessonId: string }> },
) {
  return handle(async () => {
    const { id, lessonId } = await ctx.params;
    const actor = await requireActor();
    const action = ((await readJson(req)) as { action?: unknown } | undefined)?.action;
    if (action === "open") return { assignment: await openLesson(actor, id, lessonId) };
    if (action === "complete") return { assignment: await completeLesson(actor, id, lessonId) };
    throw badRequest("`action` must be \"open\" or \"complete\".");
  });
}

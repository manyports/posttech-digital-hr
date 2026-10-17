import { requireRole } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { badRequest } from "@/lib/server/errors";
import { restoreKnowledgeVersion } from "@/lib/server/services/knowledge-base";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  return handle(async () => {
    const body = await readJson(req) as { version?: unknown } | undefined;
    if (!body || !Number.isInteger(body.version) || (body.version as number) < 1) throw badRequest("Choose a valid version.");
    return { article: await restoreKnowledgeVersion(await requireRole("hr"), (await params).id, body.version as number) };
  });
}

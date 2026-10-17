import { requireRole } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { publishKnowledgeArticle, saveKnowledgeDraft } from "@/lib/server/services/knowledge-base";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    return { article: await saveKnowledgeDraft(await requireRole("hr"), id, await readJson(req)) };
  });
}

export async function POST(_req: Request, { params }: Context) {
  return handle(async () => ({ article: await publishKnowledgeArticle(await requireRole("hr"), (await params).id) }));
}

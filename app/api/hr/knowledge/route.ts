import { requireRole } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { createKnowledgeDraft, listKnowledgeArticles } from "@/lib/server/services/knowledge-base";

export async function GET() {
  return handle(async () => ({ articles: await listKnowledgeArticles(await requireRole("hr")) }));
}

export async function POST(req: Request) {
  return handle(async () => ({ article: await createKnowledgeDraft(await requireRole("hr"), await readJson(req)) }), 201);
}

import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { unansweredQuestions } from "@/lib/server/services/assistant";

export async function GET() {
  return handle(async () => unansweredQuestions(await requireActor()));
}

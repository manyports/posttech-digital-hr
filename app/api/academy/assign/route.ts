import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { assignCourse } from "@/lib/server/services/academy";

export async function POST(req: Request) {
  return handle(async () => ({ assignment: await assignCourse(await requireActor(), await readJson(req)) }), 201);
}

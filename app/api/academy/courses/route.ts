import { requireActor } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";
import { listCourses } from "@/lib/server/services/academy";

export async function GET() {
  return handle(async () => ({ courses: await listCourses(await requireActor()) }));
}

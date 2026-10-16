import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { createRequest, listMyRequests } from "@/lib/server/services/requests";

export async function GET() {
  return handle(async () => ({ requests: await listMyRequests(await requireActor()) }));
}

export async function POST(req: Request) {
  return handle(async () => ({ request: await createRequest(await requireActor(), await readJson(req)) }), 201);
}

import { login } from "@/lib/server/auth/session";
import { badRequest } from "@/lib/server/errors";
import { handle, readJson } from "@/lib/server/http";

export async function POST(req: Request) {
  return handle(async () => {
    const body = (await readJson(req)) as { email?: unknown } | undefined;
    if (typeof body?.email !== "string" || !body.email.trim()) {
      throw badRequest("Enter your e-mail.", { email: "Required" });
    }
    return { user: await login(body.email) };
  });
}

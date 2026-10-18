import { checkDemoPassword, requireRole } from "@/lib/server/auth/session";
import { resetDemoData } from "@/lib/server/db";
import { forbidden } from "@/lib/server/errors";
import { handle, readJson } from "@/lib/server/http";

/**
 * HR/Admin only: restore the pristine fake demo data (sessions are kept).
 * Also requires the DEMO_PASSWORD; with none configured, reset is disabled.
 */
export async function POST(req: Request) {
  return handle(async () => {
    await requireRole("hr");
    const body = (await readJson(req)) as { password?: unknown } | undefined;
    if (!checkDemoPassword(body?.password)) throw forbidden("Wrong demo password.");
    await resetDemoData();
  });
}

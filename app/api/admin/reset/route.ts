import { requireRole } from "@/lib/server/auth/session";
import { resetDemoData } from "@/lib/server/db";
import { handle } from "@/lib/server/http";

/** HR/Admin only: restore the pristine fake demo data (sessions are kept). */
export async function POST() {
  return handle(async () => {
    await requireRole("hr");
    await resetDemoData();
  });
}

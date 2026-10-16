import { logout } from "@/lib/server/auth/session";
import { handle } from "@/lib/server/http";

export async function POST() {
  return handle(async () => {
    await logout();
  });
}

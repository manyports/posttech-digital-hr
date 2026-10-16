import { redirect } from "next/navigation";
import { getActor } from "@/lib/server/auth/session";
import { PortalShell } from "../components/portal/PortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // Real session check on the server (the cookie alone proves nothing).
  const actor = await getActor();
  if (!actor) redirect("/login");
  return <PortalShell user={actor}>{children}</PortalShell>;
}

"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/domain/types";

/**
 * The signed-in user, provided by the server layout. For DISPLAY and UI
 * affordances only. Every permission is re-checked on the server per request.
 */
export const UserContext = createContext<SessionUser | null>(null);

export function useUser(): SessionUser {
  const u = useContext(UserContext);
  if (!u) throw new Error("useUser must be used inside <PortalShell>");
  return u;
}

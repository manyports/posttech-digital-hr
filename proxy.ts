import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cross-site request guard for the JSON API.
 *
 * Session cookies are SameSite=Lax and httpOnly; on top of that, any
 * state-changing API call that carries an Origin header must come from this
 * same host. (Authentication and authorization happen in the services, never
 * here: proxy is only a cheap first line of defence.)
 */
export function proxy(request: NextRequest) {
  const method = request.method;
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const origin = request.headers.get("origin");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        /* malformed Origin is rejected below */
      }
      const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
      if (originHost !== host) {
        return NextResponse.json(
          { error: { code: "forbidden", message: "Cross-site request blocked." } },
          { status: 403 },
        );
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

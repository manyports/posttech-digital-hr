import { NextResponse } from "next/server";
import { HttpError } from "./errors";

/**
 * Wrap a route-handler body: services throw HttpError for expected failures
 * (401/403/404/409/400); anything else becomes a generic 500 with no leak.
 */
export async function handle<T>(fn: () => Promise<T>, status = 200): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data ?? { ok: true }, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message, fields: err.fields } },
        { status: err.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    console.error("[api] unhandled error", err);
    return NextResponse.json(
      { error: { code: "internal", message: "Something went wrong." } },
      { status: 500 },
    );
  }
}

/** Parse a JSON body; malformed JSON becomes `undefined` so services answer 400. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

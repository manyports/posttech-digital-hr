/** Typed fetch wrapper for the JSON API. Errors carry the server's code/message/fields. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

interface Options {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  signal?: AbortSignal;
}

export async function api<T>(path: string, { method = "GET", body, signal }: Options = {}): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string; fields?: Record<string, string> } } | null)?.error;
    // Session expired / missing: go to the login screen (not for the login call itself).
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/auth/login")) {
      window.location.assign("/login");
    }
    throw new ApiError(res.status, err?.code ?? "error", err?.message ?? "Запрос не удался.", err?.fields);
  }
  return json as T;
}

export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: body ?? {} });

export const patch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body });

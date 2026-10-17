import { KB } from "./knowledge-base";

export type RouteResult =
  | { status: "off" }
  | { status: "picked"; entryId: string }
  | { status: "none" }
  | { status: "failed" };

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

let fetchImpl: FetchLike = (input, init) => fetch(input, init);

export function setModelFetch(next: FetchLike | null): void {
  fetchImpl = next ?? ((input, init) => fetch(input, init));
}

export interface ModelEnv {
  ASSISTANT_MODEL_BASE_URL?: string;
  ASSISTANT_MODEL_KEY?: string;
  ASSISTANT_MODEL_NAME?: string;
}

export function modelRouterConfig(env: ModelEnv = process.env as ModelEnv): { base: string; key: string; model: string } | null {
  const base = env.ASSISTANT_MODEL_BASE_URL?.trim();
  const key = env.ASSISTANT_MODEL_KEY?.trim();
  const model = env.ASSISTANT_MODEL_NAME?.trim();
  if (!base || !key || !model) return null;
  return { base: base.replace(/\/$/, ""), key, model };
}

function catalog(): string {
  return KB.map((entry) => `${entry.id} | ${entry.title} | ${entry.questions[0] ?? ""}`).join("\n");
}

function parseEntryId(content: string): string | null | undefined {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
  try {
    const body = JSON.parse(trimmed) as { entryId?: unknown };
    if (body.entryId === null || body.entryId === "") return null;
    if (typeof body.entryId === "string") return body.entryId;
    return undefined;
  } catch {
    return undefined;
  }
}

export async function routeEntryId(question: string, env: ModelEnv = process.env as ModelEnv): Promise<RouteResult> {
  const cfg = modelRouterConfig(env);
  if (!cfg) return { status: "off" };
  const known = new Set(KB.map((entry) => entry.id));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetchImpl(`${cfg.base}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.key}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You pick one HR knowledge-base article. Reply with JSON only: {\"entryId\": string | null}. " +
              "Use null when the question is outside the list or you are not sure. Never write the answer.",
          },
          {
            role: "user",
            content: `Articles:\n${catalog()}\n\nQuestion:\n${question}`,
          },
        ],
      }),
    });
    if (!response.ok) return { status: "failed" };
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") return { status: "failed" };
    const entryId = parseEntryId(content);
    if (entryId === undefined) return { status: "failed" };
    if (entryId === null) return { status: "none" };
    if (!known.has(entryId)) return { status: "failed" };
    return { status: "picked", entryId };
  } catch {
    return { status: "failed" };
  } finally {
    clearTimeout(timer);
  }
}

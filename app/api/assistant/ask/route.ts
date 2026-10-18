import { requireActor } from "@/lib/server/auth/session";
import { handle, readJson } from "@/lib/server/http";
import { ask } from "@/lib/server/services/assistant";
import { parseLocale } from "@/lib/i18n/locale";

export async function POST(req: Request) {
  return handle(async () => {
    const actor = await requireActor();
    const body = (await readJson(req)) as { question?: unknown; locale?: unknown } | undefined;
    const cookieLocale = req.headers.get("cookie")?.match(/(?:^|;\s*)hr-locale=(ru|kk)/)?.[1];
    const locale = body?.locale === "kk" || body?.locale === "ru" ? body.locale : parseLocale(cookieLocale);
    return { reply: await ask(actor, body?.question, locale) };
  });
}

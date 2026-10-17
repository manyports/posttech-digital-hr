"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { KbEntry } from "@/lib/domain/types";
import type { KnowledgeArticleView } from "@/lib/server/services/knowledge-base";
import { ApiError, patch, post } from "@/lib/client/api";
import { useApi } from "@/lib/client/hooks";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Textarea } from "@/app/components/ui/Textarea";
import { ErrorBlock, LoadingBlock, Panel, PageHeader } from "@/app/components/portal/Panel";
import { Pill } from "@/app/components/portal/StatusBadge";
import { useToast } from "@/app/components/ui/Toast";
import { useUser } from "@/app/components/portal/UserContext";

type ListResponse = { articles: KnowledgeArticleView[] };
const EMPTY_ARTICLES: KnowledgeArticleView[] = [];

const blankEntry = (): KbEntry => ({
  id: "new-article",
  title: "",
  questions: [""],
  keywords: [],
  answer: "",
  source: { docId: "HR-POL-01", docTitle: "", section: "", revision: `rev. ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`, owner: "HR Department" },
});

function lines(values: string[]) { return values.join("\n"); }
function fromLines(value: string) { return value.split("\n").map((item) => item.trim()).filter(Boolean); }

export function KnowledgeEditor() {
  const user = useUser();
  const { toast } = useToast();
  const list = useApi<ListResponse>("/api/hr/knowledge");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [entry, setEntry] = useState<KbEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articles = list.data?.articles ?? EMPTY_ARTICLES;
  const selected = articles.find((article) => article.id === selectedId) ?? null;
  const filtered = useMemo(() => articles.filter((article) => {
    const text = `${article.published?.entry.title ?? ""} ${article.draft?.title ?? ""} ${article.id}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }), [articles, query]);
  const currentEntry = entry ?? selected?.draft ?? selected?.published?.entry ?? null;

  if (user.role !== "hr") return <Panel title="Нет доступа"><p className="text-[13px] text-hero-muted">Редактор доступен только сотрудникам HR.</p></Panel>;

  function choose(article: KnowledgeArticleView) {
    setSelectedId(article.id);
    setCreating(false);
    setEntry(article.draft ?? article.published?.entry ?? null);
    setError(null);
  }

  function update(change: Partial<KbEntry>) {
    if (!currentEntry) return;
    setEntry({ ...currentEntry, ...change });
  }

  function updateSource(change: Partial<KbEntry["source"]>) {
    if (!currentEntry) return;
    setEntry({ ...currentEntry, source: { ...currentEntry.source, ...change } });
  }

  async function save() {
    if (!currentEntry) return;
    setBusy(true); setError(null);
    try {
      const result = creating
        ? await post<{ article: KnowledgeArticleView }>("/api/hr/knowledge", currentEntry)
        : await patch<{ article: KnowledgeArticleView }>(`/api/hr/knowledge/${selectedId}`, currentEntry);
      setSelectedId(result.article.id); setCreating(false); setEntry(result.article.draft);
      await list.reload();
      toast({ title: "Черновик сохранён", variant: "success" });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Не удалось сохранить статью.");
    } finally { setBusy(false); }
  }

  async function publish() {
    if (!selectedId) return;
    setBusy(true); setError(null);
    try {
      const result = await post<{ article: KnowledgeArticleView }>(`/api/hr/knowledge/${selectedId}`);
      setEntry(result.article.published?.entry ?? null);
      await list.reload();
      toast({ title: "Статья опубликована", description: "Al Jana теперь отвечает по новой версии.", variant: "success" });
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Не удалось опубликовать статью."); }
    finally { setBusy(false); }
  }

  async function restore(version: number) {
    if (!selectedId) return;
    setBusy(true); setError(null);
    try {
      const result = await post<{ article: KnowledgeArticleView }>(`/api/hr/knowledge/${selectedId}/restore`, { version });
      setEntry(result.article.draft);
      await list.reload();
      toast({ title: `Версия ${version} загружена в черновик`, description: "Опубликуйте её, чтобы заменить текущую версию.", variant: "success" });
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Не удалось восстановить версию."); }
    finally { setBusy(false); }
  }

  const preview = currentEntry;

  if (list.loading && !list.data) return <><PageHeader title="База знаний Al Jana" /><LoadingBlock rows={3} /></>;
  if (list.error && !list.data) return <><PageHeader title="База знаний Al Jana" /><ErrorBlock message={list.error.message} onRetry={list.reload} /></>;

  return <>
    <PageHeader title="База знаний Al Jana" description="Обновляйте ответы HR без помощи разработчиков. Черновики не видны сотрудникам, пока вы их не опубликуете." actions={<Link href="/assistant" className="text-[13px] font-medium text-hero-muted hover:text-hero-foreground">← AI Jana</Link>} />
    <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start">
      <Panel title="Статьи" description={`${articles.length} материалов`} padding="p-3">
        <Input label="Найти статью" placeholder="Например, отпуск или аванс" value={query} onChange={(event) => setQuery(event.target.value)} fullWidth />
        <Button className="mt-3" size="sm" variant="outline" fullWidth onClick={() => { setCreating(true); setSelectedId(null); setEntry(blankEntry()); setError(null); }}>＋ Новая статья</Button>
        <div className="mt-3 flex flex-col gap-1 max-h-[65vh] overflow-y-auto">
          {filtered.map((article) => <button key={article.id} onClick={() => choose(article)} className={`rounded-xl px-3 py-2.5 text-left hover:bg-hero-cell-bg transition-colors ${selectedId === article.id ? "bg-hero-cell-bg" : ""}`}>
            <span className="block text-[12.5px] font-medium text-hero-foreground leading-snug">{article.draft?.title ?? article.published?.entry.title ?? article.id}</span>
            <span className="mt-1 flex items-center gap-2 text-[11px] text-tertiary"><span>{article.published ? `Опубликована · v${article.published.version}` : "Не опубликована"}</span>{article.draft && <Pill tone="warn">Черновик</Pill>}</span>
          </button>)}
          {filtered.length === 0 && <p className="px-3 py-5 text-[12px] text-hero-muted">Ничего не найдено.</p>}
        </div>
      </Panel>

      <div className="flex flex-col gap-5 min-w-0">
        {!currentEntry && <Panel title="Выберите статью"><p className="text-[13px] text-hero-muted">Выберите материал слева или создайте новый.</p></Panel>}
        {currentEntry && <>
          <Panel title={creating ? "Новая статья" : "Содержание статьи"} description="Сначала сохраните черновик. Изменения станут доступны Al Jana только после публикации." actions={selected && <Pill tone={selected.draft ? "warn" : "good"}>{selected.draft ? "Есть черновик" : `Опубликована · v${selected.published?.version ?? 0}`}</Pill>}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input label="Заголовок статьи" value={currentEntry.title} maxLength={120} onChange={(e) => update({ title: e.target.value })} fullWidth />
              <Input label="ID статьи" hint="Латиница, цифры и дефис; после создания не меняется." value={currentEntry.id} disabled={!creating} onChange={(e) => update({ id: e.target.value })} fullWidth />
              <Textarea label="Примеры вопросов — по одному в строке" hint="Так Al Jana поймёт, когда показать этот ответ." value={lines(currentEntry.questions)} onChange={(e) => update({ questions: fromLines(e.target.value) })} rows={4} fullWidth />
              <Textarea label="Ключевые слова — по одному в строке" value={lines(currentEntry.keywords)} onChange={(e) => update({ keywords: fromLines(e.target.value) })} rows={4} fullWidth />
              <div className="lg:col-span-2"><Textarea label="Ответ Al Jana (английский)" hint="Пишите готовый ответ для сотрудника. Сохраняйте точные правила и цифры из утверждённого источника." value={currentEntry.answer} onChange={(e) => update({ answer: e.target.value })} rows={6} maxLength={6000} autoResize fullWidth /></div>
              <div className="lg:col-span-2"><Textarea label="Ответ Al Jana (русский)" hint="Показывается сотрудникам, которые задают вопрос на русском." value={currentEntry.answerRu ?? ""} onChange={(e) => update({ answerRu: e.target.value })} rows={6} maxLength={6000} autoResize fullWidth /></div>
            </div>
          </Panel>

          {selected && <p className="-mt-3 px-1 text-[11.5px] text-tertiary">Владелец статьи: <span className="font-medium text-hero-muted">{selected.owner.name}</span></p>}

          <Panel title="Источник ответа" description="Эти данные появятся по ссылке рядом с ответом Al Jana.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Код документа" value={currentEntry.source.docId} onChange={(e) => updateSource({ docId: e.target.value })} fullWidth />
              <Input label="Название документа" value={currentEntry.source.docTitle} onChange={(e) => updateSource({ docTitle: e.target.value })} fullWidth />
              <Input label="Раздел документа" hint="Например: §2.1 Ежегодный оплачиваемый отпуск" value={currentEntry.source.section} onChange={(e) => updateSource({ section: e.target.value })} fullWidth />
              <Input label="Редакция документа" value={currentEntry.source.revision} onChange={(e) => updateSource({ revision: e.target.value })} fullWidth />
              <Input label="Владелец исходного документа" value={currentEntry.source.owner} onChange={(e) => updateSource({ owner: e.target.value })} fullWidth />
            </div>
          </Panel>

          {preview && <Panel title="Предпросмотр для сотрудника" description="Пример того, как материал будет выглядеть в базе Al Jana.">
            <h3 className="text-[15px] font-semibold">{preview.title || "Заголовок статьи"}</h3>
            <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-hero-muted">{preview.answerRu || preview.answer || "Текст ответа появится здесь."}</p>
            <p className="mt-4 text-[11px] text-tertiary">Источник: {preview.source.docTitle || "Документ"} · {preview.source.section || "Раздел"}</p>
          </Panel>}

          {selected?.history.length ? <Panel title="История публикаций" description="Старая версия сначала загружается как черновик — её можно проверить и только потом опубликовать.">
            <ol className="flex flex-col divide-y divide-hero-border">{[...selected.history].reverse().map((version) => <li key={version.version} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div><p className="text-[13px] font-medium">Версия {version.version}{version.version === selected.published?.version ? " · текущая" : ""}</p><p className="text-[11px] text-tertiary mt-0.5">{new Date(version.publishedAt).toLocaleString("ru-RU")} · {version.editorName}</p></div>
              {version.version !== selected.published?.version && <Button size="sm" variant="outline" disabled={busy} onClick={() => void restore(version.version)}>Загрузить в черновик</Button>}
            </li>)}</ol>
          </Panel> : null}

          {error && <p role="alert" className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-[13px] text-error">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" disabled={busy} onClick={() => void save()}>{busy ? "Сохраняем…" : "Сохранить черновик"}</Button>
            {!creating && <Button disabled={busy || !selected?.draft} onClick={() => void publish()}>{busy ? "Публикуем…" : "Опубликовать"}</Button>}
          </div>
        </>}
      </div>
    </div>
  </>;
}

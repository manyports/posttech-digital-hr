"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KbEntry } from "@/lib/domain/types";
import { completeGeneratedSource, type GeneratedKnowledgeDraft } from "@/lib/assistant/knowledge-draft";
import type { KnowledgeArticleView } from "@/lib/server/services/knowledge-base";
import { ApiError, patch, post } from "@/lib/client/api";
import { useApi } from "@/lib/client/hooks";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Textarea } from "@/app/components/ui/Textarea";
import { Modal } from "@/app/components/ui/Modal";
import { ErrorBlock, LoadingBlock, Panel, PageHeader } from "@/app/components/portal/Panel";
import { Pill } from "@/app/components/portal/StatusBadge";
import { useToast } from "@/app/components/ui/Toast";
import { useUser } from "@/app/components/portal/UserContext";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateKnowledgeEntry } from "@/lib/assistant/reference-translations";

type ListResponse = { articles: KnowledgeArticleView[] };
const EMPTY_ARTICLES: KnowledgeArticleView[] = [];

const blankEntry = (editorName: string): KbEntry => ({
  id: `hr-${Date.now().toString(36)}`,
  title: "",
  questions: [""],
  keywords: [],
  answer: "",
  translations: {
    ru: { title: "", answer: "", questions: [""], keywords: [""], source: { docTitle: "", section: "", owner: editorName } },
    kk: { title: "", answer: "", questions: [""], keywords: [""], source: { docTitle: "", section: "", owner: editorName } },
  },
  source: { docId: "", docTitle: "", section: "", revision: `rev. ${new Date().toISOString().slice(0, 10)}`, owner: editorName },
});

function lines(values: string[]) { return values.join("\n"); }
function fromLines(value: string) { return value.split("\n").map((item) => item.trim()).filter(Boolean); }

export function KnowledgeEditor() {
  const user = useUser();
  const { m, locale } = useI18n();
  const copy = m.knowledge;
  const { toast } = useToast();
  const list = useApi<ListResponse>("/api/hr/knowledge");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [entry, setEntry] = useState<KbEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [filling, setFilling] = useState(false);
  const [fillStage, setFillStage] = useState(0);
  const [aiApplied, setAiApplied] = useState(false);
  const [aiSourceSuggested, setAiSourceSuggested] = useState(false);
  const fillTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => fillTimers.current.forEach(clearTimeout), []);

  const articles = list.data?.articles ?? EMPTY_ARTICLES;
  const selected = articles.find((article) => article.id === selectedId) ?? null;
  const filtered = useMemo(() => articles.filter((article) => {
    const published = article.published?.entry;
    const draft = article.draft;
    const text = `${published?.translations?.[locale]?.title ?? published?.title ?? ""} ${draft?.translations?.[locale]?.title ?? draft?.title ?? ""} ${article.id}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }), [articles, query, locale]);
  const currentEntry = entry ?? selected?.draft ?? selected?.published?.entry ?? null;

  if (user.role !== "hr") return <Panel title={m.common.deniedTitle}><p className="text-[13px] text-hero-muted">{copy.accessDenied}</p></Panel>;

  function choose(article: KnowledgeArticleView) {
    fillTimers.current.forEach(clearTimeout);
    fillTimers.current = [];
    setFillStage(0); setAiApplied(false); setAiSourceSuggested(false); setFilling(false);
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

  function updateArticleId(id: string) {
    if (!currentEntry) return;
    const oldInternalId = `KB-${currentEntry.id.toUpperCase()}`;
    update({
      id,
      source: currentEntry.source.docId === oldInternalId
        ? { ...currentEntry.source, docId: `KB-${id.toUpperCase()}` }
        : currentEntry.source,
    });
  }

  function updateTranslation(language: "ru" | "kk", change: Partial<NonNullable<KbEntry["translations"]>["ru"]>) {
    if (!currentEntry) return;
    const translations = currentEntry.translations ?? translateKnowledgeEntry(currentEntry);
    const nextLocale = { ...translations[language], ...change };
    const next = { ...translations, [language]: nextLocale };
    update({
      translations: next,
      ...(language === "ru" ? {
        title: nextLocale.title,
        answer: nextLocale.answer,
        answerRu: nextLocale.answer,
        source: { ...currentEntry.source, ...nextLocale.source },
      } : {}),
    });
  }

  function updateTranslationSource(language: "ru" | "kk", change: Partial<NonNullable<KbEntry["translations"]>["ru"]["source"]>) {
    if (!currentEntry) return;
    const translations = currentEntry.translations ?? translateKnowledgeEntry(currentEntry);
    updateTranslation(language, { source: { ...translations[language].source, ...change } });
  }

  async function generateDraft() {
    if (!currentEntry || aiText.trim().length < 20 || generating) return;
    setGenerating(true); setAiError(null);
    try {
      const { draft } = await post<{ draft: GeneratedKnowledgeDraft }>("/api/hr/knowledge/generate", { text: aiText });
      const source = completeGeneratedSource(draft, currentEntry.id, user.fullName, new Date().toISOString().slice(0, 10));
      setAiSourceSuggested(!draft.docId.trim() || !draft.revision.trim() || (["ru", "kk"] as const).some((language) => !draft[language].source.docTitle.trim() || !draft[language].source.section.trim()));
      setAiOpen(false);
      setAiApplied(true);
      setFilling(true);
      setError(null);
      fillTimers.current.forEach(clearTimeout);
      fillTimers.current = [
        setTimeout(() => {
          setFillStage(1);
          setEntry((previous) => previous && {
            ...previous,
            title: draft.ru.title,
            questions: [...draft.ru.questions, ...draft.kk.questions],
            keywords: [...draft.ru.keywords, ...draft.kk.keywords],
            translations: {
              ru: { ...draft.ru, answer: previous.translations?.ru.answer ?? "", source: previous.translations?.ru.source ?? source.ru },
              kk: { ...draft.kk, answer: previous.translations?.kk.answer ?? "", source: previous.translations?.kk.source ?? source.kk },
            },
          });
        }, 280),
        setTimeout(() => {
          setFillStage(2);
          setEntry((previous) => previous && {
            ...previous,
            answer: draft.ru.answer,
            answerRu: draft.ru.answer,
            translations: {
              ru: { ...previous.translations!.ru, answer: draft.ru.answer },
              kk: { ...previous.translations!.kk, answer: draft.kk.answer },
            },
          });
        }, 620),
        setTimeout(() => {
          setFillStage(3);
          setEntry((previous) => previous && {
            ...previous,
            source: { docId: source.docId, revision: source.revision, ...source.ru },
            translations: {
              ru: { ...previous.translations!.ru, source: source.ru },
              kk: { ...previous.translations!.kk, source: source.kk },
            },
          });
        }, 980),
        setTimeout(() => { setFillStage(0); setFilling(false); }, 1550),
      ];
      toast({ title: copy.aiApplied, variant: "success" });
    } catch (error) {
      setAiError(error instanceof ApiError && error.status === 429 ? copy.aiRateLimited : copy.aiError);
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!currentEntry) return;
    if (!currentEntry.source.docId.trim() || !currentEntry.source.revision.trim()) {
      setError(copy.aiReviewSource);
      return;
    }
    const translations = currentEntry.translations;
    if (!translations || (["ru", "kk"] as const).some((language) => {
      const copy = translations[language];
      return !copy.title.trim() || !copy.answer.trim() || !copy.questions.some((item) => item.trim()) || !copy.keywords.some((item) => item.trim()) || !copy.source.docTitle.trim() || !copy.source.section.trim();
    })) {
      setError(copy.translationsRequired);
      return;
    }
    setBusy(true); setError(null);
    try {
      const result = creating
        ? await post<{ article: KnowledgeArticleView }>("/api/hr/knowledge", currentEntry)
        : await patch<{ article: KnowledgeArticleView }>(`/api/hr/knowledge/${selectedId}`, currentEntry);
      setSelectedId(result.article.id); setCreating(false); setEntry(result.article.draft);
      await list.reload();
      toast({ title: copy.draftSaved, variant: "success" });
    } catch {
      setError(copy.saveFail);
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
    } catch { setError(copy.publishFail); }
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
    } catch { setError(copy.restoreFail); }
    finally { setBusy(false); }
  }

  const preview = currentEntry;
  const previewTranslation = preview
    ? preview.translations?.[locale] ?? translateKnowledgeEntry(preview)[locale]
    : null;

  if (list.loading && !list.data) return <><PageHeader title={copy.title} /><LoadingBlock rows={3} /></>;
  if (list.error && !list.data) return <><PageHeader title={copy.title} /><ErrorBlock message={list.error.message} onRetry={list.reload} /></>;

  return <>
    <PageHeader title={copy.title} actions={<Link href="/assistant" className="text-[13px] font-medium text-hero-muted hover:text-hero-foreground">← {copy.back}</Link>} />
    <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start">
      <Panel title={copy.articles} padding="p-3">
        <Input label={copy.search} placeholder={copy.searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} fullWidth />
        <Button className="mt-3" size="sm" variant="outline" fullWidth disabled={generating || filling} onClick={() => { fillTimers.current.forEach(clearTimeout); setFillStage(0); setAiApplied(false); setAiSourceSuggested(false); setCreating(true); setSelectedId(null); setEntry(blankEntry(user.fullName)); setError(null); }}>＋ {copy.newArticle}</Button>
        <div className="mt-3 flex flex-col gap-1 max-h-[65vh] overflow-y-auto">
          {filtered.map((article) => <button key={article.id} disabled={generating || filling} onClick={() => choose(article)} className={`rounded-xl px-3 py-2.5 text-left hover:bg-hero-cell-bg transition-colors disabled:opacity-50 ${selectedId === article.id ? "bg-hero-cell-bg" : ""}`}>
            <span className="block text-[12.5px] font-medium text-hero-foreground leading-snug">{article.draft?.translations?.[locale]?.title ?? article.draft?.title ?? article.published?.entry.translations?.[locale]?.title ?? article.published?.entry.title ?? article.id}</span>
            <span className="mt-1 flex items-center gap-2 text-[11px] text-tertiary"><span>{article.published ? `${copy.published} · v${article.published.version}` : copy.unpublished}</span>{article.draft && <Pill tone="warn">{copy.draft}</Pill>}</span>
          </button>)}
          {filtered.length === 0 && <p className="px-3 py-5 text-[12px] text-hero-muted">{copy.noArticles}</p>}
        </div>
      </Panel>

      <div className="flex flex-col gap-5 min-w-0">
        {!currentEntry && <Panel title={copy.chooseArticle}><p className="text-[13px] text-hero-muted">{copy.chooseOrCreate}</p></Panel>}
        {currentEntry && <>
          <Panel title={creating ? copy.newTitle : copy.content} actions={<div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" disabled={busy || generating || filling} onClick={() => { setAiError(null); setAiOpen(true); }}>✦ {copy.aiButton}</Button>{selected && <Pill tone={selected.draft ? "warn" : "good"}>{selected.draft ? copy.draft : `${copy.published} · v${selected.published?.version ?? 0}`}</Pill>}</div>}>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${fillStage === 1 ? "ai-fill-group" : ""}`}>
              <Input label={copy.titleRu} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).ru.title} maxLength={120} onChange={(e) => updateTranslation("ru", { title: e.target.value })} fullWidth />
              <Input label={copy.titleKk} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).kk.title} maxLength={120} onChange={(e) => updateTranslation("kk", { title: e.target.value })} fullWidth />
              <Input label={copy.idLabel} hint={copy.idHint} value={currentEntry.id} disabled={!creating} onChange={(e) => updateArticleId(e.target.value)} fullWidth />
              <Textarea label={copy.questionsRu} hint={copy.questionsHint} value={lines((currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).ru.questions)} onChange={(e) => updateTranslation("ru", { questions: fromLines(e.target.value) })} rows={4} fullWidth />
              <Textarea label={copy.questionsKk} hint={copy.questionsHint} value={lines((currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).kk.questions)} onChange={(e) => updateTranslation("kk", { questions: fromLines(e.target.value) })} rows={4} fullWidth />
              <Textarea label={copy.keywordsRu} value={lines((currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).ru.keywords)} onChange={(e) => updateTranslation("ru", { keywords: fromLines(e.target.value) })} rows={4} fullWidth />
              <Textarea label={copy.keywordsKk} value={lines((currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).kk.keywords)} onChange={(e) => updateTranslation("kk", { keywords: fromLines(e.target.value) })} rows={4} fullWidth />
              <div className={`lg:col-span-2 ${fillStage === 2 ? "ai-fill-group" : ""}`}><Textarea label={copy.answerRu} hint={copy.answerHint} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).ru.answer} onChange={(e) => updateTranslation("ru", { answer: e.target.value })} rows={6} maxLength={6000} autoResize fullWidth /></div>
              <div className={`lg:col-span-2 ${fillStage === 2 ? "ai-fill-group" : ""}`}><Textarea label={copy.answerKk} hint={copy.answerHint} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).kk.answer} onChange={(e) => updateTranslation("kk", { answer: e.target.value })} rows={6} maxLength={6000} autoResize fullWidth /></div>
            </div>
          </Panel>

          <p className="-mt-3 px-1 text-[11.5px] text-tertiary">{copy.ownerLabel}: <span className="font-medium text-hero-muted">{selected?.owner.name ?? user.fullName}</span></p>

          {aiApplied && aiSourceSuggested && <p role="status" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-[13px] text-hero-muted">{copy.aiReviewSource}</p>}
          <Panel title={copy.source} className={fillStage === 3 ? "ai-fill-group" : ""}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={copy.documentId} value={currentEntry.source.docId} onChange={(e) => updateSource({ docId: e.target.value })} fullWidth />
              <Input label={copy.documentTitleRu} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).ru.source.docTitle} onChange={(e) => updateTranslationSource("ru", { docTitle: e.target.value })} fullWidth />
              <Input label={copy.documentTitleKk} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).kk.source.docTitle} onChange={(e) => updateTranslationSource("kk", { docTitle: e.target.value })} fullWidth />
              <Input label={copy.sectionRu} hint={copy.sectionHint} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).ru.source.section} onChange={(e) => updateTranslationSource("ru", { section: e.target.value })} fullWidth />
              <Input label={copy.sectionKk} hint={copy.sectionHint} value={(currentEntry.translations ?? translateKnowledgeEntry(currentEntry)).kk.source.section} onChange={(e) => updateTranslationSource("kk", { section: e.target.value })} fullWidth />
              <Input label={copy.revision} value={currentEntry.source.revision} onChange={(e) => updateSource({ revision: e.target.value })} fullWidth />
            </div>
          </Panel>

          {preview && <Panel title={copy.preview}>
            <h3 className="text-[15px] font-semibold">{previewTranslation?.title || copy.articleHeading}</h3>
            <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-hero-muted">{previewTranslation?.answer || copy.answerPlaceholder}</p>
            <p className="mt-4 text-[11px] text-tertiary">{copy.sourceLabel}: {previewTranslation?.source.docTitle || copy.documentTitle} · {previewTranslation?.source.section || copy.section}</p>
          </Panel>}

          {selected?.history.length ? <Panel title={copy.history}>
            <ol className="flex flex-col divide-y divide-hero-border">{[...selected.history].reverse().map((version) => <li key={version.version} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div><p className="text-[13px] font-medium">{copy.versionLabel} {version.version}{version.version === selected.published?.version ? ` · ${copy.current}` : ""}</p><p className="text-[11px] text-tertiary mt-0.5">{new Intl.DateTimeFormat(locale === "kk" ? "kk-KZ" : "ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.publishedAt))} · {version.editorName}</p></div>
              {version.version !== selected.published?.version && <Button size="sm" variant="outline" disabled={busy} onClick={() => void restore(version.version)}>{copy.restore}</Button>}
            </li>)}</ol>
          </Panel> : null}

          {error && <p role="alert" className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-[13px] text-error">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" disabled={busy || generating || filling} onClick={() => void save()}>{busy ? copy.saving : copy.saveDraft}</Button>
            {!creating && <Button disabled={busy || generating || filling || !selected?.draft} onClick={() => void publish()}>{busy ? copy.publishing : copy.publish}</Button>}
          </div>
        </>}
      </div>
    </div>
    <Modal open={aiOpen} onClose={() => { if (!generating) setAiOpen(false); }} title={copy.aiTitle} description={copy.aiDescription} actions={<><Button variant="outline" disabled={generating} onClick={() => setAiOpen(false)}>{copy.aiCancel}</Button><Button disabled={generating || aiText.trim().length < 20} onClick={() => void generateDraft()}>{generating ? copy.aiGenerating : copy.aiGenerate}</Button></>}>
      <Textarea label={copy.aiInput} value={aiText} onChange={(event) => setAiText(event.target.value)} maxLength={20000} rows={10} placeholder={copy.aiPlaceholder} fullWidth />
      <p className="mt-3 text-[12px] leading-relaxed text-tertiary">{copy.aiPrivacy}</p>
      {aiError && <p role="alert" className="mt-3 text-[13px] text-error">{aiError}</p>}
    </Modal>
  </>;
}

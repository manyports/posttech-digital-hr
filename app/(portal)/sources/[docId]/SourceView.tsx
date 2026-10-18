"use client";

import Link from "next/link";
import type { KbEntry } from "@/lib/domain/types";
import { KB_ANSWERS_RU } from "@/lib/assistant/translations";
import { translateKnowledgeEntry } from "@/lib/assistant/reference-translations";
import { sourceSectionId } from "@/lib/assistant/source-links";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { PageHeader } from "@/app/components/portal/Panel";
import { ArrowRightIcon, DocIcon } from "@/app/components/portal/icons";

export function SourceView({ entries }: { entries: KbEntry[] }) {
  const { m, locale } = useI18n();
  const source = entries[0].source;
  const sourceCopy = entries[0].translations?.[locale]?.source ?? translateKnowledgeEntry(entries[0])[locale].source;
  const sections = [...new Map(entries.map((entry) => [entry.source.section, entry])).values()];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={sourceCopy.docTitle}
        actions={(
          <Link href="/assistant" className="inline-flex items-center gap-2 rounded-lg border border-hero-border px-3 py-2 text-[13px] font-medium text-hero-foreground hover:bg-hero-cell-bg transition-colors">
            {m.common.back} <ArrowRightIcon size={14} className="rotate-180" />
          </Link>
        )}
      />

      <section aria-label={m.knowledge.source} className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-hero-border bg-hero-elevated px-4 py-3 text-[12px] text-hero-muted">
        <span className="inline-flex items-center gap-2 font-semibold text-hero-foreground"><DocIcon size={14} />{source.docId}</span>
        <span>{source.revision}</span>
        <span>{sourceCopy.owner}</span>
      </section>

      {sections.length > 1 && (
        <nav aria-label={m.knowledge.sections} className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <a key={section.source.section} href={`#${sourceSectionId(section.source.section)}`} className="rounded-full border border-hero-border px-3 py-1.5 text-[12px] text-hero-muted hover:text-hero-foreground hover:bg-hero-cell-bg transition-colors">
              {section.translations?.[locale]?.source.section ?? translateKnowledgeEntry(section)[locale].source.section}
            </a>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4">
        {sections.map((section) => {
          const sectionEntries = entries.filter((entry) => entry.source.section === section.source.section);
          return (
            <section key={section.source.section} id={sourceSectionId(section.source.section)} className="scroll-mt-24 rounded-2xl border border-hero-border bg-hero-elevated target:ring-2 target:ring-primary/30">
              <h2 className="border-b border-hero-border px-5 py-4 text-[15px] font-semibold text-hero-foreground">{section.translations?.[locale]?.source.section ?? translateKnowledgeEntry(section)[locale].source.section}</h2>
              <div className="divide-y divide-hero-border">
                {sectionEntries.map((entry) => (
                  <article key={entry.id} className="px-5 py-5 sm:px-6">
                    <h3 className="text-[14px] font-semibold leading-snug text-hero-foreground">{entry.translations?.[locale]?.title ?? translateKnowledgeEntry(entry)[locale].title}</h3>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap text-[13.5px] leading-[1.75] text-hero-muted">
                      {entry.translations?.[locale]?.answer ?? (locale === "ru" ? entry.answerRu ?? KB_ANSWERS_RU[entry.id] : entry.answer)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getPublishedKnowledgeBase } from "@/lib/server/services/knowledge-base";
import { sourceSectionId } from "@/lib/assistant/source-links";
import { KB_ANSWERS_RU } from "@/lib/assistant/translations";
import { PageHeader, Panel } from "../../../components/portal/Panel";

export default async function SourcePage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  const entries = (await getPublishedKnowledgeBase()).filter((entry) => entry.source.docId === docId);
  if (entries.length === 0) notFound();

  const source = entries[0].source;
  const sections = [...new Map(entries.map((entry) => [entry.source.section, entry])).values()];

  return (
    <>
      <PageHeader
        title={source.docTitle}
        description={`${source.docId} · ${source.revision} · ${source.owner}`}
      />

      <Panel
        title="Материалы источника"
        description="Переход из ответа Al Jana открывает этот документ на указанном разделе."
      >
        <p className="text-[13px] leading-relaxed text-hero-muted">
          Ниже собраны подготовленные фрагменты базы знаний, на которых основаны ответы ассистента.
          Выбранный раздел выделяется при переходе по ссылке из ответа.
        </p>
      </Panel>

      <div className="flex flex-col gap-4">
        {sections.map((section) => {
          const sectionEntries = entries.filter((entry) => entry.source.section === section.source.section);
          return (
            <Panel key={section.source.section} padding="p-0">
              <section
                id={sourceSectionId(section.source.section)}
                className="scroll-mt-24 rounded-xl target:bg-primary/5 target:ring-2 target:ring-primary/30"
              >
                <h2 className="px-5 py-4 border-b border-hero-border text-[15px] font-semibold text-hero-foreground">
                  {section.source.section}
                </h2>
                <div className="divide-y divide-hero-border">
                  {sectionEntries.map((entry) => (
                    <article key={entry.id} className="px-5 py-4">
                      <h3 className="text-[13.5px] font-semibold text-hero-foreground">{entry.title}</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-hero-muted">
                      {entry.answerRu ?? KB_ANSWERS_RU[entry.id] ?? entry.answer}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

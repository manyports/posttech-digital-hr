import { z } from "zod";

const source = z.object({
  docTitle: z.string().max(160),
  section: z.string().max(160),
});

const translation = z.object({
  title: z.string().min(1).max(120),
  questions: z.array(z.string().min(1).max(200)).min(1).max(6),
  keywords: z.array(z.string().min(1).max(80)).min(1).max(12),
  answer: z.string().min(3).max(6000),
  source,
});

export const knowledgeDraftSchema = z.object({
  ru: translation,
  kk: translation,
  docId: z.string().max(80),
  revision: z.string().max(80),
});

export type GeneratedKnowledgeDraft = z.infer<typeof knowledgeDraftSchema>;

export function completeGeneratedSource(draft: GeneratedKnowledgeDraft, articleId: string, editorName: string, date: string) {
  const internalId = `KB-${articleId.toUpperCase()}`;
  return {
    docId: draft.docId.trim() || internalId,
    revision: draft.revision.trim() || `rev. ${date}`,
    ru: {
      docTitle: draft.ru.source.docTitle.trim() || `Материал HR: ${draft.ru.title}`,
      section: draft.ru.source.section.trim() || "Статья базы знаний",
      owner: editorName,
    },
    kk: {
      docTitle: draft.kk.source.docTitle.trim() || `HR материалы: ${draft.kk.title}`,
      section: draft.kk.source.section.trim() || "Білім базасының мақаласы",
      owner: editorName,
    },
  };
}

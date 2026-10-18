import { notFound } from "next/navigation";
import { getPublishedKnowledgeBase } from "@/lib/server/services/knowledge-base";
import { SourceView } from "./SourceView";

export default async function SourcePage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  const entries = (await getPublishedKnowledgeBase()).filter((entry) => entry.source.docId === docId);
  if (entries.length === 0) notFound();

  return <SourceView entries={entries} />;
}

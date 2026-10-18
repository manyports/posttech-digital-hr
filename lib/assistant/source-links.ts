import type { KbSource } from "../domain/types";

export function sourceSectionId(section: string): string {
  return section
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^§\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sourceHref(source: KbSource): string {
  return `/sources/${encodeURIComponent(source.docId)}#${sourceSectionId(source.section)}`;
}

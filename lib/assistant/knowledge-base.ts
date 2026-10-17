/** Al Jana knowledge base data is kept outside executable code. */
import data from "./knowledge-base.json";
import type { KbEntry } from "../domain/types";

export const KB = data as KbEntry[];

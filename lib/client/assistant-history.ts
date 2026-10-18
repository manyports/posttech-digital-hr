export interface StoredAssistantChat<Message> {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

const STORAGE_VERSION = 1;
const MAX_CHATS = 40;

function storageKey(userId: string): string {
  return `digital-hr:assistant-history:v${STORAGE_VERSION}:${encodeURIComponent(userId)}`;
}

export function readAssistantChats<Message>(userId: string): StoredAssistantChat<Message>[] {
  const raw = localStorage.getItem(storageKey(userId));
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((chat): chat is StoredAssistantChat<Message> =>
    !!chat &&
    typeof chat === "object" &&
    typeof chat.id === "string" &&
    typeof chat.title === "string" &&
    typeof chat.updatedAt === "number" &&
    Array.isArray(chat.messages),
  ).slice(0, MAX_CHATS);
}

export function writeAssistantChats<Message>(userId: string, chats: StoredAssistantChat<Message>[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(chats.slice(0, MAX_CHATS)));
}

export function newAssistantChatId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

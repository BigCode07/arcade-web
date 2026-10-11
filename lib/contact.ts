import { parseJson, readRaw, writeRaw } from "./scores";

export type ContactMessage = {
  name: string;
  email: string;
  msg: string;
  at: number;
};

export const MESSAGES_KEY = "av_messages";
export const MAX_MESSAGES = 20;

function toMessages(value: unknown): ContactMessage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is ContactMessage =>
      typeof v === "object" &&
      v !== null &&
      typeof v.name === "string" &&
      typeof v.email === "string" &&
      typeof v.msg === "string" &&
      typeof v.at === "number",
  );
}

/** Guarda el mensaje al inicio de la lista, recortada a `MAX_MESSAGES`. No lo envía a ningún lado. */
export function addMessage(entry: Omit<ContactMessage, "at">): void {
  const current = toMessages(parseJson(readRaw(MESSAGES_KEY)));
  const next = [{ ...entry, at: Date.now() }, ...current].slice(0, MAX_MESSAGES);
  writeRaw(MESSAGES_KEY, JSON.stringify(next));
}

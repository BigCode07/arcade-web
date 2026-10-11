import type { Game } from "./games";

export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  date: string; // "dd/mm/aaaa"
};
export type LocalScore = {
  game: string;
  score: number;
  name: string;
  at: number; // Date.now()
};
export type Session = { name: string };

export type PersonalBest = { rank: number; score: number; date: string };

export const USER_KEY = "av_user";
export const SCORES_KEY = "av_scores";
export const MAX_NAME_LENGTH = 10;

const PLAYERS = [
  "PX_KAI", "NEONFOX", "Z3R0COOL", "M00NRYU", "VAULT_07", "GLITCHA",
  "ATARI_KID", "CYBER_LU", "MAGENTA88", "SCANLINE", "BIT_LORD", "ARKADYA",
  "DROID_X", "RGB_QUEEN", "PIXEL_DAD", "RETROVIRA", "VECTORX", "JOY_STK",
];

const MOCK_ROWS = 12;

/* ===== ranking ===== */

// FNV-1a de 32 bits: semilla estable derivada del id completo del juego.
export function hashId(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Filas mock deterministas: el #1 vale exactamente game.best.
export function seededScores(game: Game, count: number = MOCK_ROWS): ScoreRow[] {
  let s = hashId(game.id) % 233280;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;

  const used = new Set<string>();
  const raw: { name: string; score: number; date: string }[] = [];
  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = PLAYERS[Math.floor(rand() * PLAYERS.length)];
    } while (used.has(name) && used.size < PLAYERS.length);
    used.add(name);
    const base = Math.floor(50000 + rand() * 250000);
    const score = base - i * Math.floor(2000 + rand() * 4000);
    const day = pad2(1 + Math.floor(rand() * 28));
    const mon = pad2(1 + Math.floor(rand() * 12));
    raw.push({ name, score: Math.max(score, 1000), date: `${day}/${mon}/2026` });
  }

  raw.sort((a, b) => b.score - a.score);
  const factor = game.best / raw[0].score;
  return raw.map((r, i) => ({
    rank: i + 1,
    name: r.name,
    score: i === 0 ? game.best : Math.max(1, Math.floor(r.score * factor)),
    date: r.date,
  }));
}

// Ranking completo de un juego: filas mock + puntajes locales de ese juego.
export function mergeScores(game: Game, locals: LocalScore[]): ScoreRow[] {
  const mock = seededScores(game).map((r) => ({ ...r, order: 0 }));
  const own = locals
    .filter((l) => l.game === game.id)
    .map((l) => ({
      rank: 0,
      name: l.name,
      score: l.score,
      date: formatDate(l.at),
      order: l.at,
    }));

  return [...mock, ...own]
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map(({ name, score, date }, i) => ({ rank: i + 1, name, score, date }));
}

export function personalBest(
  game: Game,
  locals: LocalScore[],
  session: Session,
): PersonalBest | null {
  let best: LocalScore | null = null;
  for (const l of locals) {
    if (l.game === game.id && l.name === session.name) {
      if (!best || l.score > best.score) best = l;
    }
  }
  if (!best) return null;
  const mark = best;
  const ahead = mergeScores(game, locals).filter((r) => r.score > mark.score).length;
  return { rank: 1 + ahead, score: mark.score, date: formatDate(mark.at) };
}

/* ===== persistencia (localStorage con fallback en memoria) ===== */

const memory = new Map<string, string>();

export function readRaw(key: string): string | null {
  try {
    const v = window.localStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    // localStorage bloqueado: se usa memoria
  }
  return memory.get(key) ?? null;
}

export function writeRaw(key: string, value: string | null): void {
  if (value === null) memory.delete(key);
  else memory.set(key, value);
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // sin persistencia: el valor queda solo en memoria
  }
}

export function parseJson(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function toSession(value: unknown): Session | null {
  if (typeof value !== "object" || value === null) return null;
  const name = (value as { name?: unknown }).name;
  return typeof name === "string" && name.length > 0 ? { name } : null;
}

function toScores(value: unknown): LocalScore[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is LocalScore =>
      typeof v === "object" &&
      v !== null &&
      typeof v.game === "string" &&
      typeof v.score === "number" &&
      typeof v.name === "string" &&
      typeof v.at === "number",
  );
}

/* ===== store externo (useSyncExternalStore) ===== */

const EMPTY_SCORES: LocalScore[] = [];

let userCache: Session | null | undefined;
let scoresCache: LocalScore[] | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function onStorage() {
  userCache = undefined;
  scoresCache = undefined;
  emit();
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getUserSnapshot(): Session | null {
  if (userCache === undefined) userCache = toSession(parseJson(readRaw(USER_KEY)));
  return userCache;
}

export function getScoresSnapshot(): LocalScore[] {
  if (scoresCache === undefined) scoresCache = toScores(parseJson(readRaw(SCORES_KEY)));
  return scoresCache;
}

export const getServerUserSnapshot = (): Session | null => null;
export const getServerScoresSnapshot = (): LocalScore[] => EMPTY_SCORES;

export function setUser(user: Session | null): void {
  userCache = user;
  writeRaw(USER_KEY, user ? JSON.stringify(user) : null);
  emit();
}

export function addScore(entry: Omit<LocalScore, "at">): void {
  const next = [...getScoresSnapshot(), { ...entry, at: Date.now() }];
  scoresCache = next;
  writeRaw(SCORES_KEY, JSON.stringify(next));
  emit();
}

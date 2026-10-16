import type { ReviewItem } from '../engine/review';

/**
 * IndexedDB database "curious-minds".
 *
 * Version history (bump DB_VERSION and add a step in `migrate` in db.ts for each change):
 *   v1 — stores: sessions, items, records, meta
 *
 * Export files carry EXPORT_SCHEMA. Importers accept any schema <= EXPORT_SCHEMA and upgrade it in `upgradeExport`.
 */
export const DB_NAME = 'curious-minds';
export const DB_VERSION = 1;
export const EXPORT_SCHEMA = 1;

export const STORES = ['sessions', 'items', 'records', 'meta'] as const;
export type StoreName = (typeof STORES)[number];

/** One completed round. Kept small: no answer text beyond short labels. */
export interface SessionRecord {
  id: string;
  gameId: string;
  mode: string;
  difficulty?: number;
  startedAt: number;
  durationMs: number;
  score: number;
  correct: number;
  attempted: number;
  /** Game-specific numbers worth charting, e.g. { longestChain: 9 }. */
  stats?: Record<string, number>;
  /** Region accuracy for world games: { Europe: [3, 4] } = 3 of 4 correct. */
  breakdown?: Record<string, [number, number]>;
}

/** Best score per game and mode. key = `${gameId}:${mode}`. */
export interface RecordEntry {
  key: string;
  gameId: string;
  mode: string;
  best: number;
  bestAt: number;
  plays: number;
}

export interface Settings {
  sound: boolean;
  /** 'system' follows prefers-reduced-motion. */
  motion: 'system' | 'reduced' | 'full';
  /** Default to relaxed (untimed) modes where a game offers them. */
  relaxedByDefault: boolean;
  /** Last mode/difficulty chosen per game, so "Play" restarts what you like. */
  gamePrefs: Record<string, { mode?: string; difficulty?: number; option?: string }>;
}

export interface Profile {
  firstSeen: number;
  /** Distinct local days with at least one finished round (YYYY-MM-DD). Never shown as a breakable streak. */
  days: string[];
  /** Most recent first. */
  recentGames: { gameId: string; at: number }[];
  /** Recently served content ids per game, to avoid repeats. Capped per game. */
  recentContent: Record<string, string[]>;
}

export type MetaRecord =
  | { key: 'settings'; value: Settings }
  | { key: 'profile'; value: Profile };

export interface ExportFile {
  app: 'curious-minds';
  schema: number;
  exportedAt: string;
  data: {
    sessions: SessionRecord[];
    items: ReviewItem[];
    records: RecordEntry[];
    settings: Settings;
    profile: Profile;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  sound: false,
  motion: 'system',
  relaxedByDefault: false,
  gamePrefs: {},
};

export function defaultProfile(now = Date.now()): Profile {
  return { firstSeen: now, days: [], recentGames: [], recentContent: {} };
}

/* ---------------- validation ---------------- */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';

export function validSession(v: unknown): v is SessionRecord {
  return (
    isObj(v) && isStr(v.id) && isStr(v.gameId) && isStr(v.mode) && isNum(v.startedAt) &&
    isNum(v.durationMs) && isNum(v.score) && isNum(v.correct) && isNum(v.attempted)
  );
}

export function validItem(v: unknown): v is ReviewItem {
  return (
    isObj(v) && isStr(v.key) && isStr(v.gameId) && isStr(v.label) && isNum(v.box) && isNum(v.due) &&
    isNum(v.seen) && isNum(v.correct) && isNum(v.wrong) && isNum(v.lastSeen) &&
    (v.lastResult === 'correct' || v.lastResult === 'wrong' || v.lastResult === 'partial')
  );
}

export function validRecord(v: unknown): v is RecordEntry {
  return isObj(v) && isStr(v.key) && isStr(v.gameId) && isStr(v.mode) && isNum(v.best) && isNum(v.bestAt) && isNum(v.plays);
}

/** Repair settings from untrusted input: keep known fields with the right types, default the rest. */
export function sanitizeSettings(v: unknown): Settings {
  const s: Settings = { ...DEFAULT_SETTINGS, gamePrefs: {} };
  if (!isObj(v)) return s;
  if (typeof v.sound === 'boolean') s.sound = v.sound;
  if (v.motion === 'system' || v.motion === 'reduced' || v.motion === 'full') s.motion = v.motion;
  if (typeof v.relaxedByDefault === 'boolean') s.relaxedByDefault = v.relaxedByDefault;
  if (isObj(v.gamePrefs)) {
    for (const [k, p] of Object.entries(v.gamePrefs)) {
      if (!isObj(p)) continue;
      s.gamePrefs[k] = {
        mode: isStr(p.mode) ? p.mode : undefined,
        difficulty: isNum(p.difficulty) ? p.difficulty : undefined,
        option: isStr(p.option) ? p.option : undefined,
      };
    }
  }
  return s;
}

export function sanitizeProfile(v: unknown): Profile {
  const p = defaultProfile();
  if (!isObj(v)) return p;
  if (isNum(v.firstSeen)) p.firstSeen = v.firstSeen;
  if (Array.isArray(v.days)) p.days = [...new Set(v.days.filter(isStr).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort();
  if (Array.isArray(v.recentGames)) {
    p.recentGames = v.recentGames
      .filter((r): r is { gameId: string; at: number } => isObj(r) && isStr(r.gameId) && isNum(r.at))
      .slice(0, 20);
  }
  if (isObj(v.recentContent)) {
    for (const [k, ids] of Object.entries(v.recentContent)) {
      if (Array.isArray(ids)) p.recentContent[k] = ids.filter(isStr).slice(0, 200);
    }
  }
  return p;
}

export type ParseResult =
  | { ok: true; file: ExportFile; skipped: number }
  | { ok: false; error: string };

/** Parse and validate an export file. Invalid rows are skipped and counted rather than failing the whole import. */
export function parseExport(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file isn't valid JSON. Choose a file exported from Curious Minds." };
  }
  if (!isObj(raw) || raw.app !== 'curious-minds') {
    return { ok: false, error: "This file wasn't exported from Curious Minds." };
  }
  if (!isNum(raw.schema) || raw.schema < 1) return { ok: false, error: 'The file is missing its version number.' };
  if (raw.schema > EXPORT_SCHEMA) {
    return { ok: false, error: 'This file comes from a newer version of Curious Minds. Refresh the page to update, then try again.' };
  }
  const data = isObj(raw.data) ? raw.data : {};
  let skipped = 0;
  const filter = <T>(arr: unknown, ok: (v: unknown) => v is T): T[] => {
    if (!Array.isArray(arr)) return [];
    const out: T[] = [];
    for (const v of arr) (ok(v) ? out.push(v) : skipped++);
    return out;
  };
  const file: ExportFile = {
    app: 'curious-minds',
    schema: EXPORT_SCHEMA,
    exportedAt: isStr(raw.exportedAt) ? raw.exportedAt : new Date().toISOString(),
    data: {
      sessions: filter(data.sessions, validSession),
      items: filter(data.items, validItem),
      records: filter(data.records, validRecord),
      settings: sanitizeSettings(data.settings),
      profile: sanitizeProfile(data.profile),
    },
  };
  return { ok: true, file, skipped };
}

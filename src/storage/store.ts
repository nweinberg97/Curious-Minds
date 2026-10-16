import { applyReview, dueItems, mergeReview, type ReviewItem, type ReviewUpdate } from '../engine/review';
import { dayKey } from '../engine/random';
import type { Backend } from './db';
import {
  DEFAULT_SETTINGS,
  EXPORT_SCHEMA,
  defaultProfile,
  sanitizeProfile,
  sanitizeSettings,
  validItem,
  validRecord,
  validSession,
  type ExportFile,
  type Profile,
  type RecordEntry,
  type SessionRecord,
  type Settings,
} from './schema';

const MAX_SESSIONS = 3000;
const RECENT_CONTENT_CAP = 200;

export interface RoundInput {
  gameId: string;
  mode: string;
  difficulty?: number;
  startedAt: number;
  durationMs: number;
  score: number;
  correct: number;
  attempted: number;
  stats?: Record<string, number>;
  breakdown?: Record<string, [number, number]>;
  reviewUpdates?: ReviewUpdate[];
  /** Content ids served this round, remembered to avoid repeats. */
  seenIds?: string[];
}

export interface RoundOutcome {
  session: SessionRecord;
  previousBest: number | null;
  isBest: boolean;
}

/**
 * The player's data, held in memory and written through to the backend.
 * UI reads synchronously; writes persist in the background and report failures via `lastWriteError`.
 */
export class PlayerStore {
  sessions: SessionRecord[] = [];
  items = new Map<string, ReviewItem>();
  records = new Map<string, RecordEntry>();
  settings: Settings = { ...DEFAULT_SETTINGS, gamePrefs: {} };
  profile: Profile = defaultProfile();
  lastWriteError: string | null = null;
  /** Rows dropped on load because they were malformed. */
  repaired = 0;

  private listeners = new Set<() => void>();
  private version = 0;

  constructor(public backend: Backend) {}

  static async load(backend: Backend): Promise<PlayerStore> {
    const s = new PlayerStore(backend);
    try {
      const [sessions, items, records, meta] = await Promise.all([
        backend.getAll<unknown>('sessions'),
        backend.getAll<unknown>('items'),
        backend.getAll<unknown>('records'),
        backend.getAll<{ key: string; value: unknown }>('meta'),
      ]);
      for (const v of sessions) (validSession(v) ? s.sessions.push(v) : s.repaired++);
      for (const v of items) (validItem(v) ? s.items.set(v.key, v) : s.repaired++);
      for (const v of records) (validRecord(v) ? s.records.set(v.key, v) : s.repaired++);
      s.sessions.sort((a, b) => a.startedAt - b.startedAt);
      const settings = meta.find((m) => m?.key === 'settings');
      const profile = meta.find((m) => m?.key === 'profile');
      s.settings = sanitizeSettings(settings?.value);
      s.profile = profile ? sanitizeProfile(profile.value) : defaultProfile();
      if (!profile) s.persistMeta('profile');
    } catch (err) {
      s.lastWriteError = 'Saved progress could not be read. You can keep playing; new progress will be saved.';
      console.warn('[curious-minds] load failed', err);
    }
    return s;
  }

  /* -------- subscription (for React's useSyncExternalStore) -------- */
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;
  private emit() {
    this.version++;
    for (const l of this.listeners) l();
  }

  private write(p: Promise<void>) {
    p.then(
      () => {
        if (this.lastWriteError) {
          this.lastWriteError = null;
          this.emit();
        }
      },
      (err) => {
        console.warn('[curious-minds] write failed', err);
        this.lastWriteError = "Progress couldn't be saved to this browser. Export your data to keep it.";
        this.emit();
      },
    );
  }
  private persistMeta(key: 'settings' | 'profile') {
    this.write(this.backend.put('meta', { key, value: this[key] }));
  }

  /* -------- reads -------- */
  recentSet(gameId: string): Set<string> {
    return new Set(this.profile.recentContent[gameId] ?? []);
  }
  best(gameId: string, mode?: string): number | null {
    let best: number | null = null;
    for (const r of this.records.values()) {
      if (r.gameId === gameId && (mode === undefined || r.mode === mode)) best = Math.max(best ?? 0, r.best);
    }
    return best;
  }
  plays(gameId: string): number {
    let n = 0;
    for (const r of this.records.values()) if (r.gameId === gameId) n += r.plays;
    return n;
  }
  due(gameId?: string): ReviewItem[] {
    const all = dueItems(this.items.values());
    return gameId ? all.filter((i) => i.gameId === gameId) : all;
  }

  /* -------- writes -------- */
  recordRound(input: RoundInput): RoundOutcome {
    const now = Date.now();
    const session: SessionRecord = {
      id: `${input.gameId}-${input.startedAt}-${Math.random().toString(36).slice(2, 8)}`,
      gameId: input.gameId,
      mode: input.mode,
      difficulty: input.difficulty,
      startedAt: input.startedAt,
      durationMs: Math.max(0, Math.round(input.durationMs)),
      score: Math.max(0, Math.round(input.score)),
      correct: input.correct,
      attempted: input.attempted,
      stats: input.stats,
      breakdown: input.breakdown,
    };
    this.sessions.push(session);
    if (this.sessions.length > MAX_SESSIONS) this.sessions.splice(0, this.sessions.length - MAX_SESSIONS);
    this.write(this.backend.put('sessions', session));

    const rkey = `${input.gameId}:${input.mode}`;
    const prev = this.records.get(rkey);
    const previousBest = prev ? prev.best : null;
    const isBest = session.score > 0 && (previousBest === null || session.score > previousBest);
    const rec: RecordEntry = {
      key: rkey,
      gameId: input.gameId,
      mode: input.mode,
      best: isBest ? session.score : (previousBest ?? 0),
      bestAt: isBest ? now : (prev?.bestAt ?? now),
      plays: (prev?.plays ?? 0) + 1,
    };
    this.records.set(rkey, rec);
    this.write(this.backend.put('records', rec));

    if (input.reviewUpdates?.length) {
      const changed: ReviewItem[] = [];
      for (const u of input.reviewUpdates) {
        const it = applyReview(this.items.get(u.key), u, now);
        this.items.set(u.key, it);
        changed.push(it);
      }
      this.write(this.backend.putMany('items', changed));
    }

    const p = this.profile;
    const today = dayKey();
    if (!p.days.includes(today)) p.days = [...p.days, today];
    p.recentGames = [{ gameId: input.gameId, at: now }, ...p.recentGames.filter((r) => r.gameId !== input.gameId)].slice(0, 10);
    if (input.seenIds?.length) {
      const prevIds = p.recentContent[input.gameId] ?? [];
      const merged = [...input.seenIds, ...prevIds.filter((id) => !input.seenIds!.includes(id))];
      p.recentContent = { ...p.recentContent, [input.gameId]: merged.slice(0, RECENT_CONTENT_CAP) };
    }
    this.persistMeta('profile');
    this.emit();
    return { session, previousBest, isBest };
  }

  /** Remember served content without finishing a round (e.g. the player quit early). */
  noteSeen(gameId: string, ids: string[]) {
    if (!ids.length) return;
    const prevIds = this.profile.recentContent[gameId] ?? [];
    this.profile.recentContent = {
      ...this.profile.recentContent,
      [gameId]: [...ids, ...prevIds.filter((id) => !ids.includes(id))].slice(0, RECENT_CONTENT_CAP),
    };
    this.persistMeta('profile');
  }

  setBookmark(u: { key: string; gameId: string; label: string }, on: boolean) {
    const prev = this.items.get(u.key);
    const now = Date.now();
    const it: ReviewItem = prev
      ? { ...prev, bookmarked: on }
      : { key: u.key, gameId: u.gameId, label: u.label, box: 0, due: now, seen: 0, correct: 0, wrong: 0, lastSeen: now, lastResult: 'partial', bookmarked: on };
    this.items.set(u.key, it);
    this.write(this.backend.put('items', it));
    this.emit();
  }

  updateSettings(patch: Partial<Settings>) {
    this.settings = { ...this.settings, ...patch };
    this.persistMeta('settings');
    this.emit();
  }

  setGamePref(gameId: string, pref: Settings['gamePrefs'][string]) {
    this.settings = { ...this.settings, gamePrefs: { ...this.settings.gamePrefs, [gameId]: pref } };
    this.persistMeta('settings');
    this.emit();
  }

  /* -------- export / import -------- */
  exportData(): ExportFile {
    return {
      app: 'curious-minds',
      schema: EXPORT_SCHEMA,
      exportedAt: new Date().toISOString(),
      data: {
        sessions: this.sessions,
        items: [...this.items.values()],
        records: [...this.records.values()],
        settings: this.settings,
        profile: this.profile,
      },
    };
  }

  /** Summarise what an import would bring in, for the confirmation step. */
  previewImport(file: ExportFile) {
    const known = new Set(this.sessions.map((s) => s.id));
    return {
      sessions: file.data.sessions.length,
      newSessions: file.data.sessions.filter((s) => !known.has(s.id)).length,
      items: file.data.items.length,
      records: file.data.records.length,
      exportedAt: file.exportedAt,
    };
  }

  async importData(file: ExportFile, how: 'merge' | 'replace'): Promise<void> {
    const d = file.data;
    if (how === 'replace') {
      this.sessions = [...d.sessions].sort((a, b) => a.startedAt - b.startedAt);
      this.items = new Map(d.items.map((i) => [i.key, i]));
      this.records = new Map(d.records.map((r) => [r.key, r]));
      this.settings = d.settings;
      this.profile = d.profile;
    } else {
      const byId = new Map(this.sessions.map((s) => [s.id, s]));
      for (const s of d.sessions) if (!byId.has(s.id)) byId.set(s.id, s);
      this.sessions = [...byId.values()].sort((a, b) => a.startedAt - b.startedAt).slice(-MAX_SESSIONS);
      for (const it of d.items) {
        const mine = this.items.get(it.key);
        this.items.set(it.key, mine ? mergeReview(mine, it) : it);
      }
      for (const r of d.records) {
        const mine = this.records.get(r.key);
        if (!mine) this.records.set(r.key, r);
        else
          this.records.set(r.key, {
            ...mine,
            best: Math.max(mine.best, r.best),
            bestAt: r.best > mine.best ? r.bestAt : mine.bestAt,
            plays: Math.max(mine.plays, r.plays),
          });
      }
      this.profile = {
        firstSeen: Math.min(this.profile.firstSeen, d.profile.firstSeen),
        days: [...new Set([...this.profile.days, ...d.profile.days])].sort(),
        recentGames: [...this.profile.recentGames, ...d.profile.recentGames]
          .sort((a, b) => b.at - a.at)
          .filter((r, i, arr) => arr.findIndex((x) => x.gameId === r.gameId) === i)
          .slice(0, 10),
        recentContent: { ...d.profile.recentContent, ...this.profile.recentContent },
      };
      // keep this device's settings when merging
    }
    await this.rewriteAll();
    this.emit();
  }

  async clearAll(): Promise<void> {
    this.sessions = [];
    this.items = new Map();
    this.records = new Map();
    this.settings = { ...DEFAULT_SETTINGS, gamePrefs: {} };
    this.profile = defaultProfile();
    await this.rewriteAll();
    this.emit();
  }

  private async rewriteAll() {
    try {
      for (const s of ['sessions', 'items', 'records', 'meta'] as const) await this.backend.clear(s);
      await this.backend.putMany('sessions', this.sessions);
      await this.backend.putMany('items', [...this.items.values()]);
      await this.backend.putMany('records', [...this.records.values()]);
      await this.backend.putMany('meta', [
        { key: 'settings', value: this.settings },
        { key: 'profile', value: this.profile },
      ]);
      this.lastWriteError = null;
    } catch (err) {
      console.warn('[curious-minds] rewrite failed', err);
      this.lastWriteError = "Progress couldn't be saved to this browser. Export your data to keep it.";
    }
  }
}

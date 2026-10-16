/** Persistence, malformed data, export/import and merge behaviour (using the in-memory backend). */
import { describe, expect, test } from 'bun:test';
import { MemoryBackend } from '../src/storage/db';
import { PlayerStore } from '../src/storage/store';
import { parseExport, EXPORT_SCHEMA } from '../src/storage/schema';

const round = (over: Partial<Parameters<PlayerStore['recordRound']>[0]> = {}) => ({
  gameId: 'flag-finder',
  mode: 'pick',
  startedAt: Date.now(),
  durationMs: 60000,
  score: 500,
  correct: 5,
  attempted: 10,
  reviewUpdates: [{ key: 'flag:fr', gameId: 'flag-finder', label: 'Flag of France', result: 'wrong' as const }],
  seenIds: ['fr', 'de'],
  ...over,
});

describe('PlayerStore', () => {
  test('records rounds, bests and review items, and reloads them', async () => {
    const backend = new MemoryBackend();
    const s = await PlayerStore.load(backend);
    const first = s.recordRound(round());
    expect(first.isBest).toBe(true);
    expect(first.previousBest).toBeNull();
    const second = s.recordRound(round({ score: 300, startedAt: Date.now() + 1 }));
    expect(second.isBest).toBe(false);
    expect(s.best('flag-finder', 'pick')).toBe(500);
    await new Promise((r) => setTimeout(r, 5));

    const again = await PlayerStore.load(backend);
    expect(again.sessions).toHaveLength(2);
    expect(again.best('flag-finder')).toBe(500);
    expect(again.plays('flag-finder')).toBe(2);
    expect(again.due('flag-finder').map((i) => i.key)).toContain('flag:fr');
    expect(again.recentSet('flag-finder').has('fr')).toBe(true);
    expect(again.profile.days.length).toBe(1);
  });

  test('skips malformed rows instead of failing', async () => {
    const backend = new MemoryBackend();
    await backend.put('sessions', { id: 'bad', gameId: 3 });
    await backend.put('sessions', { id: 'ok', gameId: 'word-web', mode: 'classic', startedAt: 1, durationMs: 1, score: 1, correct: 1, attempted: 1 });
    await backend.put('meta', { key: 'settings', value: { sound: 'loud', motion: 'reduced' } });
    const s = await PlayerStore.load(backend);
    expect(s.sessions).toHaveLength(1);
    expect(s.repaired).toBe(1);
    expect(s.settings.sound).toBe(false);
    expect(s.settings.motion).toBe('reduced');
  });

  test('export → import (replace) round-trips everything', async () => {
    const a = await PlayerStore.load(new MemoryBackend());
    a.recordRound(round());
    a.updateSettings({ sound: true });
    const text = JSON.stringify(a.exportData());
    const parsed = parseExport(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const b = await PlayerStore.load(new MemoryBackend());
    await b.importData(parsed.file, 'replace');
    expect(b.sessions).toEqual(a.sessions);
    expect([...b.items.values()]).toEqual([...a.items.values()]);
    expect(b.settings.sound).toBe(true);
  });

  test('merge keeps both devices and the better best score', async () => {
    const a = await PlayerStore.load(new MemoryBackend());
    a.recordRound(round({ score: 900, startedAt: 1 }));
    const b = await PlayerStore.load(new MemoryBackend());
    b.recordRound(round({ score: 400, startedAt: 2 }));
    b.recordRound(round({ gameId: 'word-web', mode: 'classic', score: 650, startedAt: 3, reviewUpdates: [] }));
    const parsed = parseExport(JSON.stringify(a.exportData()));
    if (!parsed.ok) throw new Error(parsed.error);
    await b.importData(parsed.file, 'merge');
    expect(b.sessions).toHaveLength(3);
    expect(b.best('flag-finder', 'pick')).toBe(900);
    expect(b.best('word-web')).toBe(650);
    // importing the same file twice adds nothing
    await b.importData(parsed.file, 'merge');
    expect(b.sessions).toHaveLength(3);
  });

  test('clearAll empties every store', async () => {
    const backend = new MemoryBackend();
    const s = await PlayerStore.load(backend);
    s.recordRound(round());
    await s.clearAll();
    const again = await PlayerStore.load(backend);
    expect(again.sessions).toHaveLength(0);
    expect(again.items.size).toBe(0);
  });
});

describe('parseExport', () => {
  test('rejects non-JSON, foreign files and newer schemas with clear messages', () => {
    expect(parseExport('nope')).toMatchObject({ ok: false });
    expect(parseExport('{"app":"other"}')).toMatchObject({ ok: false });
    const newer = parseExport(JSON.stringify({ app: 'curious-minds', schema: EXPORT_SCHEMA + 1, data: {} }));
    expect(newer.ok).toBe(false);
    if (!newer.ok) expect(newer.error).toContain('newer version');
  });
  test('skips damaged rows and counts them', () => {
    const r = parseExport(JSON.stringify({ app: 'curious-minds', schema: 1, data: { sessions: [{ id: 1 }], items: [], records: 'x' } }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.skipped).toBe(1);
      expect(r.file.data.sessions).toHaveLength(0);
      expect(r.file.data.records).toHaveLength(0);
    }
  });
});

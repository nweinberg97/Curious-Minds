/** Small deterministic PRNG so "today's spotlight" is stable and tests are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: readonly T[], rand: () => number = Math.random): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Pick `n` items, avoiding ids seen recently when possible.
 * `priority` items (e.g. review items that are due) are placed first, up to `maxPriority`.
 */
export function pickFresh<T>(
  pool: readonly T[],
  n: number,
  idOf: (t: T) => string,
  recent: ReadonlySet<string>,
  opts: { priority?: readonly T[]; maxPriority?: number; rand?: () => number } = {},
): T[] {
  const rand = opts.rand ?? Math.random;
  const out: T[] = [];
  const used = new Set<string>();
  const pri = shuffle(opts.priority ?? [], rand).slice(0, opts.maxPriority ?? 0);
  for (const p of pri) {
    if (out.length >= n) break;
    const id = idOf(p);
    if (!used.has(id)) {
      out.push(p);
      used.add(id);
    }
  }
  const fresh = shuffle(pool.filter((p) => !recent.has(idOf(p)) && !used.has(idOf(p))), rand);
  const stale = shuffle(pool.filter((p) => recent.has(idOf(p)) && !used.has(idOf(p))), rand);
  for (const p of [...fresh, ...stale]) {
    if (out.length >= n) break;
    out.push(p);
    used.add(idOf(p));
  }
  return shuffle(out, rand);
}

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

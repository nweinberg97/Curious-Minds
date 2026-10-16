import { CLUSTERS, LINKS, STARTERS } from '../../content/associations';
import { normalize, stemCandidates } from '../../engine/normalize';

/**
 * Word Rush validator. No AI: a link is judged against an authored association graph.
 *
 *  1. Both words share a cluster ("beach" and "sand" are both in *the seaside*).
 *  2. An explicit link joins them ("salt"–"pepper": a classic pair).
 *  3. Compound words: one contains the other, or the two join into a known word ("fire" → "firefly").
 *
 * Anything else is "not in our dictionary", and the player may vouch for it at reduced points.
 */

export type LinkVerdict =
  | { ok: true; how: 'cluster' | 'link' | 'compound'; word: string; reason: string }
  | { ok: false; why: 'empty' | 'same' | 'repeat' | 'unlinked' | 'unknown'; word: string; message: string };

const wordClusters = new Map<string, number[]>();
CLUSTERS.forEach((c, i) => {
  for (const w of c.words) {
    const k = normalize(w);
    const arr = wordClusters.get(k);
    if (arr) {
      if (!arr.includes(i)) arr.push(i);
    } else wordClusters.set(k, [i]);
  }
});

const linkMap = new Map<string, Map<string, string>>();
for (const [a, b, note] of LINKS) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y || x === y) continue;
  const n = note ?? 'a familiar pairing';
  if (!linkMap.has(x)) linkMap.set(x, new Map());
  if (!linkMap.has(y)) linkMap.set(y, new Map());
  linkMap.get(x)!.set(y, n);
  linkMap.get(y)!.set(x, n);
}

export function isKnown(word: string): boolean {
  return wordClusters.has(word) || linkMap.has(word);
}

/** Every dictionary word the input could be (as typed, then plural/inflection stems). */
export function resolveAll(input: string): string[] {
  const n = normalize(input);
  if (!n) return [];
  const parts = n.split(' ');
  const last = parts.pop()!;
  const head = parts.length ? parts.join(' ') + ' ' : '';
  const out = stemCandidates(last).map((c) => head + c).filter(isKnown);
  return out.length ? [...new Set(out)] : [n];
}

/** Map what the player typed onto a word in the graph, trying plural/inflection stems. */
export function resolve(input: string): string {
  return resolveAll(input)[0] ?? '';
}

/** The root used for "same word" checks: "oceans", "oceanic"? We compare shared stems. */
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  const sa = new Set(stemCandidates(a));
  return stemCandidates(b).some((s) => sa.has(s) && s.length >= 3);
}

function compound(a: string, b: string): string | null {
  const A = a.replace(/ /g, '');
  const B = b.replace(/ /g, '');
  if (A.length < 3 || B.length < 3) return null;
  // "fire" → "firefly": the longer word is the shorter one plus another real word.
  const splits = (long: string, short: string) => {
    if (long.length - short.length < 3) return null;
    if (long.startsWith(short) && isKnown(long.slice(short.length))) return `${short} + ${long.slice(short.length)} = ${long}`;
    if (long.endsWith(short) && isKnown(long.slice(0, long.length - short.length))) return `${long.slice(0, long.length - short.length)} + ${short} = ${long}`;
    return null;
  };
  const s = B.length > A.length ? splits(B, A) : splits(A, B);
  if (s) return s;
  // "fire" → "place": the two words join into a known compound.
  if (isKnown(A + B)) return `${a} + ${b} = ${A + B}`;
  if (isKnown(B + A)) return `${b} + ${a} = ${B + A}`;
  return null;
}

export function sharedCluster(a: string, b: string): string | null {
  const ca = wordClusters.get(a);
  const cb = wordClusters.get(b);
  if (!ca || !cb) return null;
  for (const i of ca) if (cb.includes(i)) return CLUSTERS[i].label;
  return null;
}

/**
 * Judge `input` as the next link after `from`.
 * `anchor` is the last dictionary word in the chain, used when `from` was vouched for and isn't in the graph.
 */
export function judgeLink(from: string, input: string, used: ReadonlySet<string>, anchor?: string): LinkVerdict {
  const word = resolve(input);
  if (!word) return { ok: false, why: 'empty', word, message: 'Type a word first.' };
  if (sameWord(from, word)) return { ok: false, why: 'same', word, message: `That's ${from} again in another form.` };
  for (const u of used) if (sameWord(u, word)) return { ok: false, why: 'repeat', word, message: `${word} is already in your chain.` };

  const sources = anchor && anchor !== from ? [from, anchor] : [from];
  for (const src of sources) {
    for (const w of resolveAll(input)) {
      const label = sharedCluster(src, w);
      if (label) return { ok: true, how: 'cluster', word: w, reason: `${src} ↔ ${w}: both relate to ${label}` };
      const note = linkMap.get(src)?.get(w);
      if (note) return { ok: true, how: 'link', word: w, reason: `${src} ↔ ${w}: ${note}` };
    }
  }
  const comp = compound(from, word);
  if (comp) return { ok: true, how: 'compound', word, reason: comp };

  if (!isKnown(word)) {
    return { ok: false, why: 'unknown', word, message: `“${word}” isn't in our dictionary yet.` };
  }
  return { ok: false, why: 'unlinked', word, message: `We don't have a link from ${from} to ${word}.` };
}

/** Strong neighbours of a word, for "you could have said…" on the summary. */
export function neighbours(word: string, limit = 8, exclude: ReadonlySet<string> = new Set()): string[] {
  // Strength = shared clusters (+2 for a direct link). Ties go to more familiar (better-connected) words.
  const strength = new Map<string, number>();
  for (const n of linkMap.get(word)?.keys() ?? []) if (!exclude.has(n)) strength.set(n, 2);
  for (const i of wordClusters.get(word) ?? []) {
    for (const w of CLUSTERS[i].words) {
      const k = normalize(w);
      if (k !== word && !exclude.has(k)) strength.set(k, (strength.get(k) ?? 0) + 1);
    }
  }
  const fam = (w: string) => wordClusters.get(w)?.length ?? 0;
  return [...strength.keys()]
    .sort((a, b) => strength.get(b)! - strength.get(a)! || fam(b) - fam(a))
    .slice(0, limit);
}

export function neighbourCount(word: string): number {
  return neighbours(word, Infinity).length;
}

export const STARTER_WORDS = STARTERS.map(normalize);

export const GRAPH_STATS = {
  clusters: CLUSTERS.length,
  words: wordClusters.size,
  links: LINKS.length,
};

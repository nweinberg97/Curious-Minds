/**
 * Answer normalisation shared by every typed-answer game.
 * Goal: forgive case, accents, punctuation, plurals and small typos,
 * without accepting answers that are actually different words.
 */

export function stripDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .replace(/Ø/g, 'O')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/ł/g, 'l')
    .replace(/đ/g, 'd')
    .replace(/ı/g, 'i');
}

/** Lower-case, strip accents, unify apostrophes and dashes, collapse spaces, drop a leading "the". */
export function normalize(input: string): string {
  let s = stripDiacritics(input.toLowerCase())
    .replace(/[’‘`´]/g, "'")
    .replace(/[‐-―]/g, '-')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9' -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (s.startsWith('the ')) s = s.slice(4);
  return s;
}

/** A looser key: also removes apostrophes, hyphens and spaces ("n'djamena" == "ndjamena", "ice-cream" == "icecream"). */
export function looseKey(input: string): string {
  return normalize(input).replace(/['\- ]/g, '');
}

const IRREGULAR_PLURALS: Record<string, string> = {
  mice: 'mouse', geese: 'goose', feet: 'foot', teeth: 'tooth', men: 'man', women: 'woman',
  children: 'child', people: 'person', oxen: 'ox', lice: 'louse', dice: 'die', knives: 'knife',
  wolves: 'wolf', leaves: 'leaf', loaves: 'loaf', halves: 'half', calves: 'calf', shelves: 'shelf',
  wives: 'wife', lives: 'life', thieves: 'thief', cacti: 'cactus', fungi: 'fungus', octopi: 'octopus',
};

/**
 * Candidate base forms of a single word: the word itself plus plausible singular/inflection stems.
 * Returns several candidates; callers check which one exists in their dictionary.
 */
export function stemCandidates(word: string): string[] {
  const w = word;
  const out = new Set<string>([w]);
  if (IRREGULAR_PLURALS[w]) out.add(IRREGULAR_PLURALS[w]);
  if (w.length > 3) {
    if (w.endsWith('ies')) out.add(w.slice(0, -3) + 'y');
    if (w.endsWith('es')) out.add(w.slice(0, -2));
    if (w.endsWith('s') && !w.endsWith('ss')) out.add(w.slice(0, -1));
    if (w.endsWith('ing')) {
      const b = w.slice(0, -3);
      out.add(b);
      out.add(b + 'e');
      if (b.length > 2 && b[b.length - 1] === b[b.length - 2]) out.add(b.slice(0, -1));
    }
    if (w.endsWith('ed')) {
      const b = w.slice(0, -2);
      out.add(b);
      out.add(w.slice(0, -1));
      if (b.endsWith('i')) out.add(b.slice(0, -1) + 'y');
      if (b.length > 2 && b[b.length - 1] === b[b.length - 2]) out.add(b.slice(0, -1));
    }
    if (w.endsWith('er')) out.add(w.slice(0, -2));
    if (w.endsWith('ly')) out.add(w.slice(0, -2));
    if (w.endsWith('y') && !w.endsWith('ey')) out.add(w.slice(0, -1));
  }
  return [...out];
}

/** Stem candidates for a phrase: only the last word is varied ("ice creams" -> "ice cream"). */
export function phraseCandidates(phrase: string): string[] {
  const n = normalize(phrase);
  const parts = n.split(' ');
  const last = parts.pop() ?? '';
  const head = parts.length ? parts.join(' ') + ' ' : '';
  return stemCandidates(last).map((c) => head + c);
}

/** Optimal-string-alignment distance (Levenshtein plus adjacent transpositions). */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    d.push(new Array(b.length + 1).fill(0));
    d[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2][j - 2] + 1);
      d[i][j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/** How many typos we forgive for a target of this length. Short words must be exact. */
export function typoAllowance(len: number): number {
  if (len >= 10) return 2;
  if (len >= 6) return 1;
  return 0;
}

/**
 * An index of accepted answers keyed by their loose form, with typo tolerance.
 * `add(key, value)` registers an accepted spelling; `match(input)` returns the value and whether a typo was forgiven.
 */
export class AnswerIndex<T> {
  private exact = new Map<string, T>();
  private entries: [string, T][] = [];

  add(spelling: string, value: T) {
    const k = looseKey(spelling);
    if (!k) return;
    if (!this.exact.has(k)) {
      this.exact.set(k, value);
      this.entries.push([k, value]);
    }
  }

  match(input: string, opts: { typos?: boolean; filter?: (v: T) => boolean } = {}): { value: T; fuzzy: boolean } | null {
    const filter = opts.filter ?? (() => true);
    for (const cand of phraseCandidates(input)) {
      const v = this.exact.get(looseKey(cand));
      if (v !== undefined && filter(v)) return { value: v, fuzzy: false };
    }
    if (opts.typos === false) return null;
    const k = looseKey(input);
    const allow = typoAllowance(k.length);
    if (!allow) return null;
    let best: { value: T; d: number } | null = null;
    for (const [key, value] of this.entries) {
      if (Math.abs(key.length - k.length) > allow) continue;
      if (key[0] !== k[0]) continue; // first letter must be right
      if (!filter(value)) continue;
      const d = levenshtein(k, key, allow);
      if (d <= allow && (!best || d < best.d)) best = { value, d };
    }
    return best ? { value: best.value, fuzzy: true } : null;
  }
}

import type { AlphabetCategory } from '../../content/types';
import { NATURE_CATEGORIES } from '../../content/alphabet/nature';
import { HOME_CATEGORIES } from '../../content/alphabet/home';
import { CULTURE_CATEGORIES } from '../../content/alphabet/culture';
import { COUNTRIES } from '../../content/countries.generated';
import { AnswerIndex, looseKey, normalize } from '../../engine/normalize';
import { shuffle } from '../../engine/random';

/**
 * Alphabet Sprint validation.
 * Each category is an authored list of accepted answers (plus all countries from the geography dataset).
 * Matching forgives case, accents, punctuation, plurals and — for answers of 6+ letters — a typo.
 * The player's answer must start with the round's letter.
 */

export interface Answer {
  canonical: string;
  common: boolean;
  categoryId: string;
}

export interface CategoryIndex {
  cat: AlphabetCategory;
  index: AnswerIndex<Answer>;
  /** Canonical answers grouped by first letter (normalised). */
  byLetter: Map<string, Answer[]>;
}

const COUNTRY_CATEGORY: AlphabetCategory = {
  id: 'countries',
  prompt: 'a country',
  title: 'Countries',
  answers: COUNTRIES.map((c) => (c.tier === 1 ? '*' : '') + [c.name, ...c.aliases.filter((a) => /^[A-Za-z\u00C0-\u024F '’.,()-]+$/.test(a))].join('|')),
};

export const ALPHABET_CATEGORIES: AlphabetCategory[] = [...NATURE_CATEGORIES, ...HOME_CATEGORIES, ...CULTURE_CATEGORIES, COUNTRY_CATEGORY];

function buildIndex(cat: AlphabetCategory): CategoryIndex {
  const index = new AnswerIndex<Answer>();
  const byLetter = new Map<string, Answer[]>();
  for (const raw of cat.answers) {
    const common = raw.startsWith('*');
    const spellings = (common ? raw.slice(1) : raw).split('|').map((s) => s.trim()).filter(Boolean);
    const canonical = spellings[0];
    const ans: Answer = { canonical, common, categoryId: cat.id };
    for (const sp of spellings) index.add(sp, ans);
    // Group by the canonical spelling's first letter, so round letters and "also on our list" stay obvious.
    const l = looseKey(canonical)[0];
    if (l) {
      const arr = byLetter.get(l) ?? [];
      arr.push(ans);
      byLetter.set(l, arr);
    }
  }
  return { cat, index, byLetter };
}

let cache: Map<string, CategoryIndex> | null = null;
export function indexes(): Map<string, CategoryIndex> {
  if (!cache) cache = new Map(ALPHABET_CATEGORIES.map((c) => [c.id, buildIndex(c)]));
  return cache;
}

export const LETTERS = 'abcdefghijklmnoprstw'.split(''); // letters with rich answers across most categories
export const MIN_ANSWERS = 4;

/** Choose a letter and `n` categories that each have at least MIN_ANSWERS answers for it. */
export function chooseRound(n: number, rand: () => number = Math.random, avoidLetter?: string): { letter: string; categories: CategoryIndex[] } {
  const all = [...indexes().values()];
  for (let attempt = 0; attempt < 50; attempt++) {
    const letter = LETTERS[Math.floor(rand() * LETTERS.length)];
    if (letter === avoidLetter) continue;
    const ok = shuffle(all, rand).filter((c) => (c.byLetter.get(letter)?.length ?? 0) >= MIN_ANSWERS);
    if (ok.length >= n) return { letter, categories: ok.slice(0, n) };
  }
  // Fallback that always works: 's' is rich everywhere.
  return { letter: 's', categories: shuffle(all, rand).slice(0, n) };
}

export type SprintVerdict =
  | { ok: true; answer: Answer; fuzzy: boolean }
  | { ok: false; message: string };

export function judgeAnswer(input: string, letter: string, cats: CategoryIndex[], already: ReadonlySet<string>): SprintVerdict {
  const n = normalize(input);
  if (!n) return { ok: false, message: 'Type an answer first.' };
  if (looseKey(n)[0] !== letter) return { ok: false, message: `Answers need to start with ${letter.toUpperCase()}.` };
  for (const c of cats) {
    const m = c.index.match(n);
    if (m) {
      const key = `${c.cat.id}:${m.value.canonical}`;
      if (already.has(key)) return { ok: false, message: `You already have ${m.value.canonical}.` };
      return { ok: true, answer: m.value, fuzzy: m.fuzzy && looseKey(m.value.canonical) !== looseKey(n) };
    }
  }
  return { ok: false, message: `${input.trim()} isn't on our lists for these categories.` };
}

export const SPRINT_POINTS = 100;
export const DEEP_CUT_BONUS = 50;

export function pointsFor(a: Answer): number {
  return SPRINT_POINTS + (a.common ? 0 : DEEP_CUT_BONUS);
}

/** Missed answers to show on the summary: deep cuts first, then common ones. */
export function missedFor(c: CategoryIndex, letter: string, got: ReadonlySet<string>, limit = 6, rand: () => number = Math.random): Answer[] {
  const pool = (c.byLetter.get(letter) ?? []).filter((a) => !got.has(`${c.cat.id}:${a.canonical}`));
  const common = shuffle(pool.filter((a) => a.common), rand);
  const deep = shuffle(pool.filter((a) => !a.common), rand);
  return [...common.slice(0, Math.ceil(limit / 2)), ...deep].slice(0, limit);
}

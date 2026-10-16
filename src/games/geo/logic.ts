import { COUNTRIES } from '../../content/countries.generated';
import { FLAG_LOOKALIKES, CAPITAL_FACTS } from '../../content/geoEditorial';
import type { CapitalEntry, Country } from '../../content/types';
import { AnswerIndex } from '../../engine/normalize';
import { shuffle } from '../../engine/random';

export { COUNTRIES };
export const QUESTIONS_PER_ROUND = 10;
export const QUESTION_TIME_MS = 15_000;
export const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function flagUrl(code: string): string {
  return `flags/${code}.svg`;
}

/* ---------------- country names ---------------- */

const countryIndex = new AnswerIndex<Country>();
for (const c of COUNTRIES) {
  countryIndex.add(c.name, c);
  for (const a of c.aliases) countryIndex.add(a, c);
}

/** Match a typed country name. Exact (normalised) first, then a forgiving typo match. */
export function matchCountry(input: string): Country | null {
  return countryIndex.match(input)?.value ?? null;
}

/* ---------------- capitals ---------------- */

export type CapitalVerdict =
  | { result: 'correct'; capital: CapitalEntry; fuzzy: boolean }
  | { result: 'partial'; capital: CapitalEntry }
  | { result: 'wrong' };

export function judgeCapital(input: string, c: Country): CapitalVerdict {
  const idx = new AnswerIndex<CapitalEntry>();
  for (const cap of c.capitals) {
    idx.add(cap.name, cap);
    for (const v of cap.variants ?? []) idx.add(v, cap);
  }
  const m = idx.match(input);
  if (!m) return { result: 'wrong' };
  if (m.value.credit === 'partial') return { result: 'partial', capital: m.value };
  return { result: 'correct', capital: m.value, fuzzy: m.fuzzy };
}

export function primaryCapital(c: Country): CapitalEntry {
  return c.capitals.find((x) => x.credit === 'full') ?? c.capitals[0];
}

export function fullCapitals(c: Country): CapitalEntry[] {
  return c.capitals.filter((x) => x.credit === 'full');
}

export function capitalFact(c: Country): string | undefined {
  return CAPITAL_FACTS[c.code];
}

/* ---------------- selection & distractors ---------------- */

/** Difficulty 1 = tier 1 only, 2 = tiers 1-2, 3 = all, weighted to deep cuts. */
export function poolFor(difficulty: number): Country[] {
  if (difficulty <= 1) return COUNTRIES.filter((c) => c.tier === 1);
  if (difficulty === 2) return COUNTRIES.filter((c) => c.tier <= 2);
  return COUNTRIES.filter((c) => c.tier >= 2);
}

const lookalikeMap = new Map<string, Set<string>>();
for (const group of FLAG_LOOKALIKES) {
  for (const code of group) {
    const s = lookalikeMap.get(code) ?? new Set<string>();
    for (const o of group) if (o !== code) s.add(o);
    lookalikeMap.set(code, s);
  }
}

/**
 * Three wrong options for a question.
 *  - easy: other well-known countries (any region) — tests recognition
 *  - medium: same region where possible
 *  - hard: look-alike flags first (flag mode), then same subregion
 */
export function distractors(answer: Country, difficulty: number, kind: 'flag' | 'capital', rand: () => number = Math.random): Country[] {
  const out: Country[] = [];
  const add = (c: Country | undefined) => {
    if (c && c.code !== answer.code && !out.some((o) => o.code === c.code) && out.length < 3) out.push(c);
  };
  if (difficulty >= 3 && kind === 'flag') {
    for (const code of shuffle([...(lookalikeMap.get(answer.code) ?? [])], rand)) add(BY_CODE.get(code));
  }
  if (difficulty >= 3) for (const c of shuffle(COUNTRIES.filter((c) => c.subregion === answer.subregion), rand)) add(c);
  if (difficulty >= 2) for (const c of shuffle(COUNTRIES.filter((c) => c.region === answer.region), rand)) add(c);
  for (const c of shuffle(COUNTRIES.filter((c) => c.tier <= Math.max(answer.tier, 1)), rand)) add(c);
  for (const c of shuffle(COUNTRIES, rand)) add(c);
  return out;
}

/** A short data-derived description: "Landlocked · Western Asia · borders 6 countries". */
export function geoLine(c: Country): string {
  const parts = [c.subregion];
  if (c.landlocked) parts.push('landlocked');
  if (c.borders.length === 0) parts.push(c.landlocked ? 'no land borders' : 'no land borders');
  else parts.push(`borders ${c.borders.length === 1 ? c.borders[0] : `${c.borders.length} countries`}`);
  parts.push(`${c.areaKm2.toLocaleString('en')} km²`);
  return parts.join(', ');
}

export const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const;

import { SCRAMBLE_WORDS } from '../../content/scramble';
import type { Difficulty, ScrambleWord } from '../../content/types';
import { normalize } from '../../engine/normalize';
import { shuffle } from '../../engine/random';

export const WORDS_PER_ROUND = 8;
export const WORD_TIME_MS = 30_000;

/** Shuffle letters so the result never equals the word or any accepted anagram, and doesn't start with the same two letters. */
export function scrambleLetters(word: string, rand: () => number = Math.random, accept: string[] = []): string {
  const banned = new Set([word, ...accept]);
  let best = word;
  for (let i = 0; i < 40; i++) {
    const s = shuffle(word.split(''), rand).join('');
    if (banned.has(s)) continue;
    best = s;
    if (s.slice(0, 2) !== word.slice(0, 2)) return s;
  }
  // Pathological words (e.g. all the same letters) — rotate as a last resort.
  return best === word ? word.slice(1) + word[0] : best;
}

export function isCorrect(input: string, w: ScrambleWord): boolean {
  const n = normalize(input).replace(/[^a-z]/g, '');
  return n === w.word || (w.alsoAccept ?? []).includes(n);
}

/**
 * Hint: reveal the next letter of the answer in place.
 * Returns the letters revealed so far as a prefix of the answer.
 */
export function hintPrefix(word: string, hints: number): string {
  return word.slice(0, Math.min(hints, word.length - 1));
}

export function maxHints(word: string): number {
  return Math.max(1, Math.min(3, Math.floor(word.length / 3)));
}

export function wordsAt(d: Difficulty): ScrambleWord[] {
  return SCRAMBLE_WORDS.filter((w) => w.difficulty === d);
}

/** Difficulty climbs after two quick, hintless solves and eases after a miss. */
export function nextDifficulty(current: number, result: 'fast' | 'ok' | 'miss', streak: number, start: number): Difficulty {
  let d = current;
  if (result === 'fast' && streak >= 2) d = current + 1;
  if (result === 'miss') d = Math.max(start, current - 1);
  return Math.max(1, Math.min(4, d)) as Difficulty;
}

export const DIFFICULTY_FACTOR: Record<number, number> = { 1: 1, 2: 1.25, 3: 1.5, 4: 2 };

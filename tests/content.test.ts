/**
 * Content validation. Every bank must pass before a build ships.
 * When you add content and a test here fails, the message names the item to fix.
 */
import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CLUSTERS, LINKS, STARTERS } from '../src/content/associations';
import { SCRAMBLE_WORDS } from '../src/content/scramble';
import { VOCAB, VOCAB_COLLECTIONS } from '../src/content/vocab';
import { WEB_BOARDS } from '../src/content/webs';
import { COUNTRIES } from '../src/content/countries.generated';
import { ALPHABET_CATEGORIES, indexes, MIN_ANSWERS, LETTERS } from '../src/games/alphabet/logic';
import { neighbourCount, judgeLink } from '../src/games/wordRush/graph';
import { usesWord } from '../src/games/define/evaluate';
import { normalize } from '../src/engine/normalize';

const sorted = (w: string) => w.split('').sort().join('');

describe('Word Rush graph', () => {
  test('clusters are well formed', () => {
    const ids = new Set<string>();
    for (const c of CLUSTERS) {
      expect(ids.has(c.id), `duplicate cluster id ${c.id}`).toBe(false);
      ids.add(c.id);
      expect(c.words.length, `cluster ${c.id} size`).toBeGreaterThanOrEqual(10);
      for (const w of c.words) expect(w, `cluster ${c.id}`).toMatch(/^[a-z0-9][a-z0-9 ']*[a-z0-9]$/);
    }
  });
  test('links are pairs of non-empty different words', () => {
    for (const [a, b] of LINKS) {
      expect(a.length && b.length).toBeTruthy();
      expect(normalize(a)).not.toBe(normalize(b));
    }
  });
  test('every starter is well connected', () => {
    for (const s of STARTERS) expect(neighbourCount(normalize(s)), `starter ${s}`).toBeGreaterThanOrEqual(20);
  });
  test('the example chain from the brief is valid', () => {
    const chain = ['ocean', 'beach', 'sand', 'desert', 'heat'];
    for (let i = 1; i < chain.length; i++) expect(judgeLink(chain[i - 1], chain[i], new Set()).ok).toBe(true);
  });
});

describe('Alphabet Sprint banks', () => {
  test('categories have unique ids and enough answers', () => {
    const ids = ALPHABET_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of ALPHABET_CATEGORIES) expect(c.answers.length, c.id).toBeGreaterThanOrEqual(100);
  });
  test('no duplicate spellings inside a category', () => {
    for (const c of ALPHABET_CATEGORIES) {
      const seen = new Map<string, string>();
      for (const raw of c.answers) {
        for (const sp of new Set(raw.replace(/^\*/, '').split('|').map(normalize))) {
          const k = sp;
          expect(seen.has(k), `${c.id}: "${sp}" duplicates "${seen.get(k)}"`).toBe(false);
          seen.set(k, raw);
        }
      }
    }
  });
  test('every round letter has playable categories', () => {
    for (const l of LETTERS) {
      const ok = [...indexes().values()].filter((c) => (c.byLetter.get(l)?.length ?? 0) >= MIN_ANSWERS);
      expect(ok.length, `letter ${l}`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('Word Scramble bank', () => {
  test('entries are valid and unique', () => {
    const seen = new Set<string>();
    for (const w of SCRAMBLE_WORDS) {
      expect(w.word, w.word).toMatch(/^[a-z]{4,13}$/);
      expect(seen.has(w.word), `duplicate ${w.word}`).toBe(false);
      seen.add(w.word);
      expect(w.definition.length, w.word).toBeGreaterThan(5);
      expect(w.example.toLowerCase(), `${w.word} example`).toContain(w.word);
      for (const a of w.alsoAccept ?? []) expect(sorted(a), `${w.word} anagram ${a}`).toBe(sorted(w.word));
    }
  });
  test('no two bank words are anagrams of each other', () => {
    const by = new Map<string, string>();
    for (const w of SCRAMBLE_WORDS) {
      const k = sorted(w.word);
      expect(by.has(k), `${w.word} and ${by.get(k)} are anagrams`).toBe(false);
      by.set(k, w.word);
    }
  });
  test('every difficulty has enough words for several rounds', () => {
    for (const d of [1, 2, 3, 4]) expect(SCRAMBLE_WORDS.filter((w) => w.difficulty === d).length).toBeGreaterThanOrEqual(40);
  });
});

describe('Define It vocabulary', () => {
  test('entries are complete, unique and in a known collection', () => {
    const colls = new Set(VOCAB_COLLECTIONS.map((c) => c.id));
    const seen = new Set<string>();
    for (const v of VOCAB) {
      expect(seen.has(v.id), `duplicate ${v.id}`).toBe(false);
      seen.add(v.id);
      expect(colls.has(v.collection), `${v.id} collection`).toBe(true);
      expect(v.definition.split(' ').length, `${v.id} definition`).toBeGreaterThanOrEqual(6);
    }
  });
  test("every example sentence passes our own 'uses the word' check", () => {
    for (const v of VOCAB) expect(usesWord(v.example, v), `${v.id}: ${v.example}`).toBe(true);
  });
  test('each collection supports a round', () => {
    for (const c of VOCAB_COLLECTIONS) expect(VOCAB.filter((v) => v.collection === c.id).length, c.id).toBeGreaterThanOrEqual(20);
  });
});

describe('Word Web boards', () => {
  test('each board has one solution of four distinct groups of four', () => {
    const ids = new Set<string>();
    for (const b of WEB_BOARDS) {
      expect(ids.has(b.id), b.id).toBe(false);
      ids.add(b.id);
      expect(b.groups.length).toBe(4);
      expect(b.groups.map((g) => g.level).sort().join('')).toBe('1234');
      const words = b.groups.flatMap((g) => g.words.map((w) => w.trim().toLowerCase()));
      expect(words.length, b.id).toBe(16);
      expect(new Set(words).size, `${b.id} has a repeated word`).toBe(16);
      for (const g of b.groups) {
        expect(g.explanation.length, `${b.id} ${g.title}`).toBeGreaterThan(10);
        expect(g.words.length).toBe(4);
      }
    }
    expect(WEB_BOARDS.length).toBeGreaterThanOrEqual(40);
  });
});

describe('Geography dataset', () => {
  test('197 states with flags, capitals and regions', () => {
    expect(COUNTRIES.length).toBe(197);
    const root = join(import.meta.dir, '..');
    for (const c of COUNTRIES) {
      expect(existsSync(join(root, 'public/flags', `${c.code}.svg`)), `flag ${c.code}`).toBe(true);
      expect(c.capitals.some((x) => x.credit === 'full'), `${c.name} has a full-credit capital`).toBe(true);
      expect(['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']).toContain(c.region);
    }
  });
  test('every tier has enough countries for a round', () => {
    for (const t of [1, 2, 3]) expect(COUNTRIES.filter((c) => c.tier === t).length).toBeGreaterThanOrEqual(30);
  });
  test('country names are unique after normalisation', () => {
    const names = COUNTRIES.map((c) => normalize(c.name));
    expect(new Set(names).size).toBe(names.length);
  });
});

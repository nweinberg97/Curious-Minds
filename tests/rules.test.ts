/** Answer validation and scoring rules for every game. */
import { describe, expect, test } from 'bun:test';
import { normalize, looseKey, levenshtein, AnswerIndex, stemCandidates } from '../src/engine/normalize';
import { speedBonus, chainMultiplier, streakMultiplier, hintFactor } from '../src/engine/scoring';
import { mulberry32, pickFresh } from '../src/engine/random';
import { applyReview, dueItems, BOX_DAYS } from '../src/engine/review';
import { judgeLink } from '../src/games/wordRush/graph';
import { judgeAnswer, indexes, pointsFor, chooseRound } from '../src/games/alphabet/logic';
import { isCorrect, scrambleLetters, nextDifficulty } from '../src/games/scramble/logic';
import { keywordEvaluator, usesWord } from '../src/games/define/evaluate';
import { BY_CODE, judgeCapital, matchCountry, distractors } from '../src/games/geo/logic';
import { judgeGuess, boardScore, WEB_BOARDS } from '../src/games/web/logic';
import { VOCAB } from '../src/content/vocab';

describe('normalisation', () => {
  test('case, accents, punctuation and leading "the"', () => {
    expect(normalize('  The Gambia ')).toBe('gambia');
    expect(normalize('Bogotá')).toBe('bogota');
    expect(normalize('São Tomé')).toBe('sao tome');
    expect(looseKey("N'Djamena")).toBe(looseKey('Ndjamena'));
    expect(normalize('Ørsted')).toBe('orsted');
  });
  test('plural and inflection stems', () => {
    expect(stemCandidates('berries')).toContain('berry');
    expect(stemCandidates('wolves')).toContain('wolf');
    expect(stemCandidates('running')).toContain('run');
  });
  test('typo distance', () => {
    expect(levenshtein('hippopotamus', 'hippopotamas')).toBe(1);
    expect(levenshtein('form', 'from')).toBe(1); // transposition
    expect(levenshtein('cat', 'dog')).toBe(3);
  });
  test('short answers must be exact; longer ones forgive one slip', () => {
    const idx = new AnswerIndex<string>();
    ['lion', 'giraffe', 'cat'].forEach((a) => idx.add(a, a));
    expect(idx.match('lino')).toBeNull();
    expect(idx.match('girafe')?.value).toBe('giraffe');
    expect(idx.match('cats')?.value).toBe('cat');
    expect(idx.match('bat')).toBeNull();
  });
});

describe('scoring', () => {
  test('speed bonus falls linearly from full to zero', () => {
    expect(speedBonus(1000, 100)).toBe(100);
    expect(speedBonus(6000, 100)).toBe(50);
    expect(speedBonus(12000, 100)).toBe(0);
  });
  test('multipliers', () => {
    expect(chainMultiplier(0)).toBe(1);
    expect(chainMultiplier(5)).toBe(1.5);
    expect(chainMultiplier(12)).toBe(2);
    expect(streakMultiplier(2)).toBe(1);
    expect(streakMultiplier(3)).toBe(1.25);
    expect(streakMultiplier(6)).toBe(1.5);
    expect(hintFactor(2)).toBe(0.5);
    expect(hintFactor(9)).toBe(0);
  });
});

describe('selection', () => {
  test('pickFresh avoids recent items and puts priority items in', () => {
    const pool = Array.from({ length: 20 }, (_, i) => `q${i}`);
    const recent = new Set(pool.slice(0, 15));
    const got = pickFresh(pool, 5, (x) => x, recent, { rand: mulberry32(1) });
    expect(got.every((g) => !recent.has(g))).toBe(true);
    const withPri = pickFresh(pool, 5, (x) => x, recent, { priority: ['q1'], maxPriority: 1, rand: mulberry32(2) });
    expect(withPri).toContain('q1');
    expect(new Set(withPri).size).toBe(5);
  });
});

describe('review schedule', () => {
  test('a miss is due now; correct answers push it out; breaks never reset anything', () => {
    const now = 1_000_000;
    let it = applyReview(undefined, { key: 'flag:fr', gameId: 'flag-finder', label: 'Flag of France', result: 'wrong' }, now);
    expect(it.box).toBe(0);
    expect(dueItems([it], now)).toHaveLength(1);
    it = applyReview(it, { key: 'flag:fr', gameId: 'flag-finder', label: 'Flag of France', result: 'correct' }, now);
    expect(it.box).toBe(1);
    expect(it.due).toBe(now + BOX_DAYS[1] * 86_400_000);
    expect(dueItems([it], now)).toHaveLength(0);
    expect(dueItems([it], now + 365 * 86_400_000)).toHaveLength(1);
  });
});

describe('Word Rush', () => {
  test('accepts shared clusters, direct links and compounds', () => {
    expect(judgeLink('coffee', 'mug', new Set()).ok).toBe(true);
    expect(judgeLink('salt', 'pepper', new Set()).ok).toBe(true);
    expect(judgeLink('fire', 'firefly', new Set()).ok).toBe(true);
    expect(judgeLink('tree', 'leaves', new Set()).ok).toBe(true);
  });
  test('rejects repeats and the same word in another form', () => {
    expect(judgeLink('ocean', 'oceans', new Set())).toMatchObject({ ok: false, why: 'same' });
    expect(judgeLink('beach', 'ocean', new Set(['ocean']))).toMatchObject({ ok: false, why: 'repeat' });
  });
  test('unknown words are offered for vouching, never silently accepted', () => {
    expect(judgeLink('music', 'zxqv', new Set())).toMatchObject({ ok: false, why: 'unknown' });
    expect(judgeLink('pen', 'penguin', new Set())).toMatchObject({ ok: false });
  });
  test('a vouched word can link via the last dictionary word', () => {
    const v = judgeLink('zorbing', 'sand', new Set(['beach', 'zorbing']), 'beach');
    expect(v.ok).toBe(true);
  });
});

describe('Alphabet Sprint', () => {
  const cats = [...indexes().values()];
  test('answers must start with the letter', () => {
    expect(judgeAnswer('lion', 't', cats, new Set())).toMatchObject({ ok: false });
  });
  test('plurals, accents and typos', () => {
    expect(judgeAnswer('Tigers', 't', cats, new Set()).ok).toBe(true);
    const hippo = judgeAnswer('hippopotamas', 'h', cats, new Set());
    expect(hippo.ok && hippo.fuzzy).toBe(true);
  });
  test('duplicates are refused', () => {
    const first = judgeAnswer('tiger', 't', cats, new Set());
    if (!first.ok) throw new Error('tiger should be valid');
    expect(judgeAnswer('tiger', 't', cats, new Set([`${first.answer.categoryId}:${first.answer.canonical}`])).ok).toBe(false);
  });
  test('made-up words are rejected', () => {
    expect(judgeAnswer('tzzzork', 't', cats, new Set()).ok).toBe(false);
  });
  test('deep cuts earn a bonus', () => {
    expect(pointsFor({ canonical: 'x', common: true, categoryId: 'a' })).toBe(100);
    expect(pointsFor({ canonical: 'x', common: false, categoryId: 'a' })).toBe(150);
  });
  test('round generation always yields three categories', () => {
    const r = mulberry32(42);
    for (let i = 0; i < 200; i++) expect(chooseRound(3, r).categories).toHaveLength(3);
  });
});

describe('Word Scramble', () => {
  test('scrambles never show the answer', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 300; i++) {
      const s = scrambleLetters('listen', r, ['silent', 'enlist', 'tinsel', 'inlets']);
      expect(['listen', 'silent', 'enlist', 'tinsel', 'inlets']).not.toContain(s);
      expect(s.split('').sort().join('')).toBe('eilnst');
    }
  });
  test('accepts the word and listed anagrams only', () => {
    const w = { word: 'melon', difficulty: 1 as const, definition: 'd', example: 'melon', alsoAccept: ['lemon'] };
    expect(isCorrect(' Melon ', w)).toBe(true);
    expect(isCorrect('lemon', w)).toBe(true);
    expect(isCorrect('nolem', w)).toBe(false);
  });
  test('difficulty adapts but never drops below the starting level', () => {
    expect(nextDifficulty(2, 'fast', 2, 2)).toBe(3);
    expect(nextDifficulty(2, 'miss', 0, 2)).toBe(2);
    expect(nextDifficulty(4, 'fast', 2, 1)).toBe(4);
  });
});

describe('Define It', () => {
  const laconic = VOCAB.find((v) => v.id === 'laconic') ?? VOCAB[0];
  test('keyword evaluator reports overlap and never claims a verdict', async () => {
    const r = await keywordEvaluator.evaluate({ word: laconic, definition: laconic.definition, sentence: laconic.example });
    expect(r.verdict).toBeUndefined();
    expect(r.matched.length).toBeGreaterThan(0);
    expect(r.usedWord).toBe(true);
    expect(keywordEvaluator.judgesMeaning).toBe(false);
  });
  test('sentence check handles inflections', () => {
    const v = { ...laconic, word: 'defenestrate', forms: ['defenestrated'] };
    expect(usesWord('They defenestrated the old printer.', v)).toBe(true);
    expect(usesWord('No relevant word here.', v)).toBe(false);
  });
});

describe('Flag Finder and Capital Quest', () => {
  test('country aliases', () => {
    expect(matchCountry('USA')?.code).toBe('us');
    expect(matchCountry('ivory coast')?.code).toBe('ci');
    expect(matchCountry('Czech Republic')?.code).toBe('cz');
    expect(matchCountry('the netherlands')?.code).toBe('nl');
    expect(matchCountry('Swizerland')?.code).toBe('ch');
  });
  test('capital spellings, multiple capitals and partial credit', () => {
    expect(judgeCapital('bogota', BY_CODE.get('co')!).result).toBe('correct');
    expect(judgeCapital('Kiev', BY_CODE.get('ua')!).result).toBe('correct');
    expect(judgeCapital('cape town', BY_CODE.get('za')!).result).toBe('correct');
    expect(judgeCapital('Bloemfontein', BY_CODE.get('za')!).result).toBe('correct');
    expect(judgeCapital('Abidjan', BY_CODE.get('ci')!).result).toBe('partial');
    expect(judgeCapital('Sydney', BY_CODE.get('au')!).result).toBe('wrong');
    expect(judgeCapital('washington', BY_CODE.get('us')!).result).toBe('correct');
  });
  test('distractors are three distinct other countries', () => {
    const fr = BY_CODE.get('fr')!;
    for (const d of [1, 2, 3]) {
      const ds = distractors(fr, d, 'flag', mulberry32(d));
      expect(ds).toHaveLength(3);
      expect(new Set(ds.map((x) => x.code)).size).toBe(3);
      expect(ds.some((x) => x.code === 'fr')).toBe(false);
    }
  });
  test('hard flag rounds use look-alikes', () => {
    const td = BY_CODE.get('td')!;
    const ds = distractors(td, 3, 'flag', mulberry32(3)).map((x) => x.code);
    expect(ds).toContain('ro');
  });
});

describe('Word Web', () => {
  const b = WEB_BOARDS[0];
  test('solves, one-away and repeats', () => {
    const g = b.groups[0];
    expect(judgeGuess(b, [...g.words], new Set(), new Set()).kind).toBe('solved');
    const other = b.groups[1].words[0];
    expect(judgeGuess(b, [g.words[0], g.words[1], g.words[2], other], new Set(), new Set()).kind).toBe('one-away');
    const sig = [g.words[0], g.words[1], g.words[2], other].map((w) => w.toLowerCase()).sort().join('|');
    expect(judgeGuess(b, [g.words[0], g.words[1], g.words[2], other], new Set(), new Set([sig])).kind).toBe('repeat');
  });
  test('board score', () => {
    expect(boardScore([1, 2, 3, 4], 0, false)).toBe(800);
    expect(boardScore([1, 2, 3, 4], 2, false)).toBe(650);
    expect(boardScore([1], 4, true)).toBe(0);
  });
});

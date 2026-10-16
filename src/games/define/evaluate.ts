import type { VocabWord } from '../../content/types';
import { normalize, stemCandidates } from '../../engine/normalize';

/**
 * Define It evaluation.
 *
 * We cannot understand free-form language without a language model, and we don't pretend to.
 * Evaluation is split into pluggable evaluators that all return the same shape:
 *   - `keyword`: deterministic overlap between the player's words and the reference definition/synonyms.
 *     It is labelled as overlap, never as a judgement of meaning.
 *   - `self`: the player's own verdict after reading the reference. This sets the score.
 *   - a future optional `model` evaluator can implement the same interface (e.g. a local or remote LLM)
 *     and the UI will show its verdict alongside, without other changes.
 */

export interface DefinitionAttempt {
  word: VocabWord;
  definition: string;
  sentence: string;
}

export type Verdict = 'nailed' | 'partly' | 'missed';

export interface EvaluationResult {
  evaluator: 'keyword' | 'self' | 'model';
  /** Shown verbatim; must describe what was actually checked. */
  summary: string;
  /** Reference ideas the player's definition shared. */
  matched: string[];
  /** Did the sentence use the word (or a listed form)? */
  usedWord: boolean;
  /** Only evaluators that genuinely judge meaning may set this. */
  verdict?: Verdict;
}

export interface DefinitionEvaluator {
  id: EvaluationResult['evaluator'];
  /** True if this evaluator judges meaning (only a model could). */
  judgesMeaning: boolean;
  evaluate(a: DefinitionAttempt): Promise<EvaluationResult>;
}

const STOP = new Set(
  'a an the and or but of to in on at by for with from as is are was were be been being that this these those it its into than then so such very more most less least not no someone something somebody anything who whom which what when where why how one ones someone person people thing things way often usually especially particular kind type sort can could may might will would should having have has do does did done make makes made your their his her our my them they you we he she i about over under also any all some each other own same just only even still'.split(
    ' ',
  ),
);

/** Content-word stems in a text, for overlap. */
export function contentStems(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of normalize(text).split(/[\s'-]+/)) {
    if (w.length < 3 || STOP.has(w)) continue;
    for (const s of stemCandidates(w)) if (s.length >= 3) out.add(s);
  }
  return out;
}

/** Reference ideas: content words of the definition plus each synonym (as phrases). */
export function referenceIdeas(word: VocabWord): string[] {
  const own = contentStems(word.word);
  const ideas = new Set<string>();
  for (const w of normalize(word.definition).split(/[\s'-]+/)) {
    if (w.length < 3 || STOP.has(w)) continue;
    if (stemCandidates(w).some((s) => own.has(s))) continue;
    ideas.add(w);
  }
  for (const s of word.synonyms) ideas.add(normalize(s));
  return [...ideas];
}

export function usesWord(sentence: string, word: VocabWord): boolean {
  const n = ` ${normalize(sentence)} `;
  const forms = [word.word, ...(word.forms ?? [])].map(normalize);
  if (forms.some((f) => n.includes(` ${f} `))) return true;
  // Regular inflections: plurals, -ed, -ing, -ly, -s
  const tokens = n.trim().split(/\s+/);
  const base = normalize(word.word);
  return tokens.some((t) => stemCandidates(t).includes(base));
}

export const keywordEvaluator: DefinitionEvaluator = {
  id: 'keyword',
  judgesMeaning: false,
  async evaluate(a) {
    const player = contentStems(a.definition);
    const matched: string[] = [];
    for (const idea of referenceIdeas(a.word)) {
      const parts = idea.split(' ').filter((p) => p.length >= 3 && !STOP.has(p));
      if (parts.length && parts.every((p) => stemCandidates(p).some((s) => player.has(s)))) matched.push(idea);
    }
    const usedWord = usesWord(a.sentence, a.word);
    const summary = matched.length
      ? `Your definition shares ${matched.length === 1 ? 'one idea' : `${matched.length} ideas`} with ours.`
      : a.definition.trim()
        ? 'No exact keyword overlap. You may still be right in other words, so compare and judge for yourself.'
        : 'No definition entered.';
    return { evaluator: 'keyword', summary, matched: matched.slice(0, 6), usedWord };
  },
};

export const VERDICT_POINTS: Record<Verdict, number> = { nailed: 100, partly: 50, missed: 0 };

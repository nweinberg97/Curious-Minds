import { WEB_BOARDS } from '../../content/webs';
import type { WebBoard, WebGroup } from '../../content/types';
import { WEB_GROUP_POINTS, WEB_MISTAKE_PENALTY, WEB_PERFECT_BONUS } from '../../engine/scoring';

export { WEB_BOARDS };
export const CLASSIC_MISTAKES = 4;

export const key = (w: string) => w.trim().toLowerCase();

export type GuessResult =
  | { kind: 'solved'; group: WebGroup }
  | { kind: 'one-away' }
  | { kind: 'miss' }
  | { kind: 'repeat' };

/** Judge a 4-word selection against a board. `tried` holds previous wrong guesses (sorted keys joined). */
export function judgeGuess(board: WebBoard, selection: string[], solved: ReadonlySet<number>, tried: ReadonlySet<string>): GuessResult {
  const sel = selection.map(key).sort();
  const sig = sel.join('|');
  if (tried.has(sig)) return { kind: 'repeat' };
  let bestOverlap = 0;
  for (let i = 0; i < board.groups.length; i++) {
    if (solved.has(i)) continue;
    const g = board.groups[i];
    const words = new Set(g.words.map(key));
    const overlap = sel.filter((w) => words.has(w)).length;
    if (overlap === 4) return { kind: 'solved', group: g };
    bestOverlap = Math.max(bestOverlap, overlap);
  }
  return bestOverlap === 3 ? { kind: 'one-away' } : { kind: 'miss' };
}

export function boardScore(solvedLevels: number[], mistakes: number, revealed: boolean): number {
  const base = solvedLevels.reduce((s, l) => s + WEB_GROUP_POINTS[l as 1 | 2 | 3 | 4], 0);
  const perfect = !revealed && mistakes === 0 && solvedLevels.length === 4 ? WEB_PERFECT_BONUS : 0;
  return Math.max(0, base - mistakes * WEB_MISTAKE_PENALTY + perfect);
}

/** All 16 words in display order (shuffled by caller). */
export function boardWords(b: WebBoard): string[] {
  return b.groups.flatMap((g) => g.words);
}

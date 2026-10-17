/**
 * Arcade tokens and player rank. Purely celebratory: tokens are earned by finishing rounds,
 * never spent, never lost, and nothing is locked behind them.
 *   tokens for a round = 1 for finishing + 1 per 100 points
 */
import type { SessionRecord } from '../storage/schema';

export function tokensForRound(score: number): number {
  return 1 + Math.floor(Math.max(0, score) / 100);
}

export function totalTokens(sessions: readonly SessionRecord[]): number {
  return sessions.reduce((t, s) => t + tokensForRound(s.score), 0);
}

export const RANKS = [
  { at: 0, name: 'Rookie' },
  { at: 15, name: 'Regular' },
  { at: 50, name: 'Sharp' },
  { at: 120, name: 'Quick Wit' },
  { at: 250, name: 'High Scorer' },
  { at: 450, name: 'Brainiac' },
  { at: 750, name: 'Mastermind' },
  { at: 1200, name: 'Arcade Legend' },
];

export interface Rank {
  level: number;
  name: string;
  /** Tokens collected within this level and needed to reach the next (null at the top). */
  into: number;
  span: number | null;
  next: string | null;
}

export function rankFor(tokens: number): Rank {
  let i = 0;
  while (i + 1 < RANKS.length && tokens >= RANKS[i + 1].at) i++;
  const cur = RANKS[i];
  const nxt = RANKS[i + 1];
  return {
    level: i + 1,
    name: cur.name,
    into: tokens - cur.at,
    span: nxt ? nxt.at - cur.at : null,
    next: nxt ? nxt.name : null,
  };
}

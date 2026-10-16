/**
 * Shared scoring utilities. Each game composes these; none of them punish breaks or absence.
 */

/** Full bonus within `fastMs`, falling linearly to zero at `slowMs`. */
export function speedBonus(elapsedMs: number, max: number, fastMs = 2000, slowMs = 10000): number {
  if (elapsedMs <= fastMs) return max;
  if (elapsedMs >= slowMs) return 0;
  return Math.round(max * (1 - (elapsedMs - fastMs) / (slowMs - fastMs)));
}

/** Word Rush chain multiplier: x1, x1.5 from the 5th link, x2 from the 10th. */
export function chainMultiplier(linkIndex: number): number {
  if (linkIndex >= 10) return 2;
  if (linkIndex >= 5) return 1.5;
  return 1;
}

/** Quiz streak multiplier: x1, x1.25 after 3 in a row, x1.5 after 6. */
export function streakMultiplier(streak: number): number {
  if (streak >= 6) return 1.5;
  if (streak >= 3) return 1.25;
  return 1;
}

export function hintFactor(hintsUsed: number): number {
  return Math.max(0, 1 - 0.25 * hintsUsed);
}

export const WEB_GROUP_POINTS = { 1: 100, 2: 150, 3: 200, 4: 250 } as const;
export const WEB_MISTAKE_PENALTY = 25;
export const WEB_PERFECT_BONUS = 100;

export function accuracy(correct: number, attempted: number): number {
  return attempted === 0 ? 0 : correct / attempted;
}

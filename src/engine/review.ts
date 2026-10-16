/**
 * Lightweight Leitner review. Each learnable item (a flag, a capital, a word) has a box.
 * Miss → box 0 (due now). Correct → next box, due after BOX_DAYS[box] days.
 * Missing a day never resets anything.
 */

export const BOX_DAYS = [0, 1, 3, 7, 21, 60];
const DAY = 86_400_000;

export interface ReviewItem {
  /** "<kind>:<id>", e.g. "flag:fr", "capital:fr", "vocab:laconic". */
  key: string;
  gameId: string;
  /** What the player sees in lists: "Flag of France". */
  label: string;
  box: number;
  due: number;
  seen: number;
  correct: number;
  wrong: number;
  lastSeen: number;
  lastResult: 'correct' | 'wrong' | 'partial';
  /** Player asked to revisit this explicitly (Define It "Revisit"). */
  bookmarked?: boolean;
}

export interface ReviewUpdate {
  key: string;
  gameId: string;
  label: string;
  result: 'correct' | 'wrong' | 'partial';
  bookmark?: boolean;
}

export function applyReview(prev: ReviewItem | undefined, u: ReviewUpdate, now = Date.now()): ReviewItem {
  const base: ReviewItem = prev ?? {
    key: u.key,
    gameId: u.gameId,
    label: u.label,
    box: 1,
    due: now,
    seen: 0,
    correct: 0,
    wrong: 0,
    lastSeen: now,
    lastResult: u.result,
  };
  let box = base.box;
  if (u.result === 'wrong') box = 0;
  else if (u.result === 'partial') box = Math.max(0, Math.min(box, 1));
  else box = prev ? Math.min(box + 1, BOX_DAYS.length - 1) : 2; // first-time correct: known already, check back in 3 days
  const item: ReviewItem = {
    ...base,
    label: u.label,
    box,
    due: now + BOX_DAYS[box] * DAY,
    seen: base.seen + 1,
    correct: base.correct + (u.result === 'correct' ? 1 : 0),
    wrong: base.wrong + (u.result === 'wrong' ? 1 : 0),
    lastSeen: now,
    lastResult: u.result,
    bookmarked: u.bookmark ?? base.bookmarked,
  };
  return item;
}

/** Items worth revisiting now: due and not yet mastered, or bookmarked. Box 0 (missed) first. */
export function dueItems(items: Iterable<ReviewItem>, now = Date.now()): ReviewItem[] {
  const out: ReviewItem[] = [];
  for (const it of items) {
    if (it.bookmarked || (it.due <= now && it.wrong > 0 && it.box < 4)) out.push(it);
  }
  return out.sort((a, b) => a.box - b.box || a.due - b.due);
}

/** Merge two records of the same item from different devices: keep the one seen most recently, sum counts. */
export function mergeReview(a: ReviewItem, b: ReviewItem): ReviewItem {
  const newer = a.lastSeen >= b.lastSeen ? a : b;
  const older = newer === a ? b : a;
  return {
    ...newer,
    seen: Math.max(a.seen, b.seen, newer.seen),
    correct: Math.max(a.correct, b.correct),
    wrong: Math.max(a.wrong, b.wrong),
    bookmarked: newer.bookmarked ?? older.bookmarked,
  };
}

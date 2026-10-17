import type { ComponentType } from 'react';
import type { ReviewItem, ReviewUpdate } from './review';
import type { PlayerStore } from '../storage/store';

export type CategoryId = 'words' | 'world' | 'connections';

export interface ComingSoon {
  title: string;
  family: string;
  blurb: string;
  color: string;
  glyph: string;
}

export interface Category {
  id: CategoryId;
  title: string;
  /** What players get from this family, in a few words. */
  blurb: string;
  accent: string;
}

/** A selectable variant of a game (timed, relaxed, multiple choice…). Each mode keeps its own best score. */
export interface ModeOption {
  id: string;
  label: string;
  hint: string;
  /** True for untimed / forgiving modes; chosen by default when the player prefers relaxed play. */
  relaxed?: boolean;
}

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface RoundConfig {
  mode: string;
  difficulty: number;
  /** Game-specific extra choice, e.g. a vocabulary collection. */
  option?: string;
  /** Review items due for this game, to mix into the round. */
  review: ReviewItem[];
  /** True when the player started from the review shelf: favour review items. */
  reviewFocus: boolean;
}

/** One thing worth knowing, shown on the round summary. */
export interface Learning {
  id: string;
  title: string;
  body: string;
  /** Optional second line, e.g. an example sentence or a fact. */
  extra?: string;
  outcome?: 'correct' | 'wrong' | 'partial' | 'info';
  /** Optional image (flag path). */
  image?: string;
  /** If set, the summary offers a "Revisit" toggle for this item. */
  bookmark?: { key: string; label: string };
}

export interface RoundStat {
  label: string;
  value: string;
}

export interface RoundResult {
  score: number;
  correct: number;
  attempted: number;
  durationMs: number;
  /** Headline line under the score, e.g. "9-link chain". */
  headline: string;
  stats: RoundStat[];
  /** Numbers to persist with the session for progress charts. */
  numbers?: Record<string, number>;
  breakdown?: Record<string, [number, number]>;
  learnings: Learning[];
  learningsTitle?: string;
  reviewUpdates: ReviewUpdate[];
  seenIds: string[];
}

export interface PlayProps {
  config: RoundConfig;
  store: PlayerStore;
  paused: boolean;
  onFinish: (r: RoundResult) => void;
  /** Report a score change so the shared header can animate it. */
  onScore: (score: number) => void;
}

export interface GameDef {
  id: string;
  title: string;
  category: CategoryId;
  /** One line: the mechanic, as a player would describe it. */
  tagline: string;
  /** Typical round length, e.g. "60 sec". */
  length: string;
  /** Typical round length in minutes, for the "quick games" filter. */
  minutes: number;
  /** The game's own colour: cabinet, buttons, accents. */
  color: string;
  /** One or two characters shown on its arcade button. */
  glyph: string;
  howTo: string[];
  modes: ModeOption[];
  /** Difficulty labels, index + 1 = difficulty. Omit for games without difficulty. */
  difficulties?: string[];
  /** Optional extra choice shown on the intro card. */
  options?: { label: string; choices: ChoiceOption[] };
  /** Whether the shared header shows a countdown (the game reports remaining time itself). */
  component: ComponentType<PlayProps>;
}

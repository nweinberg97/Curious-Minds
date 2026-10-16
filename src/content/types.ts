/**
 * Content model shared by every game.
 *
 * Content is plain, typed data that ships with the app. Every bank is checked by
 * `tests/content.test.ts` before a build is considered good, so a typo in a data
 * file fails loudly instead of reaching a player.
 */

export type Difficulty = 1 | 2 | 3 | 4;

/** Where a factual claim comes from. Shown on reveal screens for factual content. */
export interface Provenance {
  /** Short human-readable source, e.g. "mledoze/countries dataset (ODbL)". */
  source: string;
  /** True when the text was written by the Curious Minds editors rather than derived from a dataset. */
  editorial?: boolean;
}

/* ---------------- Word Rush (association graph) ---------------- */

/**
 * A cluster is a named idea plus words strongly tied to it.
 * Two words are associated when they share a cluster, or when an explicit
 * link joins them. The cluster label doubles as the explanation shown to players
 * ("ocean ↔ tide: both belong to *the sea*").
 */
export interface AssociationCluster {
  id: string;
  /** Lower-case phrase that reads naturally after "both relate to …" */
  label: string;
  words: string[];
}

/** A direct pair link for relationships clusters miss, e.g. ["bread","butter"]. Optional note explains it. */
export type AssociationLink = [string, string, string?];

/* ---------------- Alphabet Sprint ---------------- */

export interface AlphabetCategory {
  id: string;
  /** Singular noun phrase used in the prompt: "an animal", "a country". */
  prompt: string;
  /** Plural title: "Animals". */
  title: string;
  /**
   * Accepted answers. Prefix an entry with "*" to mark it as a common answer
   * (no rarity bonus). Alternative spellings for the same answer go in one entry
   * separated by "|": "yoghurt|yogurt". The first spelling is canonical.
   */
  answers: string[];
}

/* ---------------- Word Scramble & Define It ---------------- */

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb';

export interface ScrambleWord {
  word: string;
  difficulty: Difficulty;
  /** One-line plain-English definition. */
  definition: string;
  /** A natural example sentence using the word. */
  example: string;
  /** Optional etymology or surprising fact. Must be accurate. */
  note?: string;
  /** Other real English words made of exactly the same letters, which are also accepted. */
  alsoAccept?: string[];
}

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: PartOfSpeech;
  difficulty: Difficulty;
  /** Collection id, see VOCAB_COLLECTIONS. */
  collection: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  /** Nuance, common misuse or usage tip. */
  nuance?: string;
  /** Extra words that count as using the word in a sentence (irregular inflections). */
  forms?: string[];
}

export interface VocabCollection {
  id: string;
  title: string;
  blurb: string;
}

/* ---------------- Word Web ---------------- */

export interface WebGroup {
  /** The connection, phrased as a title: "Things with keys". */
  title: string;
  words: [string, string, string, string];
  /** One or two sentences explaining why the words belong together. */
  explanation: string;
  /** 1 = most straightforward, 4 = trickiest. Each board uses 1-4 once. */
  level: 1 | 2 | 3 | 4;
}

export interface WebBoard {
  id: string;
  /** Short evocative board name. */
  title: string;
  groups: [WebGroup, WebGroup, WebGroup, WebGroup];
  /** Optional note about the red herrings on this board, shown after the round. */
  herring?: string;
}

/* ---------------- World Knowledge ---------------- */

export type Region = 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';

export interface CapitalEntry {
  name: string;
  /** Alternative spellings accepted for this capital. */
  variants?: string[];
  /** Role when a country has several, e.g. "executive", "legislative". */
  role?: string;
  /** 'full' = correct answer, 'partial' = related city that earns partial credit with an explanation. */
  credit: 'full' | 'partial';
}

export interface Country {
  /** ISO 3166-1 alpha-2, lower-case. Also the flag file name. */
  code: string;
  name: string;
  officialName: string;
  /** Accepted alternative names. */
  aliases: string[];
  region: Region;
  subregion: string;
  capitals: CapitalEntry[];
  /** Short note on capital edge cases or political status, neutral in tone. */
  capitalNote?: string;
  statusNote?: string;
  landlocked: boolean;
  /** Names of bordering countries in this dataset. */
  borders: string[];
  areaKm2: number;
  /** 1 widely known, 2 moderately known, 3 deep cut. */
  tier: 1 | 2 | 3;
  /** Editorial flag fact, when we have one. */
  flagFact?: string;
}

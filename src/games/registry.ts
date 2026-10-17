import type { Category, ComingSoon, GameDef } from '../engine/types';
import WordRush from './wordRush/WordRush';
import AlphabetSprint from './alphabet/AlphabetSprint';
import WordScramble from './scramble/WordScramble';
import DefineIt, { defineOptions } from './define/DefineIt';
import { makeGeoGame } from './geo/GeoQuiz';
import WordWeb from './web/WordWeb';

/**
 * The game catalogue. To add a game: build a component that implements PlayProps,
 * then add one entry here. Home, routing, persistence, summaries and progress pick it up automatically.
 */

export const CATEGORIES: Category[] = [
  { id: 'words', title: 'Wordplay', blurb: 'Vocabulary, fluency and quick thinking', accent: 'var(--pink)' },
  { id: 'world', title: 'World', blurb: 'Flags, capitals and a sharper mental map', accent: 'var(--sky)' },
  { id: 'connections', title: 'Connections', blurb: 'Spot the hidden links between ideas', accent: 'var(--grape-pop)' },
];

/** Games in the workshop. Shown on the home page so players know more is coming; not playable yet. */
export const COMING_SOON: ComingSoon[] = [
  { title: 'Number Crunch', family: 'Mental math', blurb: 'Quick sums, sneaky percentages and estimates against the clock.', color: '#FFC93C', glyph: '7×8' },
  { title: 'Memory Palace', family: 'Memory', blurb: 'Glance at a scene, then rebuild it from memory.', color: '#45D4F5', glyph: 'M?' },
  { title: 'Logic Locks', family: 'Logic', blurb: 'Crack the code with clues and pure deduction.', color: '#A8E063', glyph: 'IF' },
  { title: 'Riddle Room', family: 'Lateral thinking', blurb: 'Riddles and brain-benders that reward a sideways look.', color: '#FF5FA8', glyph: '??' },
  { title: 'Timeline', family: 'History', blurb: 'Drop events into the right order through history.', color: '#FF8A3D', glyph: '1→2' },
  { title: 'Nature Lab', family: 'Science', blurb: 'Animals, elements and how the world works.', color: '#B98CFF', glyph: 'Fe' },
];

const geoModes = [
  { id: 'pick', label: 'Quick pick', hint: '4 choices, 15 sec each' },
  { id: 'recall', label: 'Recall', hint: 'Type it, 20 sec each' },
  { id: 'relaxed', label: 'Relaxed', hint: 'Type it, no clock', relaxed: true },
];
const geoDifficulties = ['Familiar', 'Worldly', 'Deep cuts'];

export const GAMES: GameDef[] = [
  {
    id: 'word-rush',
    title: 'Word Rush',
    category: 'words',
    tagline: 'Chain word associations as fast as your mind can jump.',
    length: '60 sec',
    minutes: 1,
    color: '#FF5FA8',
    glyph: '→',
    howTo: [
      'You get a word. Type the first related word that comes to mind and press Enter.',
      'Your word becomes the next prompt. Keep the chain going: ocean, beach, sand, desert, heat.',
      'Quick answers score more, and long chains multiply your points.',
      "If our dictionary doesn't know a link you're sure of, press Enter again to count it as your call for half points.",
    ],
    modes: [
      { id: 'sprint60', label: '60 seconds', hint: 'The classic' },
      { id: 'sprint90', label: '90 seconds', hint: 'Longer chains' },
      { id: 'relaxed', label: 'Relaxed', hint: '12 links, no clock', relaxed: true },
    ],
    component: WordRush,
  },
  {
    id: 'alphabet-sprint',
    title: 'Alphabet Sprint',
    category: 'words',
    tagline: 'One letter, three categories. Name as many as you can.',
    length: '60 sec',
    minutes: 1,
    color: '#FFC93C',
    glyph: 'Az',
    howTo: [
      'A letter and three categories appear, like an animal, a city or a food.',
      'Type any answer that fits one of the categories and starts with the letter.',
      'Every answer scores 100. Less obvious answers earn a 50-point deep-cut bonus.',
      'Spelling slips on longer words are forgiven, and you can switch to a new letter any time.',
    ],
    modes: [
      { id: 's30', label: '30 seconds', hint: 'Short and sharp' },
      { id: 's60', label: '60 seconds', hint: 'The classic' },
      { id: 's90', label: '90 seconds', hint: 'Go deep' },
      { id: 'relaxed', label: 'Relaxed', hint: 'No clock', relaxed: true },
    ],
    component: AlphabetSprint,
  },
  {
    id: 'word-scramble',
    title: 'Word Scramble',
    category: 'words',
    tagline: 'Unscramble eight words that get trickier as you go.',
    length: '2 min',
    minutes: 2,
    color: '#FF8A3D',
    glyph: '?!',
    howTo: [
      'Rearrange the letters to find the word. Type it, or tap the letters in order.',
      'Faster solves score more. Each hint reveals the next letter and costs 25% of that word.',
      'Solve quickly and the words get harder.',
      'After each word you get its meaning and where it comes from.',
    ],
    modes: [
      { id: 'timed', label: 'Timed', hint: '30 sec per word' },
      { id: 'relaxed', label: 'Relaxed', hint: 'No clock', relaxed: true },
    ],
    difficulties: ['Starter', 'Standard', 'Tricky', 'Expert'],
    component: WordScramble,
  },
  {
    id: 'define-it',
    title: 'Define It',
    category: 'words',
    tagline: 'Explain a word in your own words, then see how close you were.',
    length: '3 min',
    minutes: 3,
    color: '#A8E063',
    glyph: 'Df',
    howTo: [
      'Write what the word means and use it in a sentence.',
      'Compare with our definition, examples, synonyms and usage notes.',
      'A keyword check shows shared ideas, but only you can judge meaning. Score yourself honestly.',
      'Words you miss or save come back later for review.',
    ],
    modes: [
      { id: 'write', label: 'Write it', hint: 'Definition and sentence' },
      { id: 'quick', label: 'Think it', hint: 'Recall, then reveal', relaxed: true },
    ],
    difficulties: ['Any level', 'Everyday', 'Advanced'],
    options: { label: 'Collection', choices: defineOptions() },
    component: DefineIt,
  },
  {
    id: 'flag-finder',
    title: 'Flag Finder',
    category: 'world',
    tagline: 'Name the country behind ten flags.',
    length: '2 min',
    minutes: 2,
    color: '#45D4F5',
    glyph: 'Fl',
    howTo: [
      'A flag appears. Pick the country, or type it in Recall mode.',
      'Fast answers earn a bonus, and three right in a row starts a streak multiplier.',
      'Each answer reveals the capital, region and a story behind the flag.',
      'Flags you miss come back in later rounds until they stick.',
    ],
    modes: geoModes,
    difficulties: geoDifficulties,
    component: makeGeoGame('flag'),
  },
  {
    id: 'capital-quest',
    title: 'Capital Quest',
    category: 'world',
    tagline: 'Ten countries. Name their capitals.',
    length: '2 min',
    minutes: 2,
    color: '#6E8BFF',
    glyph: 'Cq',
    howTo: [
      'A country appears. Type its capital, or pick from four in Quick pick.',
      'Accents are optional, and common spellings like Kiev or Bogota count.',
      'Countries with more than one capital accept any of them. Former or secondary capitals earn half points.',
      'Each answer comes with a fact, and misses return for review.',
    ],
    modes: geoModes,
    difficulties: geoDifficulties,
    component: makeGeoGame('capital'),
  },
  {
    id: 'word-web',
    title: 'Word Web',
    category: 'connections',
    tagline: 'Sixteen words, four hidden groups. Find the links.',
    length: '3 min',
    minutes: 3,
    color: '#B98CFF',
    glyph: '4×4',
    howTo: [
      'Select four words you think share a connection, then submit.',
      'Groups range from straightforward to devious. Watch for red herrings.',
      '"One away" means three of your four belong together.',
      'Classic gives you four mistakes. Relaxed gives you as many as you need.',
    ],
    modes: [
      { id: 'classic', label: 'Classic', hint: 'Four mistakes' },
      { id: 'relaxed', label: 'Relaxed', hint: 'Unlimited tries', relaxed: true },
    ],
    component: WordWeb,
  },
];

export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

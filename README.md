# Curious Minds

A local-first arcade of quick brain games. Seven games in three families, playable from one link, with no account, no backend and no tracking.

> Have fun. Get sharper. Learn something new. Play again.

| Family | Game | What you do |
|---|---|---|
| Wordplay | **Word Rush** | Chain word associations against the clock |
| | **Alphabet Sprint** | One letter, three categories, as many answers as you can |
| | **Word Scramble** | Unscramble eight words that adapt to your pace |
| | **Define It** | Explain a word in your own words, then compare |
| World | **Flag Finder** | Name the country behind ten flags |
| | **Capital Quest** | Name the capitals of ten countries |
| Connections | **Word Web** | Find four hidden groups of four among sixteen words |

The home page is an arcade machine: press its buttons to try a 20-second taster of any game before starting a full round. Every finished round earns tokens towards an arcade rank, and a "workshop" shows the games coming next.

Every round ends with something to learn (definitions, flag stories, capital facts, why groups connect), and misses come back later through a light spaced-review queue. Every game is free and unlimited, with a relaxed or untimed mode.

Product thinking, naming and design direction: [docs/PRODUCT.md](docs/PRODUCT.md).

## Run it

Requires [Bun](https://bun.sh) 1.1 or newer.

```sh
bun install
bun run dev        # http://localhost:5173, rebuilds on save
bun test           # unit and content tests
bun run build      # static site in dist/
```

`bun run check` runs the type checker, the tests and a production build.

## Deploy

`dist/` is a static site. Upload it to any static host (GitHub Pages, Netlify, Cloudflare Pages, S3). It must be served over HTTPS for offline mode. All paths are relative, so it works from a sub-path such as `https://you.github.io/curious-minds/`.

A GitHub Actions workflow in `.github/workflows/deploy.yml` builds, tests and publishes to GitHub Pages on every push to `main`. Enable it under **Settings → Pages → Source: GitHub Actions**.

`bun run build:artifact` produces `dist-artifact/`, a single page (plus `flags/`) for hosting inside a Claude artifact. There, service workers aren't available, so the app explains that offline play needs the self-hosted version, and exports go through the viewer's download prompt.

## Architecture

```
src/
  engine/        shared framework: types, normalisation, scoring, timers, review schedule, sound, randomness
  storage/       IndexedDB backend, in-memory fallback, PlayerStore, export/import schema
  content/       typed content banks (+ countries.generated.ts from scripts/build-geo.ts)
  games/         one folder per game: pure logic (logic.ts / graph.ts / evaluate.ts) + a React component
  games/registry.ts   the catalogue: add a game here and it appears everywhere
  ui/            App shell, Home, GameScreen (intro → play → summary), Progress, Settings
  styles/app.css design tokens and all styles
  sw.template.js service worker template
scripts/         build, dev server, geography data generator
tests/           bun unit tests + an optional Playwright browser playthrough (tests/e2e)
```

**Game framework.** A game is a `GameDef` (metadata, how-to, modes, difficulties) plus a component that receives `PlayProps` (`config`, `store`, `paused`, `onScore`, `onFinish`). The shared `GameScreen` owns the intro card, mode and difficulty choice, pausing (on tab switch, blur or Esc), score display, persistence and the round summary. A game reports a `RoundResult`: score, stats, learning cards and review updates. Shared utilities cover timers (`useCountdown`, pausable), scoring (`speedBonus`, chain and streak multipliers), answer matching (`AnswerIndex`: accents, plurals, typos), fresh-question selection (`pickFresh`), and the review schedule.

**Adding a game:** write `src/games/<name>/<Name>.tsx` implementing `PlayProps`, add art in `src/ui/art.tsx`, register it in `registry.ts`. Home, routing (`#<id>`, `#play.<id>`, `#review.<id>`), records, progress and export pick it up automatically.

**State.** `PlayerStore` keeps the player's data in memory and writes through to IndexedDB. React reads it with `useSyncExternalStore`. If IndexedDB is blocked, a memory backend keeps the app playable and the UI says progress won't survive the tab.

## Data: schema and migrations

IndexedDB database `curious-minds`, version 1 (`src/storage/schema.ts`, `src/storage/db.ts`):

| Store | Key | Contents |
|---|---|---|
| `sessions` | `id` | One finished round: game, mode, difficulty, score, correct/attempted, duration, optional stats and region breakdown. Capped at 3,000. |
| `items` | `key` (`flag:fr`, `capital:fr`, `vocab:laconic`, `scramble:quixotic`) | Review state: Leitner box, due time, seen/correct/wrong counts, bookmark |
| `records` | `gameId:mode` | Best score, when it was set, plays |
| `meta` | `settings`, `profile` | Settings (sound, motion, relaxed default, per-game choices); profile (days played, recent games, recently served content ids) |

**Migrations.** Bump `DB_VERSION` and add an `if (oldVersion < N)` block to `migrate()` in `db.ts`. Never edit earlier blocks. Rows are validated on load; malformed rows are skipped and counted rather than crashing the app.

**Export/import.** Settings → Your data exports `curious-minds-YYYY-MM-DD.json` (`{ app, schema, exportedAt, data }`). Import validates the file, skips damaged rows, previews what it contains, then **merges** (keeps both devices' rounds, the better best per game, the most recent review state per item) or **replaces**. Files from a newer schema are refused with a clear message.

## Content

All content is typed data in `src/content/`, validated by `tests/content.test.ts`.

| Bank | File | Size |
|---|---|---|
| Word association graph | `associations.ts` | 439 clusters, 6,100+ words, 800+ direct links, 150 starter words |
| Alphabet answer lists | `alphabet/*.ts` + countries | 16 categories, 6,000+ answers |
| Scramble words | `scramble.ts` | 339 words, 4 levels, definitions, examples, etymology notes |
| Vocabulary | `vocab.ts` | 225 words in 6 collections with synonyms, antonyms and usage notes |
| Word Web boards | `webs.ts` | 60 boards with explanations and red-herring notes |
| Countries | `geoEditorial.ts` → `countries.generated.ts` | 197 states, flags, capitals with roles and variants, flag and capital facts |

**How answers are judged**

- *Word Rush:* a link is valid when both words share an authored cluster, are joined by a direct link, or form a compound (`fire` → `firefly`). Unknown links can be "vouched" for half points and are labelled as the player's call. Nothing is presented as AI judgement.
- *Alphabet Sprint:* authored lists; case, accents, punctuation and plurals are ignored; one typo is forgiven on answers of 6+ letters (two on 10+), and the first letter must be right. Editors mark common answers with `*`; others earn a deep-cut bonus.
- *Define It:* a keyword-overlap check (labelled as such) plus the player's own verdict. `DefinitionEvaluator` is the seam for an optional language-model evaluator later.
- *Geography:* names, aliases and capital variants with diacritic-free spellings. Countries with several capitals accept any; related cities (former or secondary capitals) earn partial credit with an explanation.

**Adding content.** Append entries to the relevant file, following the types in `content/types.ts`, then run `bun test`. The tests catch duplicates, malformed words, anagram collisions in Scramble, boards without 16 distinct words, missing flags and more. For geography, edit `geoEditorial.ts` and regenerate with `bun scripts/build-geo.ts <vendor-dir>`, where the vendor dir holds checkouts of [mledoze/countries](https://github.com/mledoze/countries) and [lipis/flag-icons](https://github.com/lipis/flag-icons).

## Tests

- `bun test`: 53 tests, about 28,000 assertions, covering content validity, answer rules for every game, scoring, the review schedule, persistence, malformed data, export/import and merging.
- `tests/e2e/playthrough.py`: a Playwright run on desktop and mobile viewports that plays all seven games end to end, replays, checks persistence after reload, the review shelf, progress, export, clear, import, malformed import, horizontal overflow and console errors.

```sh
bun tests/e2e/dump-answers.ts /tmp/cm-answers.json
bun run dev &
python3 tests/e2e/playthrough.py http://localhost:5173/ /tmp/cm-answers.json
```

## Privacy

No accounts, analytics, ads or trackers. No microphone, camera or location. Answers never leave the device. The only third-party request is Google Fonts on first load (cached by the service worker afterwards).

## Known limitations

- Word Rush's dictionary is broad but finite; unusual but valid associations need vouching.
- Define It can't judge meaning; scoring relies on honest self-assessment.
- Editorial facts were written and reviewed carefully but not independently sourced line by line; corrections are welcome.
- Equatorial Guinea is moving its capital from Malabo to Ciudad de la Paz (decree of January 2026); both currently earn full credit. Revisit when the move completes.
- Progress lives in one browser; moving it between devices is manual (export/import).

## Next improvements

1. Daily shared challenge per game (same board for everyone that day, still unlimited replays).
2. Shareable result cards with no personal data.
3. Code-split content banks per game to shrink the first download (currently ~830 KB minified, mostly content).
4. More Word Web boards and a validation tool that flags words fitting more than one group title.
5. Optional local or bring-your-own-key language-model evaluator for Define It and Word Rush vouching.
6. New families from the roadmap: memory, mental math, logic.

## Credits and licences

- Code and original content: Curious Minds.
- Flags: [flag-icons](https://github.com/lipis/flag-icons) by Panayiotis Lipiridis, MIT licence.
- Country data: [mledoze/countries](https://github.com/mledoze/countries), Open Database License 1.0.
- Typefaces: Lilita One and Rubik via Google Fonts, SIL Open Font License.

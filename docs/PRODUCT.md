# Curious Minds — product definition

## 1. Name

The studio is **Curious Minds** (chosen by the founder). Before that decision we explored the field, and the shortlist is kept here for reference. Trademark and domain availability were **not** checked for any of them.

| Name | Memorable | Playful | Fits all game types | Premium | Easy to say and share | Room to grow |
|---|---|---|---|---|---|---|
| Witclub | ● | ● | ◐ | ◐ | ● | ◐ "club" implies membership, which the brief rules out |
| Knack | ● | ● | ● | ● | ● | ● very common word, crowded namespace |
| Parlour | ◐ | ● | ● | ● | ◐ US/UK spelling split | ● |
| Whetstone | ◐ | ○ | ● | ● | ◐ | ● |
| Hunch | ● | ● | ◐ | ◐ | ● | ◐ skews toward guessing |
| Quickwit | ◐ | ● | ◐ | ○ | ● | ◐ speed-only connotation |
| Night Owl Arcade | ● | ● | ● | ◐ | ◐ long | ● |
| Brainyard | ◐ | ● | ● | ○ | ● | ● |
| Mindmint | ◐ | ● | ● | ◐ | ● | ● |
| Kindling | ◐ | ◐ | ● | ● | ● | ● |
| Lamplight | ◐ | ◐ | ● | ● | ● | ● |
| **Curious Minds** | ● | ● | ● | ● | ● | ● |

**Why Curious Minds works:** it names the player rather than the mechanic, so it covers words, geography, logic or anything added later. It flatters without implying status or exclusivity. It is two plain words anyone can spell after hearing once. The brand mark shortens it to a lower-case **curious** wordmark with a small "minds" counter-weight, which gives the identity a distinctive typographic signature.

## 2. Vision and positioning

> Have fun. Get sharper. Learn something new. Play again.

A personal arcade for your brain: seven quick, polished games in three families, playable from a single link with no account. It sits between NYT Games (editorial taste, daily rituals) and the old Facebook game era (instant, social, endlessly replayable), with every round ending in something you didn't know before.

**What it is not:** an edtech dashboard, a streak-anxiety machine, or a freemium funnel. No energy, no lives that stop play, no paywalls, no cooldowns, no accounts, no trackers.

## 3. Audiences and core use cases

- **The two-minute player** — waiting for a kettle or a bus. Needs: one tap to a fun round, "Surprise me".
- **The self-improver** — wants a bigger vocabulary or a better mental map. Needs: themed collections, review of misses, progress by region and category.
- **The puzzler** — loves NYT Connections-style insight. Needs: high-quality Word Web boards and clear explanations.
- **The household** — passes a phone around. Needs: no sign-in, readable on mobile, relaxed modes.

## 4. Information architecture

```
Home (the arcade)
├── Spotlight: today's pick (deterministic by date, never gated)
├── Continue: recently played
├── Wordplay      — Word Rush · Alphabet Sprint · Word Scramble · Define It
├── World         — Flag Finder · Capital Quest
├── Connections   — Word Web
├── Review shelf  — misses due for another look (links into the right game in review mode)
└── Footer: Progress · Settings & data
Game  (intro card → play → round summary with learning → play again)
Progress (what's improving, what you learned, what to revisit, best rounds)
Settings & data (sound, motion, timers, export/import/clear, privacy statement)
```

Routing uses bare URL hashes (`#word-rush`, `#progress`) so any screen can be linked.

## 5. Games

Every game uses the same lifecycle: **intro** (one-line rules, mode, difficulty, start) → **play** → **summary** (score, personal best, learning cards, play again). Every game has a relaxed or untimed option.

### Word Rush (Wordplay)
Chain associations from a starting word. 60-second round (or 90 s, or untimed "Relaxed: 12 links").
- **Validation:** an authored association graph of ~440 clusters (6,000+ words) and 800+ direct links. A link is valid when the two words share a cluster or are joined by a direct link, after normalisation (case, plurals, simple inflections). Compound words are accepted when one word contains the other ("fire" → "firefly").
- **Transparent fallback:** when the dictionary has no link, the player can **vouch** for it. The link counts at half points and is marked "your call" in the summary. The game never pretends to have semantically judged it.
- **Rules:** no repeats within a chain; the same word in another form doesn't count ("ocean" → "oceans").
- **Scoring:** 100 per link + up to 100 speed bonus (full within 2 s, linear to 0 at 10 s) × chain multiplier (×1, ×1.5 at 5 links, ×2 at 10). Vouched links: 50, no bonus, multiplier kept.
- **Learning:** the summary explains each link ("beach ↔ sand: both relate to the seaside") and shows strong associations you didn't use.

### Alphabet Sprint (Wordplay)
A letter + three categories; type as many answers as you can. 30/60/90 s or untimed.
- **Validation:** authored answer banks (animals, food, cities, jobs, instruments, sports, scientists, feelings, household objects, nature, clothing, transport, fruit & veg, plus countries from the geography dataset). Matching ignores case, accents, punctuation and plurals, and tolerates one typo for answers of 6+ letters. The canonical spelling is shown ("Counted as *hippopotamus*").
- **Letters** are chosen so each category has at least four known answers.
- **Scoring:** 100 per answer; +50 "deep cut" bonus for answers not marked common by editors.
- **Learning:** missed answers per category, favouring deep cuts.

### Word Scramble (Wordplay)
Eight words per round with difficulty that climbs with success. 30 s per word or untimed.
- **Hints:** reveal the next correct letter in place; each hint removes 25% of that word's points.
- **Scoring:** 100 + up to 100 speed bonus × (1 − 0.25 × hints) × difficulty factor.
- **Validation:** exact match, or any listed anagram that is also a real word.
- **Learning:** definition, example and an etymology note on reveal. No repeats within the last 60 words.

### Define It (Wordplay)
Write a definition in your own words, use the word in a sentence, then compare.
- **Evaluation is honest:** a keyword check shows which ideas from the reference definition and synonyms appear in your answer, and whether your sentence uses the word. It is labelled "Keyword overlap — not a judgement of meaning". The player then **self-assesses** (Nailed it / Partly / Missed it), which sets the score (100/50/0) and the review schedule.
- **Interface:** `DefinitionEvaluator` with `self` and `keyword` implementations; a future optional language-model evaluator plugs in without UI changes.
- Six themed collections, four difficulty levels, a "Revisit" bookmark.

### Flag Finder (World)
Identify 10 flags. Multiple choice (4 options) or type the name.
- 197 states (193 UN members + Vatican City, Palestine, Kosovo, Taiwan) with accurate SVG flags (flag-icons, MIT).
- **Difficulty:** Easy = well-known countries with distractors from other regions; Medium = all countries, distractors from the same region; Hard = deep cuts with look-alike flags as distractors.
- **Scoring:** 100 + speed bonus (up to 50, timed mode only); streak multiplier ×1.25 after 3, ×1.5 after 6.
- **Reveal:** country, capital, region, and a flag fact. Missed flags enter review.

### Capital Quest (World)
Name the capital of 10 countries. Type it or choose.
- Accepts diacritic-free spellings and listed variants ("Bogota", "Kiev" for Kyiv).
- **Multiple capitals** (South Africa, Bolivia, Malaysia…) accept any, and the reveal lists them all with their roles. Related cities earn **partial credit** with an explanation (Abidjan for Côte d'Ivoire). States with special status carry a neutral note.
- Tracks accuracy by region on the Progress page.

### Word Web (Connections)
Sixteen words, four hidden groups of four.
- 60 authored boards, each with four levels of trickiness, red herrings and explanations.
- **Modes:** Classic (four mistakes, then the board is revealed) or Relaxed (unlimited). "One away" feedback when three of four are right.
- **Scoring:** 100/150/200/250 by group level; −25 per mistake, floor 0; +100 for a perfect board.

## 6. Learning loop

Play → Respond → Discover (instant reveal) → Understand (one-line why + fact) → Reinforce (review queue).

The **review queue** is a light Leitner system per item (`flag:fr`, `capital:fr`, `vocab:laconic`, `scramble:quixotic`): a miss puts the item in box 0 (due now); each later correct answer moves it up a box (due after 1, 3, 7, 21 days); a miss resets it. Games mix due review items into rounds (up to 30%), and the home page review shelf links to them. We make no claims about measurable intelligence gains.

## 7. Scoring and progression

- Scores are per game and comparable only within a game and mode.
- Personal bests are kept per game × mode.
- **Days played** is shown as a count, never as a breakable streak.
- **Flourishes:** finishing rounds unlocks card finishes for the game's tile on the home page (a foil edge after 5 rounds, a stamp after 25). They never gate play.

## 8. Local-first architecture

- **Stack:** TypeScript + React 19, bundled with Bun into static files. No backend.
- **Storage:** IndexedDB database `curious-minds` (v1) via a small typed wrapper with an in-memory fallback when IndexedDB is unavailable (private mode, blocked storage). localStorage holds only the theme and sound preference so the first paint is right.
- **Export/import:** one JSON file (`curious-minds-YYYY-MM-DD.json`) with a schema version. Import validates the shape, then lets the player **merge** (keep the better record of each item, combine histories) or **replace**.
- **Offline:** a service worker precaches the app shell, content and flags on deployments that support it. Hosted inside a Claude artifact, service workers are unavailable, so the app explains that offline play needs the self-hosted version.
- **Privacy:** nothing leaves the browser. No analytics, no accounts, no microphone or camera. Fonts load from Google Fonts on first visit (disclosed in Settings).

## 9. Content model and validation

Types live in `src/content/types.ts`. Each bank is authored as typed data and checked by `tests/content.test.ts` (shape, duplicates, ranges, anagram collisions, board uniqueness, flag files present). Factual geography comes from the mledoze/countries dataset (ODbL) plus an editorial layer with sources for recent changes.

## 10. Design direction

**Concept: the night arcade.** A grape-dark room full of candy-coloured cabinets. Everything is a sticker: thick ink outlines, hard drop shadows, chunky type and buttons you want to press. It should feel like a game you play, not an app you use.

- **Colour:** room Grape `#1B1036`, surfaces `#261850` / `#33226A`, ink outlines `#0B0620`, Cream text `#FFF4E0`. Every game owns a candy colour: Word Rush bubblegum `#FF5FA8`, Alphabet Sprint sunshine `#FFC93C`, Word Scramble tangerine `#FF8A3D`, Define It lime `#A8E063`, Flag Finder sky `#45D4F5`, Capital Quest cobalt `#6E8BFF`, Word Web grape-pop `#B98CFF`. Right `#5BE38C`, wrong `#FF5B5B`.
- **Type:** Lilita One (display, scores, game names), Rubik (UI and body).
- **Signature:** the arcade machine on the home page. Seven round arcade buttons switch its screen between 20-second tasters of each game, built on the real game logic, so a first-time visitor understands the studio by playing it.
- **Arcade feel:** tokens for every finished round and an arcade rank (Rookie to Arcade Legend) that only goes up; floating score pops; confetti on wins and new bests; a high-score board; a "coming soon" workshop and ticker that show the arcade is growing.
- **Motion:** springy and quick (130–420 ms), one shake on wrong answers, confetti only on wins, all removed under reduced motion.
- **Sound:** synthesised Web Audio blips, off until the player turns it on.

## 11. MVP scope and acceptance criteria

In scope: the seven games, home, progress, review, settings, export/import, offline (self-hosted), tests. Out of scope: accounts, sync, multiplayer, daily leaderboards.

Done when a new player can open one link, start any game in under 30 seconds, get accurate feedback and a learning moment on every answer, finish and replay without limits, see progress persist across sessions, review misses, and move their data to another device by file.

/** Writes an answer key the browser playthrough uses to play every game correctly. Not shipped. */
import { writeFileSync } from 'node:fs';
import { CLUSTERS } from '../../src/content/associations';
import { neighbours } from '../../src/games/wordRush/graph';
import { indexes } from '../../src/games/alphabet/logic';
import { SCRAMBLE_WORDS } from '../../src/content/scramble';
import { WEB_BOARDS } from '../../src/content/webs';
import { COUNTRIES } from '../../src/content/countries.generated';
import { normalize } from '../../src/engine/normalize';

const words = new Set(CLUSTERS.flatMap((c) => c.words.map(normalize)));
const assoc: Record<string, string[]> = {};
for (const w of words) assoc[w] = neighbours(w, 12);
const alpha: Record<string, Record<string, string[]>> = {};
for (const c of indexes().values()) {
  alpha[c.cat.title] = {};
  for (const [l, arr] of c.byLetter) alpha[c.cat.title][l] = arr.map((a) => a.canonical);
}
const scramble: Record<string, string> = {};
for (const w of SCRAMBLE_WORDS) scramble[w.word.split('').sort().join('')] = w.word;
const webs = WEB_BOARDS.map((b) => b.groups.map((g) => g.words.map((x) => x.toLowerCase())));
const capitals: Record<string, string> = {};
for (const c of COUNTRIES) capitals[c.name] = c.capitals.find((x) => x.credit === 'full')!.name;
writeFileSync(process.argv[2] ?? '/tmp/cm-answers.json', JSON.stringify({ assoc, alpha, scramble, webs, capitals }));
console.log('answer key written');

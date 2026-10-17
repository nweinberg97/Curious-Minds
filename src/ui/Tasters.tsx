/**
 * Twenty-second tasters for the arcade machine on the home page.
 * Each one uses the real game logic, so what you try here is exactly how the full game judges answers.
 */
import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { judgeLink } from '../games/wordRush/graph';
import { indexes, judgeAnswer } from '../games/alphabet/logic';
import { SCRAMBLE_WORDS } from '../content/scramble';
import { VOCAB } from '../content/vocab';
import { COUNTRIES, distractors, flagUrl, fullCapitals } from '../games/geo/logic';
import { pick, shuffle } from '../engine/random';
import { normalize } from '../engine/normalize';
import { sfx } from '../engine/sound';
import { useFlash } from '../engine/hooks';
import { confettiFrom } from './confetti';

export interface TasterProps {
  onWin: () => void;
}

/** Lets a finished taster offer the next game, and the full game, without knowing about the machine. */
export const TasterNav = createContext<{ next: () => void; nextTitle: string; full: string; fullTitle: string } | null>(null);

/** Shared result footer inside the screen: the moment to play for real, try again, or taste the next game. */
function Win({ title, children, again }: { title: string; children?: React.ReactNode; again: () => void }) {
  const nav = useContext(TasterNav);
  return (
    <div className="win lift" role="status">
      <span className="big">{title}</span>
      {children}
      <div className="row">
        {nav && <a className="btn btn-primary btn-sm" href={nav.full}>Play {nav.fullTitle}</a>}
        <button className="btn btn-ghost btn-sm" onClick={again}>Again</button>
        {nav && (
          <button className="btn btn-tile btn-sm" onClick={nav.next}>
            Next: {nav.nextTitle}
          </button>
        )}
      </div>
    </div>
  );
}

/** `win` celebrates a correct finish; `done` just records that the game was tasted. */
function useWin(onWin: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  return {
    ref,
    win: () => {
      sfx.complete();
      confettiFrom(ref.current, 70);
      onWin();
    },
    done: onWin,
  };
}

/* ---------------- Word Rush ---------------- */
export function RushTaster({ onWin }: TasterProps) {
  const [seed, setSeed] = useState(0);
  const start = useMemo(() => pick(['ocean', 'castle', 'coffee', 'winter', 'volcano', 'garden', 'music', 'pirate']), [seed]);
  const [chain, setChain] = useState<{ w: string; why: string }[]>([]);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');
  const [flash, trigger] = useFlash<'bad'>();
  const { ref, win } = useWin(onWin);
  const current = chain.length ? chain[chain.length - 1].w : start;
  const done = chain.length >= 3;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || done) return;
    const v = judgeLink(current, input, new Set([start, ...chain.map((c) => c.w)]));
    if (v.ok) {
      const next = [...chain, { w: v.word, why: v.reason }];
      setChain(next);
      setInput('');
      setMsg(v.reason);
      sfx.combo(next.length);
      if (next.length >= 3) setTimeout(win, 150);
    } else {
      setMsg(v.why === 'unknown' || v.why === 'unlinked' ? `${v.message} In the full game you can vouch for it.` : v.message);
      trigger('bad');
      sfx.wrong();
    }
  };

  return (
    <div ref={ref} className="screen-body">
      <span className="label">Word Rush · chain 3 words</span>
      <div className="taster-chain" aria-label="Your chain">
        {[start, ...chain.map((c) => c.w)].map((w, i) => (
          <span key={w} className="taster-chain">
            {i > 0 && <b aria-hidden="true" style={{ color: 'var(--accent)' }}>→</b>}
            <span className={`tile ${i === 0 ? '' : 't-accent'} lift`}>{w}</span>
          </span>
        ))}
      </div>
      {!done ? (
        <>
          <h2>What comes to mind after “{current}”?</h2>
          <form onSubmit={submit} className={flash ? 'shake' : ''}>
            <label className="sr-only" htmlFor="t-rush">Your word</label>
            <div className="answer-row">
              <input id="t-rush" className="answer" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a word" autoComplete="off" autoCapitalize="off" spellCheck={false} />
              <button className="btn btn-primary" type="submit" disabled={!input.trim()}>Link</button>
            </div>
          </form>
          <p className="hint" aria-live="polite">{msg || 'Any strong link counts: sea, beach, salt, wave…'}</p>
        </>
      ) : (
        <Win title="Chain of 3!" again={() => { setChain([]); setMsg(''); setSeed((s) => s + 1); }}>
          <p className="hint">{msg}. The full game gives you 60 seconds and multiplies long chains.</p>
        </Win>
      )}
    </div>
  );
}

/* ---------------- Alphabet Sprint ---------------- */
export function SprintTaster({ onWin }: TasterProps) {
  const [seed, setSeed] = useState(0);
  const letter = useMemo(() => pick(['b', 's', 'c', 'p', 'm', 't', 'g']), [seed]);
  const animals = indexes().get('animals')!;
  const [found, setFound] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');
  const [flash, trigger] = useFlash<'bad'>();
  const { ref, win } = useWin(onWin);
  const done = found.length >= 3;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || done) return;
    const v = judgeAnswer(input, letter, [animals], new Set(found.map((f) => `animals:${f}`)));
    if (v.ok) {
      const next = [...found, v.answer.canonical];
      setFound(next);
      setInput('');
      setMsg(v.answer.common ? 'Nice!' : 'Deep cut! +50 bonus in the full game.');
      sfx.correct();
      if (next.length >= 3) setTimeout(win, 150);
    } else {
      setMsg(v.message);
      trigger('bad');
      sfx.wrong();
    }
  };

  return (
    <div ref={ref} className="screen-body">
      <span className="label">Alphabet Sprint · name 3</span>
      <div className="taster-row">
        <span className="tile t-accent" style={{ fontSize: '2.6rem', transform: 'rotate(-5deg)' }}>{letter.toUpperCase()}</span>
        <h2>Three animals beginning with {letter.toUpperCase()}</h2>
      </div>
      {!done ? (
        <>
          <form onSubmit={submit} className={flash ? 'shake' : ''}>
            <label className="sr-only" htmlFor="t-sprint">An animal</label>
            <div className="answer-row">
              <input id="t-sprint" className="answer" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`An animal starting with ${letter.toUpperCase()}`} autoComplete="off" autoCapitalize="off" spellCheck={false} />
              <button className="btn btn-primary" type="submit" disabled={!input.trim()}>Add</button>
            </div>
          </form>
          <div className="pills">{found.map((f) => <span key={f} className="pill hit lift">{f}</span>)}</div>
          <p className="hint" aria-live="polite">{msg || 'Spelling slips on long words are forgiven.'}</p>
        </>
      ) : (
        <Win title="Three for three!" again={() => { setFound([]); setMsg(''); setSeed((s) => s + 1); }}>
          <div className="pills">{found.map((f) => <span key={f} className="pill hit">{f}</span>)}</div>
          <p className="hint">The full game mixes three categories and a ticking clock.</p>
        </Win>
      )}
    </div>
  );
}

/* ---------------- Word Scramble ---------------- */
export function ScrambleTaster({ onWin }: TasterProps) {
  const [seed, setSeed] = useState(0);
  const word = useMemo(() => pick(SCRAMBLE_WORDS.filter((w) => w.difficulty <= 2 && w.word.length <= 6)), [seed]);
  const letters = useMemo(() => {
    let s = shuffle(word.word.split('')).join('');
    for (let i = 0; i < 10 && s === word.word; i++) s = shuffle(word.word.split('')).join('');
    return s.split('');
  }, [word]);
  const [picked, setPicked] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [flash, trigger] = useFlash<'bad'>();
  const { ref, win } = useWin(onWin);
  const guess = picked.map((i) => letters[i]).join('');

  const tap = (i: number) => {
    if (solved || picked.includes(i)) return;
    sfx.tap();
    const next = [...picked, i];
    setPicked(next);
    const g = next.map((k) => letters[k]).join('');
    if (g.length === word.word.length) {
      if (g === word.word || word.alsoAccept?.includes(g)) {
        setSolved(true);
        setTimeout(win, 120);
      } else {
        trigger('bad');
        sfx.wrong();
        setTimeout(() => setPicked([]), 380);
      }
    }
  };

  return (
    <div ref={ref} className="screen-body">
      <span className="label">Word Scramble · tap the letters in order</span>
      <h2>{solved ? word.word : 'Unscramble the word'}</h2>
      <div className={`taster-tiles ${flash ? 'shake' : ''}`} role="group" aria-label="Letters">
        {letters.map((c, i) => (
          <button key={i} className="tile" disabled={picked.includes(i) || solved} onClick={() => tap(i)} aria-label={`Letter ${c}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="taster-tiles" aria-live="polite" aria-label={`Your word: ${guess}`}>
        {word.word.split('').map((_, i) => (
          <span key={i} className={`tile ${guess[i] ? 't-accent' : 't-ghost'}`}>{guess[i] ?? '·'}</span>
        ))}
      </div>
      {solved ? (
        <Win title="Unscrambled!" again={() => { setPicked([]); setSolved(false); setSeed((s) => s + 1); }}>
          <p className="hint"><b>{word.word}</b>: {word.definition}</p>
        </Win>
      ) : (
        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => setPicked((p) => p.slice(0, -1))} disabled={!picked.length}>Undo</button>
          <span className="hint">Or type it in the full game, with hints if you get stuck.</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Define It ---------------- */
export function DefineTaster({ onWin }: TasterProps) {
  const [seed, setSeed] = useState(0);
  const { word, options } = useMemo(() => {
    const pool = VOCAB.filter((v) => v.difficulty <= 2);
    const w = pick(pool);
    const others = shuffle(pool.filter((v) => v.id !== w.id && v.partOfSpeech === w.partOfSpeech)).slice(0, 2);
    return { word: w, options: shuffle([w, ...others]) };
  }, [seed]);
  const [chosen, setChosen] = useState<string | null>(null);
  const { ref, win, done } = useWin(onWin);

  const choose = (id: string) => {
    if (chosen) return;
    setChosen(id);
    if (id === word.id) {
      sfx.correct();
      setTimeout(win, 120);
    } else {
      sfx.wrong();
      done();
    }
  };

  return (
    <div ref={ref} className="screen-body">
      <span className="label">Define It · what does it mean?</span>
      <h2>{word.word} <span className="pill" style={{ fontFamily: 'var(--sans)', fontSize: '0.8rem', verticalAlign: 'middle' }}>{word.partOfSpeech}</span></h2>
      <div className="choice-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        {options.map((o) => (
          <button key={o.id} className={`choice ${chosen ? (o.id === word.id ? 'right' : o.id === chosen ? 'wrong' : '') : ''}`} disabled={!!chosen} onClick={() => choose(o.id)}>
            {o.definition}
          </button>
        ))}
      </div>
      {chosen && (
        <Win title={chosen === word.id ? 'Spot on!' : 'Now you know'} again={() => { setChosen(null); setSeed((s) => s + 1); }}>
          <p className="hint">“{word.example}” In the full game you explain words in your own words.</p>
        </Win>
      )}
    </div>
  );
}

/* ---------------- Flag Finder & Capital Quest ---------------- */
export function GeoTaster({ onWin, kind }: TasterProps & { kind: 'flag' | 'capital' }) {
  const [seed, setSeed] = useState(0);
  const { c, options } = useMemo(() => {
    const country = pick(COUNTRIES.filter((x) => x.tier === 1));
    return { c: country, options: shuffle([country, ...distractors(country, 2, kind).slice(0, 2)]) };
  }, [seed, kind]);
  const [chosen, setChosen] = useState<string | null>(null);
  const { ref, win, done } = useWin(onWin);
  const label = (o: typeof c) => (kind === 'flag' ? o.name : fullCapitals(o)[0].name);

  const choose = (code: string) => {
    if (chosen) return;
    setChosen(code);
    if (code === c.code) {
      sfx.correct();
      setTimeout(win, 120);
    } else {
      sfx.wrong();
      done();
    }
  };

  return (
    <div ref={ref} className="screen-body">
      <span className="label">{kind === 'flag' ? 'Flag Finder · whose flag?' : 'Capital Quest · name the capital'}</span>
      <div className="taster-row">
        <img className="mini-flag" src={flagUrl(c.code)} alt={kind === 'flag' ? 'Flag to identify' : `Flag of ${c.name}`} width={150} height={112} />
        {kind === 'capital' && <h2>Capital of {c.name}?</h2>}
        {kind === 'flag' && <h2>Which country flies this flag?</h2>}
      </div>
      <div className="choice-grid three">
        {options.map((o) => (
          <button key={o.code} className={`choice ${chosen ? (o.code === c.code ? 'right' : o.code === chosen ? 'wrong' : '') : ''}`} disabled={!!chosen} onClick={() => choose(o.code)}>
            {label(o)}
          </button>
        ))}
      </div>
      {chosen && (
        <Win title={chosen === c.code ? 'Correct!' : `It's ${label(c)}`} again={() => { setChosen(null); setSeed((s) => s + 1); }}>
          <p className="hint">{kind === 'flag' ? c.flagFact : c.capitalNote ?? `${fullCapitals(c)[0].name} is in ${c.subregion}.`}</p>
        </Win>
      )}
    </div>
  );
}

/* ---------------- Word Web ---------------- */
const MINI_WEBS: { a: { title: string; words: string[] }; b: { title: string; words: string[] } }[] = [
  { a: { title: 'Planets', words: ['Mars', 'Venus', 'Saturn', 'Mercury'] }, b: { title: 'Snakes', words: ['Python', 'Cobra', 'Adder', 'Viper'] } },
  { a: { title: 'Things with keys', words: ['Piano', 'Map', 'Lock', 'Keyboard'] }, b: { title: 'Things with shells', words: ['Egg', 'Snail', 'Turtle', 'Walnut'] } },
  { a: { title: 'Shades of blue', words: ['Navy', 'Teal', 'Azure', 'Cobalt'] }, b: { title: 'Fish', words: ['Trout', 'Salmon', 'Tuna', 'Cod'] } },
  { a: { title: 'Card games', words: ['Snap', 'Poker', 'Rummy', 'Bridge'] }, b: { title: 'Dances', words: ['Tango', 'Salsa', 'Waltz', 'Polka'] } },
];

export function WebTaster({ onWin }: TasterProps) {
  const [seed, setSeed] = useState(0);
  const board = useMemo(() => pick(MINI_WEBS), [seed]);
  const words = useMemo(() => shuffle([...board.a.words, ...board.b.words]), [board]);
  const [sel, setSel] = useState<string[]>([]);
  const [solved, setSolved] = useState<{ title: string; words: string[] } | null>(null);
  const [flash, trigger] = useFlash<'bad'>();
  const [msg, setMsg] = useState('');
  const { ref, win } = useWin(onWin);

  const toggle = (w: string) => {
    if (solved) return;
    sfx.tap();
    const next = sel.includes(w) ? sel.filter((x) => x !== w) : sel.length < 4 ? [...sel, w] : sel;
    setSel(next);
    if (next.length === 4) {
      const set = new Set(next.map(normalize));
      const hit = [board.a, board.b].find((g) => g.words.every((x) => set.has(normalize(x))));
      if (hit) {
        setSolved(hit);
        setTimeout(win, 150);
      } else {
        const close = [board.a, board.b].some((g) => g.words.filter((x) => set.has(normalize(x))).length === 3);
        setMsg(close ? 'One away!' : 'Not a group. Try again.');
        trigger('bad');
        sfx.wrong();
        setTimeout(() => setSel([]), 450);
      }
    }
  };

  return (
    <div ref={ref} className="screen-body">
      <span className="label">Word Web · find 4 that belong together</span>
      {!solved && <h2>Two groups hide here. Find one.</h2>}
      {solved && <div className="solved-group lvl-1 lift"><b>{solved.title}</b><span>{solved.words.join(', ')}</span></div>}
      <div className={`web-grid ${flash ? 'shake' : ''}`} role="group" aria-label="Words">
        {words.map((w) => (
          <button key={w} className="web-cell" style={{ minHeight: 54 }} aria-pressed={sel.includes(w) || !!solved?.words.includes(w)} disabled={!!solved} onClick={() => toggle(w)}>
            {w}
          </button>
        ))}
      </div>
      {solved ? (
        <Win title="Linked!" again={() => { setSel([]); setSolved(null); setMsg(''); setSeed((s) => s + 1); }}>
          <p className="hint">The other four were {(solved === board.a ? board.b : board.a).title.toLowerCase()}. Full boards hide four groups and sneaky red herrings.</p>
        </Win>
      ) : (
        <p className="hint" aria-live="polite">{msg || 'Tap four words.'}</p>
      )}
    </div>
  );
}

export function Taster({ id, onWin }: { id: string; onWin: () => void }) {
  switch (id) {
    case 'word-rush': return <RushTaster onWin={onWin} />;
    case 'alphabet-sprint': return <SprintTaster onWin={onWin} />;
    case 'word-scramble': return <ScrambleTaster onWin={onWin} />;
    case 'define-it': return <DefineTaster onWin={onWin} />;
    case 'flag-finder': return <GeoTaster kind="flag" onWin={onWin} />;
    case 'capital-quest': return <GeoTaster kind="capital" onWin={onWin} />;
    case 'word-web': return <WebTaster onWin={onWin} />;
    default: return null;
  }
}

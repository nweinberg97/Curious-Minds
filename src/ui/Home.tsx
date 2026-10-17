import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, COMING_SOON, GAMES, GAME_BY_ID } from '../games/registry';
import type { GameDef } from '../engine/types';
import { GameArt, GameIcon } from './art';
import { Icon, fmt, useStore } from './components';
import { Taster, TasterNav } from './Tasters';
import { sfx } from '../engine/sound';
import { totalTokens, rankFor } from '../engine/levels';
import { dayKey, hashString, mulberry32, pick } from '../engine/random';

type Filter = 'all' | 'words' | 'world' | 'connections' | 'quick' | 'calm';

const FILTERS: { id: Filter; label: string; test: (g: GameDef) => boolean }[] = [
  { id: 'all', label: 'All games', test: () => true },
  { id: 'words', label: 'Wordplay', test: (g) => g.category === 'words' },
  { id: 'world', label: 'World', test: (g) => g.category === 'world' },
  { id: 'connections', label: 'Connections', test: (g) => g.category === 'connections' },
  { id: 'quick', label: 'Under a minute', test: (g) => g.minutes <= 1 },
  { id: 'calm', label: 'Take your time', test: (g) => g.minutes >= 3 },
];

function todaysPick() {
  return pick(GAMES, mulberry32(hashString(`spotlight:${dayKey()}`)));
}

/**
 * Remembered while the app is open, so leaving a game drops you back exactly where you were:
 * same machine, same games tasted, same scroll position.
 */
const memory = { machine: '', tasted: new Set<string>(), scrollY: 0, returning: false };
export function markReturningHome() {
  memory.returning = true;
}

export function Home() {
  const store = useStore();
  const [machine, setMachine] = useState(() => memory.machine || 'word-rush');
  const [plays, setPlays] = useState(0);
  const [tasted, setTasted] = useState<Set<string>>(() => new Set(memory.tasted));
  const [filter, setFilter] = useState<Filter>('all');
  const cabinetRef = useRef<HTMLDivElement>(null);
  const game = GAME_BY_ID.get(machine)!;
  const idx = GAMES.findIndex((g) => g.id === machine);
  const nextGame = GAMES[(idx + 1) % GAMES.length];
  const prevGame = GAMES[(idx - 1 + GAMES.length) % GAMES.length];

  useEffect(() => {
    memory.machine = machine;
  }, [machine]);
  useEffect(() => {
    if (memory.returning) {
      memory.returning = false;
      const y = memory.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
    // Track the scroll position while the arcade is on screen. (Reading it on unmount is too late:
    // by then the game screen has replaced the page and the browser has already clamped the scroll.)
    const onScroll = () => {
      memory.scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const due = store.due();
  const dueByGame = new Map<string, number>();
  for (const d of due) dueByGame.set(d.gameId, (dueByGame.get(d.gameId) ?? 0) + 1);
  const tokens = totalTokens(store.sessions);
  const rank = rankFor(tokens);
  const spot = todaysPick();
  const shown = GAMES.filter(FILTERS.find((f) => f.id === filter)!.test);

  const choose = (id: string, scroll = false) => {
    setMachine(id);
    setPlays((p) => p + 1);
    if (scroll) {
      const el = cabinetRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: 'smooth' });
        requestAnimationFrame(() => el.querySelector<HTMLElement>('.screen input, .screen button')?.focus({ preventScroll: true }));
      }
    }
  };

  const onWin = () => {
    setTasted((t) => {
      const n = new Set(t);
      n.add(machine);
      memory.tasted = n;
      return n;
    });
  };

  // Surprise me: spin through the machine's buttons and land on a random game to try. It never leaves the page.
  const [spinning, setSpinning] = useState<string | null>(null);
  const spinTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(spinTimer.current), []);
  const surprise = () => {
    if (spinning) return;
    const others = GAMES.filter((g) => g.id !== machine);
    const target = others[Math.floor(Math.random() * others.length)].id;
    const reduced = document.documentElement.dataset.motion === 'reduced' ||
      (document.documentElement.dataset.motion !== 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduced) return choose(target);
    let step = 0;
    const steps = 11 + Math.floor(Math.random() * 4);
    spinTimer.current = setInterval(() => {
      step++;
      if (step >= steps) {
        clearInterval(spinTimer.current);
        setSpinning(null);
        choose(target);
        sfx.correct();
        return;
      }
      setSpinning(GAMES[step % GAMES.length].id);
      sfx.tick();
    }, 70 + step * 6);
  };

  const ticker = [
    `Today's pick: ${spot.title}`,
    'Try all 7 games right here',
    ...COMING_SOON.map((c) => `Next in the workshop: ${c.title}`),
    'Free forever, no sign-up',
  ];

  return (
    <main className="home-page" id="main">
      <div className="wrap">
        <section className="hero" aria-label="Try the games">
          <div className="hero-copy">
            <h1>
              <span className="w w1">An arcade</span>{' '}
              <span className="w w2">for your</span>{' '}
              <span className="w w3">brain.</span>
            </h1>
            <p className="hero-lede">
              Quick word, world and puzzle games that leave you <b>a little smarter</b> every round. Free, no sign-up.
            </p>
          </div>

          <div className="cabinet" ref={cabinetRef} style={{ ['--game' as string]: game.color }}>
            <div className="cabinet-top">
              <button className="cab-nav" onClick={() => choose(prevGame.id)} aria-label={`Previous game: ${prevGame.title}`}>
                <Icon name="back" size={18} />
              </button>
              <span className="now">
                <small>Now trying</small>
                {game.title}
              </span>
              <button className="cab-nav" onClick={() => choose(nextGame.id)} aria-label={`Next game: ${nextGame.title}`}>
                <span style={{ display: 'inline-flex', transform: 'scaleX(-1)' }}><Icon name="back" size={18} /></span>
              </button>
            </div>
            <div className="screen" aria-live="polite">
              <TasterNav.Provider value={{ next: () => choose(nextGame.id), nextTitle: nextGame.title, full: `#play.${game.id}`, fullTitle: game.title }}>
                <Taster key={`${machine}-${plays}`} id={machine} onWin={onWin} />
              </TasterNav.Provider>
            </div>

            <div className="panel-label">
              <span className="step-pill">Pick a game to try</span>
              <span className="muted">
                Press a button for a quick demo. {tasted.size > 0 && `${tasted.size} of ${GAMES.length} tried.`}
              </span>
            </div>
            <div className="controls" role="group" aria-label="Pick a game to try">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  className={`abtn-wrap ${spinning === g.id ? 'spin' : ''}`}
                  aria-pressed={!spinning && g.id === machine}
                  aria-label={`Try ${g.title}${tasted.has(g.id) ? ' (tried)' : ''}`}
                  onClick={() => choose(g.id)}
                  style={{ ['--c' as string]: g.color }}
                >
                  <span className="abtn">
                    <GameIcon id={g.id} />
                    {tasted.has(g.id) && <span className="tick" aria-hidden="true">✓</span>}
                  </span>
                  <span className="abtn-name" aria-hidden="true">{g.title}</span>
                </button>
              ))}
            </div>
            <div className="cabinet-foot">
              <button className="btn btn-ghost btn-sm" onClick={surprise} disabled={!!spinning}>
                <Icon name="shuffle" size={16} /> {spinning ? 'Picking…' : 'Surprise me'}
              </button>
              <span className="spacer" />
              <a className="btn btn-primary" href={`#play.${game.id}`}>Play full {game.title}</a>
            </div>
          </div>
        </section>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((k) => (
            <span key={k}>
              {ticker.map((t) => (
                <span key={t}>{t}<i>★</i></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="wrap home-body">
        {due.length > 0 && (
          <section className="review-strip" aria-label="Review">
            <h2>{due.length} {due.length === 1 ? 'thing' : 'things'} to revisit</h2>
            {[...dueByGame].map(([id, n]) => {
              const g = GAME_BY_ID.get(id);
              if (!g) return null;
              return (
                <a key={id} className="chip" style={{ ['--accent' as string]: g.color }} href={`#review.${id}`}>
                  {g.title} <b>{n}</b>
                </a>
              );
            })}
          </section>
        )}

        <section className="band" aria-labelledby="pick-title" style={{ display: 'grid', gap: 'var(--s5)' }}>
          <div className="shead">
            <div>
              <h2 id="pick-title">Pick a game</h2>
              <p>Taste any game on the machine, or jump straight in. Every game is free, unlimited and has a no-clock mode.</p>
            </div>
            <div className="filters" role="group" aria-label="Filter games">
              {FILTERS.map((f) => (
                <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.label}<span className="n">{GAMES.filter(f.test).length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="gcards">
            {shown.map((g) => {
              const p = store.plays(g.id);
              const best = store.best(g.id);
              const cat = CATEGORIES.find((c) => c.id === g.category)!;
              return (
                <article key={g.id} className={`gcard ${p >= 5 ? 'finish-foil' : ''}`} style={{ ['--game' as string]: g.color }}>
                  <a className="art" href={`#${g.id}`} tabIndex={-1} aria-hidden="true"><GameArt id={g.id} /></a>
                  {p >= 25 && <span className="stamp" aria-hidden="true">25<br />rounds</span>}
                  {tasted.has(g.id) && <span className="tasted-tag" aria-hidden="true">Tasted ✓</span>}
                  <div className="gcard-body">
                    <h3><a href={`#${g.id}`}>{g.title}</a></h3>
                    <p>{g.tagline}</p>
                    <div className="gcard-meta">
                      <span className="badge">{cat.title}</span>
                      <span className="badge">{g.length}</span>
                      {best ? <span className="badge dark">Best {fmt(best)}</span> : null}
                      {dueByGame.get(g.id) ? <span className="badge dark">{dueByGame.get(g.id)} to review</span> : null}
                    </div>
                    <div className="gcard-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => choose(g.id, true)} aria-label={`Taste ${g.title} on the machine`}>
                        Taste
                      </button>
                      <a className="btn btn-sm btn-tile" href={`#play.${g.id}`} aria-label={`Play ${g.title}`}>
                        Play
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
            {filter === 'all' && (
              <a className="gcard more" href="#soon-title" onClick={(e) => { e.preventDefault(); document.getElementById('soon-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span className="stack" aria-hidden="true">
                  {COMING_SOON.map((c) => <span key={c.title} style={{ ['--c' as string]: c.color }} />)}
                </span>
                <h3>More games on the way</h3>
                <p>Peek at what's being built next.</p>
              </a>
            )}
          </div>
        </section>

        <section className="band" aria-labelledby="hall-title" style={{ display: 'grid', gap: 'var(--s5)' }}>
          <div className="shead">
            <div>
              <h2 id="hall-title">Your high scores</h2>
              <p>Every round earns tokens. Tokens raise your arcade rank. They never run out and never cost anything.</p>
            </div>
          </div>
          <div className="hall">
            <div className="board">
              <h3><span>High scores</span><span className="tnum">{fmt(store.sessions.length)} rounds</span></h3>
              <ol>
                {[...GAMES].sort((a, b) => (store.best(b.id) ?? -1) - (store.best(a.id) ?? -1)).map((g) => {
                  const best = store.best(g.id);
                  return (
                    <li key={g.id} className={best ? '' : 'none'}>
                      <span className="sw" style={{ ['--c' as string]: g.color }} aria-hidden="true" />
                      <a href={`#${g.id}`} style={{ textDecoration: 'none' }}>{g.title}</a>
                      <span className="sc tnum">{best ? fmt(best) : 'Not played yet'}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="levelcard">
              <span className="muted small" style={{ fontWeight: 700 }}>Your arcade rank</span>
              <span className="rank">Lv {rank.level} · {rank.name}</span>
              {rank.span !== null ? (
                <>
                  <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={rank.span} aria-valuenow={rank.into} aria-label={`Progress to ${rank.next}`}>
                    <i style={{ width: `${Math.max(4, (rank.into / rank.span) * 100)}%` }} />
                  </div>
                  <span className="muted small">{rank.span - rank.into} tokens to {rank.next}</span>
                </>
              ) : (
                <span className="muted small">Top rank. Legendary.</span>
              )}
              <div className="row3">
                <div><b className="tnum">{fmt(tokens)}</b><span>tokens</span></div>
                <div><b className="tnum">{fmt(store.profile.days.length)}</b><span>days played</span></div>
                <div><b className="tnum">{fmt(store.items.size)}</b><span>things studied</span></div>
              </div>
              <a className="btn btn-ghost btn-sm" href="#progress">See your progress</a>
            </div>
          </div>
        </section>

        <section className="band" aria-labelledby="soon-title" style={{ display: 'grid', gap: 'var(--s5)' }}>
          <div className="shead">
            <div>
              <h2 id="soon-title">Next in the workshop</h2>
              <p>The next three games we're building. The arcade keeps growing.</p>
            </div>
          </div>
          <div className="workshop">
            {COMING_SOON.map((c) => (
              <article key={c.title} className="soon" style={{ ['--game' as string]: c.color }}>
                <span className="tape">In the works</span>
                <span className="g" aria-hidden="true">{c.glyph}</span>
                <span className="fam">{c.family}</span>
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="footer">
          <p>
            Curious Minds is free and private. Your scores stay in this browser, with no account and no tracking.{' '}
            <a href="#settings">Your data and settings</a>
          </p>
        </footer>
      </div>
    </main>
  );
}

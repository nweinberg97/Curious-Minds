import { useState } from 'react';
import { CATEGORIES, COMING_SOON, GAMES, GAME_BY_ID } from '../games/registry';
import type { GameDef } from '../engine/types';
import { GameArt, GameIcon } from './art';
import { Icon, fmt, go, useStore } from './components';
import { Taster } from './Tasters';
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

export function Home() {
  const store = useStore();
  const [machine, setMachine] = useState(() => store.profile.recentGames.length ? todaysPick().id : 'word-rush');
  const [plays, setPlays] = useState(0);
  const [won, setWon] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const game = GAME_BY_ID.get(machine)!;

  const due = store.due();
  const dueByGame = new Map<string, number>();
  for (const d of due) dueByGame.set(d.gameId, (dueByGame.get(d.gameId) ?? 0) + 1);
  const tokens = totalTokens(store.sessions);
  const rank = rankFor(tokens);
  const spot = todaysPick();
  const shown = GAMES.filter(FILTERS.find((f) => f.id === filter)!.test);

  const choose = (id: string) => {
    setMachine(id);
    setWon(false);
    setPlays((p) => p + 1);
  };

  const surprise = () => {
    const pool = GAMES.filter((g) => g.id !== store.profile.recentGames[0]?.gameId);
    go(`play.${pool[Math.floor(Math.random() * pool.length)].id}`);
  };

  const ticker = [
    `Today's pick: ${spot.title}`,
    ...COMING_SOON.map((c) => `Coming soon: ${c.title}`),
    '7 games, free forever',
    'No sign-up, no ads',
  ];

  return (
    <main className="home-page" id="main">
      <div className="wrap">
        <section className="hero" aria-label="Try the arcade">
          <div className="hero-copy">
            <span className="hero-eyebrow"><span className="coin" aria-hidden="true">c</span><b>7 games</b> and more on the way</span>
            <h1>
              <span className="w w1">An arcade</span>{' '}
              <span className="w w2">for your</span>{' '}
              <span className="w w3">brain.</span>
            </h1>
            <p className="hero-lede">
              Quick word, world and puzzle games that leave you <b>a little smarter</b> every round. Press a button on the machine and try one right now.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href={`#play.${game.id}`} style={{ ['--accent' as string]: game.color }}>
                Play {game.title}
              </a>
              <button className="btn btn-ghost" onClick={surprise}>
                <Icon name="shuffle" size={18} /> Surprise me
              </button>
            </div>
            <ul className="hero-facts">
              <li style={{ ['--c' as string]: 'var(--lime)' }}>Free, no limits</li>
              <li style={{ ['--c' as string]: 'var(--sky)' }}>No account</li>
              <li style={{ ['--c' as string]: 'var(--pink)' }}>Learn something every round</li>
            </ul>
          </div>

          <div className="cabinet" style={{ ['--game' as string]: game.color }}>
            <div className="cabinet-top">
              <span className="now">{game.title}</span>
              <span className="bulbs" aria-hidden="true"><i /><i /><i /></span>
            </div>
            <div className="screen" aria-live="polite">
              <Taster key={`${machine}-${plays}`} id={machine} onWin={() => setWon(true)} />
            </div>
            <div className="controls" role="group" aria-label="Choose a game to try">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  className="abtn"
                  style={{ ['--c' as string]: g.color }}
                  aria-pressed={g.id === machine}
                  aria-label={`Try ${g.title}`}
                  onClick={() => choose(g.id)}
                >
                  <GameIcon id={g.id} />
                  <span className="tip" aria-hidden="true">{g.title}</span>
                </button>
              ))}
            </div>
            <div className="cabinet-foot">
              <span className="muted">{won ? 'Liked that? The full round is longer and teaches you more.' : game.tagline}</span>
              <a className="btn btn-primary btn-sm" href={`#play.${game.id}`}>Full game</a>
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
              <p>Every game is free with no limits, and has a no-clock mode.</p>
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
                <a
                  key={g.id}
                  className={`gcard ${p >= 5 ? 'finish-foil' : ''}`}
                  style={{ ['--game' as string]: g.color }}
                  href={`#${g.id}`}
                  aria-label={`${g.title}. ${g.tagline} About ${g.length}.${best ? ` Your best ${fmt(best)}.` : ''}`}
                >
                  <div className="art"><GameArt id={g.id} /></div>
                  <span className="play-tag" aria-hidden="true">Play</span>
                  {p >= 25 && <span className="stamp" aria-hidden="true">25<br />rounds</span>}
                  <div className="gcard-body">
                    <h3>{g.title}</h3>
                    <p>{g.tagline}</p>
                    <div className="gcard-meta">
                      <span className="badge">{cat.title}</span>
                      <span className="badge">{g.length}</span>
                      {best ? <span className="badge dark">Best {fmt(best)}</span> : <span className="badge">New</span>}
                      {dueByGame.get(g.id) ? <span className="badge dark">{dueByGame.get(g.id)} to review</span> : null}
                    </div>
                  </div>
                </a>
              );
            })}
            {filter === 'all' && (
              <a className="gcard more" href="#soon-title" onClick={(e) => { e.preventDefault(); document.getElementById('soon-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span className="stack" aria-hidden="true">
                  {COMING_SOON.slice(0, 4).map((c) => <span key={c.title} style={{ ['--c' as string]: c.color }} />)}
                </span>
                <h3>{COMING_SOON.length} more games coming</h3>
                <p>Math, memory, logic, riddles and more. Peek in the workshop.</p>
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
              <h2 id="soon-title">In the workshop</h2>
              <p>New games we're building next. The arcade keeps growing.</p>
            </div>
          </div>
          <div className="workshop">
            {COMING_SOON.map((c) => (
              <article key={c.title} className="soon" style={{ ['--game' as string]: c.color }}>
                <span className="tape">Coming soon</span>
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

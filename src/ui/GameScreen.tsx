import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameDef, RoundConfig, RoundResult } from '../engine/types';
import type { RoundOutcome } from '../storage/store';
import { GameArt } from './art';
import { CountUp, Icon, Seg, fmt, go, useStore } from './components';
import { GAMES } from '../games/registry';
import { GameIcon } from './art';
import { sfx } from '../engine/sound';
import { rankFor, tokensForRound, totalTokens } from '../engine/levels';
import { confetti } from './confetti';

type Phase = 'intro' | 'play' | 'summary';
type Outcome = RoundOutcome & { tokens: number; levelUp: string | null };

export function GameScreen({ game, autostart, reviewFocus }: { game: GameDef; autostart: boolean; reviewFocus: boolean }) {
  const store = useStore();
  const pref = store.settings.gamePrefs[game.id] ?? {};
  const defaultMode = useMemo(() => {
    if (pref.mode && game.modes.some((m) => m.id === pref.mode)) return pref.mode;
    if (store.settings.relaxedByDefault) return game.modes.find((m) => m.relaxed)?.id ?? game.modes[0].id;
    return game.modes[0].id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  const [mode, setMode] = useState(defaultMode);
  const [difficulty, setDifficulty] = useState(pref.difficulty ?? (game.difficulties ? Math.min(2, game.difficulties.length) : 1));
  const [option, setOption] = useState(pref.option ?? game.options?.choices[0].id);
  const [phase, setPhase] = useState<Phase>(autostart || reviewFocus ? 'play' : 'intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pop, setPop] = useState(0);
  const [delta, setDelta] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ r: RoundResult; o: Outcome } | null>(null);
  const [focusReview, setFocusReview] = useState(reviewFocus);
  const startedAt = useRef(Date.now());

  const config: RoundConfig = useMemo(
    () => ({ mode, difficulty, option, review: store.due(game.id), reviewFocus: focusReview }),
    // Freeze per round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, mode, difficulty, option],
  );

  // Pause when the tab is hidden or the window loses focus during play.
  useEffect(() => {
    if (phase !== 'play') return;
    const onVis = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onVis);
    };
  }, [phase]);

  useEffect(() => {
    if (!paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setPaused(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paused]);

  useEffect(() => {
    if (phase === 'play') return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === 'Escape' && !(t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) go('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'play' || paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPaused(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, paused]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  const start = () => {
    store.setGamePref(game.id, { mode, difficulty, option });
    setScore(0);
    scoreRef.current = 0;
    setPop(0);
    setResult(null);
    setPaused(false);
    startedAt.current = Date.now();
    setRound((r) => r + 1);
    setPhase('play');
    sfx.tap();
  };

  const scoreRef = useRef(0);
  const onScore = (s: number) => {
    setDelta(s - scoreRef.current);
    scoreRef.current = s;
    setScore(s);
    setPop((p) => p + 1);
  };

  const onFinish = (r: RoundResult) => {
    const tokensBefore = totalTokens(store.sessions);
    const o = store.recordRound({
      gameId: game.id,
      mode,
      difficulty: game.difficulties ? difficulty : undefined,
      startedAt: startedAt.current,
      durationMs: r.durationMs,
      score: r.score,
      correct: r.correct,
      attempted: r.attempted,
      stats: r.numbers,
      breakdown: r.breakdown,
      reviewUpdates: r.reviewUpdates,
      seenIds: r.seenIds,
    });
    const tokensAfter = totalTokens(store.sessions);
    const levelUp = rankFor(tokensAfter).level > rankFor(tokensBefore).level ? rankFor(tokensAfter).name : null;
    setResult({ r, o: { ...o, tokens: tokensForRound(r.score), levelUp } });
    setFocusReview(false);
    setPhase('summary');
    if (r.score > 0) setTimeout(() => confetti({ count: o.isBest || levelUp ? 140 : 60 }), 250);
  };

  const Comp = game.component;
  const modeLabel = game.modes.find((m) => m.id === mode)?.label ?? mode;
  const best = store.best(game.id, mode);
  const dueCount = store.due(game.id).length;

  return (
    <div className={`game cat-${game.category}`} style={{ ['--accent' as string]: game.color }}>
      <header className="topbar game-head">
        <div className="wrap">
          <button className="exit-btn" onClick={() => go('')} aria-label="Exit to the arcade">
            <Icon name="back" size={18} /> <span>Arcade</span>
          </button>
          {phase === 'play' && (
            <button className="iconbtn pause-btn" onClick={() => setPaused(true)} aria-label="Pause">
              <Icon name="pause" />
            </button>
          )}
          <h1 className="game-title">{game.title}</h1>
          {phase === 'play' && (
            <div className="scorebox" aria-live="off">
              <span className="lbl">Score</span>
              <span key={pop} className={`val tnum ${pop ? 'score-pop' : ''}`}>{fmt(score)}</span>
              {pop > 0 && delta > 0 && <span key={`d${pop}`} className="float-pts" aria-hidden="true">+{fmt(delta)}</span>}
            </div>
          )}
          {phase !== 'play' && (
            <>
              <span className="spacer" />
              <GameSwitcher current={game.id} />
            </>
          )}
        </div>
      </header>

      <main className="stage" id="main">
        {phase === 'intro' && (
          <section className="intro">
            <div className="intro-head">
              <div className="intro-art"><GameArt id={game.id} /></div>
              <div>
                <h2 className="intro-title">{game.title}</h2>
                <p className="tag">{game.tagline}</p>
              </div>
            </div>
            <ol className="howto">
              {game.howTo.map((h) => <li key={h}><span>{h}</span></li>)}
            </ol>
            <div className="settings-grid">
              <Seg label="Mode" options={game.modes.map((m) => ({ id: m.id, label: m.label, hint: m.hint }))} value={mode} onChange={setMode} />
              {game.difficulties && (
                <Seg label="Difficulty" options={game.difficulties.map((d, i) => ({ id: i + 1, label: d }))} value={difficulty} onChange={setDifficulty} />
              )}
              {game.options && (
                <div>
                  <label className="field-label" htmlFor="game-option">{game.options.label}</label>
                  <select id="game-option" className="answer" style={{ minHeight: 48, fontSize: 'var(--t-md)' }} value={option} onChange={(e) => setOption(e.target.value)}>
                    {game.options.choices.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="start-row">
              <button className="btn btn-primary btn-lg" onClick={start} autoFocus>Start</button>
              {dueCount > 0 && (
                <button className="btn btn-ghost" onClick={() => { setFocusReview(true); start(); }}>
                  Review {dueCount} missed
                </button>
              )}
              <span className="muted">{best ? `Your best in ${modeLabel}: ${fmt(best)}` : `About ${game.length} a round`}</span>
            </div>
          </section>
        )}

        {phase === 'play' && (
          <Comp key={round} config={config} store={store} paused={paused} onFinish={onFinish} onScore={onScore} />
        )}

        {phase === 'summary' && result && (
          <Summary game={game} result={result.r} outcome={result.o} modeLabel={modeLabel} onAgain={start} onSettings={() => setPhase('intro')} />
        )}
      </main>

      {paused && phase === 'play' && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div className="overlay-card">
            <h2 id="pause-title">Paused</h2>
            <p className="dim">The clock stops while you're away.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setPaused(false)} autoFocus>Resume</button>
            <button className="btn btn-ghost" onClick={() => { setPaused(false); setPhase('intro'); }}>Quit this round</button>
            <button className="btn btn-ghost" onClick={() => go('')}>Back to the arcade</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ game, result, outcome, modeLabel, onAgain, onSettings }: {
  game: GameDef;
  result: RoundResult;
  outcome: Outcome;
  modeLabel: string;
  onAgain: () => void;
  onSettings: () => void;
}) {
  const store = useStore();
  const againRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    againRef.current?.focus({ preventScroll: true });
  }, []);
  const prev = outcome.previousBest;
  const nextGame = GAMES[(GAMES.findIndex((g) => g.id === game.id) + 1) % GAMES.length];
  return (
    <section className="summary" aria-labelledby="summary-title">
      <div className="summary-top">
        <h2 id="summary-title" className="round-tag">Round complete · {modeLabel}</h2>
        <div className="final-score">
          <CountUp value={result.score} />
          {outcome.isBest && <span className="best-stamp">{prev === null ? 'First score' : 'New best'}</span>}
        </div>
        <p className="headline">{result.headline}</p>
        <p className={`tokens-won ${outcome.levelUp ? 'levelup' : ''}`}>
          <span className="coin" aria-hidden="true">c</span>
          +{outcome.tokens} token{outcome.tokens === 1 ? '' : 's'}
          {outcome.levelUp ? ` · Rank up: ${outcome.levelUp}!` : ''}
        </p>
        <p className="muted small">
          {outcome.isBest
            ? prev === null
              ? 'This is your score to beat.'
              : `Up from ${fmt(prev)}.`
            : prev !== null
              ? `Your best is ${fmt(prev)}.`
              : ''}
        </p>
      </div>
      <div className="stats">
        {result.stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className="v">{s.value}</span>
            <span className="k">{s.label}</span>
          </div>
        ))}
      </div>
      {result.learnings.length > 0 && (
        <div className="settings-grid" style={{ gap: 'var(--s3)' }}>
          <div className="learn-head">
            <h2>{result.learningsTitle ?? 'What you learned'}</h2>
          </div>
          <ul className="learnings">
            {result.learnings.map((l) => {
              const bm = l.bookmark ? store.items.get(l.bookmark.key)?.bookmarked : false;
              const body = (
                <div>
                  <h3>{l.title}</h3>
                  <p>{l.body}</p>
                  {l.extra && <p className="extra">{l.extra}</p>}
                </div>
              );
              return (
                <li key={l.id} className={`learning o-${l.outcome ?? 'info'}`}>
                  <span className="dot" aria-hidden="true" />
                  {l.image ? (
                    <div className="with-img">
                      <img className="flag-sm" src={l.image} alt="" width={72} height={54} loading="lazy" />
                      {body}
                    </div>
                  ) : (
                    body
                  )}
                  {l.bookmark ? (
                    <button
                      className="revisit"
                      aria-pressed={!!bm}
                      onClick={() => store.setBookmark({ key: l.bookmark!.key, gameId: game.id, label: l.bookmark!.label }, !bm)}
                    >
                      {bm ? 'Saved' : 'Revisit'}
                    </button>
                  ) : (
                    <span />
                  )}
                  <span className="sr-only">
                    {l.outcome === 'correct' ? 'You got this.' : l.outcome === 'wrong' ? 'Missed.' : l.outcome === 'partial' ? 'Partly.' : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="summary-actions">
        <button ref={againRef} className="btn btn-primary btn-lg" onClick={onAgain}>
          <Icon name="replay" size={18} /> Play again
        </button>
        <button className="btn btn-ghost" onClick={onSettings}>Change mode</button>
        <a className="btn btn-ghost" href={`#${nextGame.id}`} style={{ ['--accent' as string]: nextGame.color }}>Try {nextGame.title}</a>
        <button className="btn btn-ghost" onClick={() => go('')}>Arcade</button>
      </div>
    </section>
  );
}

/** Hop between games without going back to the arcade. */
function GameSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open]);
  return (
    <div className="switcher" ref={ref}>
      <button className="switch-btn" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        Games <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="switch-menu" role="menu">
          {GAMES.map((g) => (
            <a
              key={g.id}
              role="menuitem"
              href={`#${g.id}`}
              className={g.id === current ? 'on' : ''}
              style={{ ['--c' as string]: g.color }}
              onClick={() => setOpen(false)}
            >
              <span className="ico"><GameIcon id={g.id} /></span>
              {g.title}
            </a>
          ))}
          <a role="menuitem" href="#" onClick={() => setOpen(false)} className="home-link">Back to the arcade</a>
        </div>
      )}
    </div>
  );
}

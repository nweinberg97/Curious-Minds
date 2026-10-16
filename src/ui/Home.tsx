import { CATEGORIES, GAMES, GAME_BY_ID } from '../games/registry';
import { GameArt } from './art';
import { Icon, fmt, go, useStore } from './components';
import { dayKey, hashString, mulberry32, pick } from '../engine/random';

/** Today's spotlight: deterministic by date, so it feels like a daily pick without gating anything. */
function spotlightFor(day: string) {
  const rand = mulberry32(hashString(`spotlight:${day}`));
  return pick(GAMES, rand);
}

const SPOTLIGHT_COPY: Record<string, { kicker: string; line: string; lede: string }> = {
  'word-rush': { kicker: "Today's spotlight", line: 'How far can one word take you?', lede: 'Chain associations against the clock. Ocean, beach, sand, desert, heat…' },
  'alphabet-sprint': { kicker: "Today's spotlight", line: 'One letter. Everything you know.', lede: 'Three categories, one letter, sixty seconds. Deep cuts score extra.' },
  'word-scramble': { kicker: "Today's spotlight", line: 'Letters in a tumble.', lede: 'Eight words that get harder as you get faster, each with a story behind it.' },
  'define-it': { kicker: "Today's spotlight", line: 'You know it. Can you say it?', lede: 'Put a word into your own words, then see how close you came.' },
  'flag-finder': { kicker: "Today's spotlight", line: 'Ten flags. Where are you?', lede: 'From the famous to the fiendishly similar, with the story behind each design.' },
  'capital-quest': { kicker: "Today's spotlight", line: 'Pin the capital.', lede: 'Ten countries, ten capitals, and the fact that makes each one stick.' },
  'word-web': { kicker: "Today's spotlight", line: 'Sixteen words. Four secrets.', lede: 'Find the four hidden groups before the red herrings find you.' },
};

export function Home() {
  const store = useStore();
  const today = dayKey();
  const spot = spotlightFor(today);
  const copy = SPOTLIGHT_COPY[spot.id];
  const recent = store.profile.recentGames.map((r) => GAME_BY_ID.get(r.gameId)).filter(Boolean).slice(0, 2);
  const due = store.due();
  const dueByGame = new Map<string, number>();
  for (const d of due) dueByGame.set(d.gameId, (dueByGame.get(d.gameId) ?? 0) + 1);
  const totalRounds = store.sessions.length;
  const playedToday = store.sessions.filter((s) => dayKey(new Date(s.startedAt)) === today).length;

  const surprise = () => {
    const pool = GAMES.filter((g) => g.id !== store.profile.recentGames[0]?.gameId);
    go(`play.${pool[Math.floor(Math.random() * pool.length)].id}`);
  };

  return (
    <main className="wrap home" id="main">
      <section className="hero" aria-label="Start playing">
        <div className={`spotlight cat-${spot.category}`}>
          <div>
            <p className="kicker">{copy.kicker}: {spot.title}</p>
            <h1>{copy.line}</h1>
            <p className="lede">{copy.lede}</p>
            <div className="actions">
              <a className="btn btn-primary btn-lg" href={`#play.${spot.id}`}>Play {spot.title}</a>
              <a className="btn btn-ghost" href={`#${spot.id}`}>How it works</a>
            </div>
          </div>
          <div className="spotlight-art" style={{ width: 240, height: 170 }}>
            <GameArt id={spot.id} />
          </div>
        </div>

        <div className="quick">
          <h2>Got two minutes?</h2>
          <button className="quick-item" onClick={surprise}>
            <span className="glyph" aria-hidden="true"><Icon name="shuffle" /></span>
            <span>
              <strong>Surprise me</strong>
              <span className="sub">Jump straight into a random game</span>
            </span>
            <span className="go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
          </button>
          {recent.map((g) => (
            <a key={g!.id} className={`quick-item cat-${g!.category}`} href={`#play.${g!.id}`}>
              <span className="glyph" aria-hidden="true"><Icon name="replay" /></span>
              <span>
                <strong>Play {g!.title} again</strong>
                <span className="sub">
                  {store.best(g!.id) ? `Best ${fmt(store.best(g!.id)!)}` : 'Pick up where you left off'}
                </span>
              </span>
              <span className="go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
            </a>
          ))}
          {recent.length < 2 && (
            <a className="quick-item cat-connections" href="#play.word-web">
              <span className="glyph" aria-hidden="true">4</span>
              <span>
                <strong>No clock? Try Word Web</strong>
                <span className="sub">Take your time finding four hidden groups</span>
              </span>
              <span className="go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
            </a>
          )}
          {recent.length === 0 && (
            <a className="quick-item cat-words" href="#play.word-rush">
              <span className="glyph" aria-hidden="true">A</span>
              <span>
                <strong>Start with Word Rush</strong>
                <span className="sub">The quickest way in: one minute, one word at a time</span>
              </span>
              <span className="go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
            </a>
          )}
        </div>
      </section>

      {due.length > 0 && (
        <section className="review-strip" aria-label="Review">
          <h2>{due.length} {due.length === 1 ? 'thing' : 'things'} worth another look</h2>
          {[...dueByGame].map(([id, n]) => {
            const g = GAME_BY_ID.get(id);
            if (!g) return null;
            return (
              <a key={id} className={`chip cat-${g.category}`} href={`#review.${id}`}>
                {g.title} <b>{n}</b>
              </a>
            );
          })}
        </section>
      )}

      {CATEGORIES.map((cat) => {
        const games = GAMES.filter((g) => g.category === cat.id);
        return (
          <section key={cat.id} className={`band cat-${cat.id}`} aria-labelledby={`band-${cat.id}`}>
            <div className="band-head">
              <h2 id={`band-${cat.id}`}>{cat.title}</h2>
              <p>{cat.blurb}</p>
            </div>
            <div className={`cards n-${Math.min(games.length, 4)}`}>
              {games.map((g) => {
                const plays = store.plays(g.id);
                const best = store.best(g.id);
                const finish = plays >= 5 ? 'finish-foil' : '';
                return (
                  <a key={g.id} className={`card ${finish}`} href={`#${g.id}`} aria-label={`${g.title}. ${g.tagline} About ${g.length}.${best ? ` Best ${fmt(best)}.` : ''}`}>
                    <div className="art"><GameArt id={g.id} /></div>
                    {plays >= 25 && <span className="stamp" aria-hidden="true">25<br />rounds</span>}
                    <div className="card-body">
                      <h3>{g.title}</h3>
                      <p>{g.tagline}</p>
                      <div className="card-meta">
                        <span>{g.length}</span>
                        {best ? <span className="best">Best {fmt(best)}</span> : <span>New to you</span>}
                        {dueByGame.get(g.id) ? <span>{dueByGame.get(g.id)} to review</span> : null}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="numbers" aria-label="Your numbers">
        <span><span className="n tnum">{fmt(totalRounds)}</span>rounds played</span>
        <span><span className="n tnum">{fmt(store.profile.days.length)}</span>days you've played</span>
        <span><span className="n tnum">{fmt(playedToday)}</span>rounds today</span>
        <a className="btn btn-ghost" href="#progress">See your progress</a>
      </section>

      <p className="footnote">
        Free, unlimited and private. Everything you do stays in this browser: no account, no tracking.{' '}
        <a href="#settings">Your data and settings</a>.
      </p>
    </main>
  );
}

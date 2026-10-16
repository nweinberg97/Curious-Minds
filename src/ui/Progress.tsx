import { CATEGORIES, GAMES, GAME_BY_ID } from '../games/registry';
import { REGIONS } from '../games/geo/logic';
import { fmt, useStore } from './components';
import type { SessionRecord } from '../storage/schema';

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="muted small">Play more rounds to see a trend</span>;
  const w = 120;
  const h = 32;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 2, h - 3 - (v / max) * (h - 6)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Scores over your last ${values.length} rounds`}>
      <path d={`${d} L ${last[0]} ${h} L 2 ${h} Z`} fill="var(--accent)" opacity="0.12" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="var(--accent)" />
    </svg>
  );
}

function trend(sessions: SessionRecord[]): string {
  // Compare the average of the last 5 rounds with the 5 before, within the most played mode.
  if (sessions.length < 6) return '';
  const recent = sessions.slice(-5);
  const before = sessions.slice(-10, -5);
  const avg = (s: SessionRecord[]) => s.reduce((a, b) => a + b.score, 0) / s.length;
  const a = avg(recent);
  const b = avg(before);
  if (b === 0) return '';
  const pct = Math.round(((a - b) / b) * 100);
  if (Math.abs(pct) < 5) return 'Steady';
  return pct > 0 ? `Up ${pct}% lately` : `Down ${-pct}% lately`;
}

export function Progress() {
  const store = useStore();
  const s = store.sessions;
  const totalMs = s.reduce((a, b) => a + b.durationMs, 0);
  const correct = s.reduce((a, b) => a + b.correct, 0);
  const attempted = s.reduce((a, b) => a + b.attempted, 0);

  const items = [...store.items.values()];
  const learned = items
    .filter((i) => i.lastResult === 'correct' && i.wrong > 0)
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 12);
  const due = store.due();

  const regions: Record<string, [number, number]> = {};
  for (const sess of s) {
    if (!sess.breakdown) continue;
    for (const [r, [c, t]] of Object.entries(sess.breakdown)) {
      const cur = regions[r] ?? [0, 0];
      regions[r] = [cur[0] + c, cur[1] + t];
    }
  }

  const byCat = CATEGORIES.map((c) => ({ c, n: s.filter((x) => GAME_BY_ID.get(x.gameId)?.category === c.id).length }));
  const maxCat = Math.max(1, ...byCat.map((x) => x.n));

  if (s.length === 0) {
    return (
      <main className="wrap page" id="main">
        <h1 className="page-title">Your progress</h1>
        <section className="section">
          <p>Nothing here yet. Finish a round of any game and your scores, the things you learned and the things worth revisiting will show up here.</p>
          <div className="row">
            <a className="btn btn-primary" href="#play.word-rush">Play Word Rush</a>
            <a className="btn btn-ghost" href="#">Browse the arcade</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap page" id="main">
      <h1 className="page-title">Your progress</h1>

      <section className="section" aria-label="Overview">
        <div className="kv">
          <div><span className="n tnum">{fmt(s.length)}</span><span className="k">rounds played</span></div>
          <div><span className="n tnum">{fmt(store.profile.days.length)}</span><span className="k">days played</span></div>
          <div><span className="n tnum">{totalMs > 0 && totalMs < 60000 ? '<1' : fmt(totalMs / 60000)}</span><span className="k">minutes of play</span></div>
          <div><span className="n tnum">{attempted ? Math.round((correct / attempted) * 100) : 0}%</span><span className="k">answers right overall</span></div>
        </div>
      </section>

      <section className="section">
        <h2>Game by game</h2>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Game</th>
                <th className="num">Rounds</th>
                <th className="num">Best</th>
                <th className="num">Accuracy</th>
                <th>Recent scores</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {GAMES.map((g) => {
                const gs = s.filter((x) => x.gameId === g.id);
                if (!gs.length) {
                  return (
                    <tr key={g.id}>
                      <td><a href={`#${g.id}`}>{g.title}</a></td>
                      <td className="num muted">0</td>
                      <td className="num muted">–</td>
                      <td className="num muted">–</td>
                      <td className="muted small">Not played yet</td>
                      <td />
                    </tr>
                  );
                }
                const modes = new Map<string, SessionRecord[]>();
                for (const x of gs) modes.set(x.mode, [...(modes.get(x.mode) ?? []), x]);
                const main = [...modes.values()].sort((a, b) => b.length - a.length)[0];
                const c = gs.reduce((a, b) => a + b.correct, 0);
                const t = gs.reduce((a, b) => a + b.attempted, 0);
                return (
                  <tr key={g.id} className={`cat-${g.category}`}>
                    <td><a href={`#${g.id}`}>{g.title}</a></td>
                    <td className="num">{gs.length}</td>
                    <td className="num">{fmt(store.best(g.id) ?? 0)}</td>
                    <td className="num">{t ? `${Math.round((c / t) * 100)}%` : '–'}</td>
                    <td><Spark values={main.slice(-20).map((x) => x.score)} /></td>
                    <td className="small">{trend(main)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {Object.keys(regions).length > 0 && (
        <section className="section cat-world">
          <h2>Your mental map</h2>
          <p>Accuracy by region across Flag Finder and Capital Quest.</p>
          <div className="table-scroll">
            <table className="data">
              <tbody>
                {REGIONS.filter((r) => regions[r]).map((r) => {
                  const [c, t] = regions[r];
                  const pct = Math.round((c / t) * 100);
                  return (
                    <tr key={r}>
                      <td>{r}</td>
                      <td style={{ width: '50%' }}><div className="bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div></td>
                      <td className="num">{pct}%</td>
                      <td className="num muted">{c}/{t}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section">
        <h2>Worth revisiting</h2>
        {due.length ? (
          <>
            <p>Things you missed recently or saved. Each game mixes a few back into your rounds, or review them directly.</p>
            <div className="row">
              {[...new Set(due.map((d) => d.gameId))].map((id) => {
                const g = GAME_BY_ID.get(id);
                return g ? (
                  <a key={id} className={`chip cat-${g.category}`} href={`#review.${id}`}>
                    Review {g.title} <b>{due.filter((d) => d.gameId === id).length}</b>
                  </a>
                ) : null;
              })}
            </div>
            <ul className="learnings">
              {due.slice(0, 15).map((d) => (
                <li key={d.key} className={`learning ${d.bookmarked ? 'o-info' : 'o-wrong'}`}>
                  <span className="dot" aria-hidden="true" />
                  <div>
                    <h3>{d.label}</h3>
                    <p className="small">
                      {GAME_BY_ID.get(d.gameId)?.title}. {d.bookmarked ? 'Saved by you.' : `Missed ${d.wrong} time${d.wrong === 1 ? '' : 's'}, right ${d.correct}.`}
                    </p>
                  </div>
                  <span />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Nothing waiting. Anything you miss will appear here so you can come back to it.</p>
        )}
      </section>

      {learned.length > 0 && (
        <section className="section">
          <h2>Recently learned</h2>
          <p>Things you once missed and have since got right.</p>
          <div className="pills">
            {learned.map((i) => <span key={i.key} className="pill hit">{i.label}</span>)}
          </div>
        </section>
      )}

      <section className="section">
        <h2>What you play most</h2>
        <div className="table-scroll">
          <table className="data">
            <tbody>
              {byCat.map(({ c, n }) => (
                <tr key={c.id} className={`cat-${c.id}`}>
                  <td>{c.title}</td>
                  <td style={{ width: '50%' }}><div className="bar" aria-hidden="true"><i style={{ width: `${(n / maxCat) * 100}%` }} /></div></td>
                  <td className="num">{n} round{n === 1 ? '' : 's'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

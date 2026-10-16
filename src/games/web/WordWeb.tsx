import { useMemo, useRef, useState } from 'react';
import type { PlayProps, Learning } from '../../engine/types';
import type { WebGroup } from '../../content/types';
import { announce, useFlash } from '../../engine/hooks';
import { pickFresh, shuffle } from '../../engine/random';
import { sfx } from '../../engine/sound';
import { WEB_GROUP_POINTS } from '../../engine/scoring';
import { Icon } from '../../ui/components';
import { WEB_BOARDS, CLASSIC_MISTAKES, judgeGuess, boardScore, boardWords, key } from './logic';

export default function WordWeb({ config, store, onFinish, onScore }: PlayProps) {
  const classic = config.mode !== 'relaxed';
  const board = useMemo(() => pickFresh(WEB_BOARDS, 1, (b) => b.id, store.recentSet('word-web'))[0], [store]);
  const [order, setOrder] = useState(() => shuffle(boardWords(board)));
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<number[]>([]); // group indexes in solve order
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [tried] = useState(() => new Set<string>());
  const [msg, setMsg] = useState<{ text: string; tone: string }>({ text: 'Find four groups of four.', tone: '' });
  const [flash, trigger] = useFlash<'bad' | 'good'>(500);
  const started = useRef(Date.now());
  const finished = useRef(false);

  const solvedSet = new Set([...solved, ...revealed]);
  const doneWords = new Set([...solvedSet].flatMap((g) => board.groups[g].words.map(key)));
  const remaining = order.filter((w) => !doneWords.has(key(w)));
  const over = solvedSet.size === 4;
  const outOfMistakes = classic && mistakes >= CLASSIC_MISTAKES;

  const toggle = (w: string) => {
    if (over) return;
    sfx.tap();
    setSelected((s) => (s.includes(w) ? s.filter((x) => x !== w) : s.length < 4 ? [...s, w] : s));
  };

  const revealRest = (currentSolved: number[]) => {
    const rest = [0, 1, 2, 3].filter((g) => !currentSolved.includes(g));
    setRevealed(rest);
    setSelected([]);
  };

  const submit = () => {
    if (selected.length !== 4 || over) return;
    const r = judgeGuess(board, selected, new Set(solved), tried);
    if (r.kind === 'repeat') {
      setMsg({ text: "You've already tried that group.", tone: 'warn' });
      announce("You've already tried that group.");
      return;
    }
    if (r.kind === 'solved') {
      const gi = board.groups.indexOf(r.group);
      const ns = [...solved, gi];
      setSolved(ns);
      setSelected([]);
      const pts = boardScore(ns.map((g) => board.groups[g].level), mistakes, false);
      onScore(pts);
      setMsg({ text: `${r.group.title}: +${WEB_GROUP_POINTS[r.group.level]}`, tone: 'good' });
      announce(`Correct. ${r.group.title}: ${r.group.words.join(', ')}.`);
      sfx.combo(ns.length);
      trigger('good');
      if (ns.length === 3) {
        // The last group is now determined: solve it for the player.
        const last = [0, 1, 2, 3].find((g) => !ns.includes(g))!;
        setTimeout(() => {
          const all = [...ns, last];
          setSolved(all);
          onScore(boardScore(all.map((g) => board.groups[g].level), mistakes, false));
          sfx.complete();
        }, 600);
      }
      return;
    }
    tried.add(selected.map(key).sort().join('|'));
    const m = mistakes + 1;
    setMistakes(m);
    onScore(boardScore(solved.map((g) => board.groups[g].level), m, false));
    trigger('bad');
    sfx.wrong();
    const text = r.kind === 'one-away' ? 'One away. Three of those belong together.' : 'Not a group.';
    if (classic && m >= CLASSIC_MISTAKES) {
      setMsg({ text: `${text} That was your last mistake, so here are the answers.`, tone: 'bad' });
      announce(`${text} Out of mistakes. Revealing the answers.`);
      revealRest(solved);
    } else {
      setMsg({ text, tone: r.kind === 'one-away' ? 'warn' : 'bad' });
      announce(text);
    }
  };

  const giveUp = () => {
    revealRest(solved);
    setMsg({ text: 'Here are the groups you had left.', tone: '' });
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const levels = solved.map((g) => board.groups[g].level);
    const gotRevealed = revealed.length > 0;
    const score = boardScore(levels, mistakes, gotRevealed);
    const learnings: Learning[] = board.groups
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((g, i) => ({
        id: `g${i}`,
        title: `${g.title}: ${g.words.join(', ')}`,
        body: g.explanation,
        outcome: solved.includes(board.groups.indexOf(g)) ? 'correct' : 'wrong',
      }));
    if (board.herring) learnings.push({ id: 'herring', title: 'The red herrings', body: board.herring, outcome: 'info' });
    onFinish({
      score,
      correct: solved.length,
      attempted: solved.length + mistakes,
      durationMs: Date.now() - started.current,
      headline: solved.length === 4 && !gotRevealed ? (mistakes === 0 ? 'Perfect board' : `Solved with ${mistakes} mistake${mistakes === 1 ? '' : 's'}`) : `${solved.length} of 4 groups`,
      stats: [
        { label: 'Groups', value: `${solved.length}/4` },
        { label: 'Mistakes', value: String(mistakes) },
        { label: 'Board', value: board.title },
      ],
      numbers: { groups: solved.length, mistakes },
      learnings,
      learningsTitle: 'Why they belong together',
      reviewUpdates: [],
      seenIds: [board.id],
    });
  };

  const groupView = (gi: number, isRevealed: boolean) => {
    const g: WebGroup = board.groups[gi];
    return (
      <div key={gi} className={`solved-group lvl-${g.level} ${isRevealed ? 'revealed' : ''} lift`}>
        <b>{g.title}</b>
        <span>{g.words.join(', ')}</span>
      </div>
    );
  };

  return (
    <>
      <div className="row">
        <span className="prompt-label">Board: {board.title}</span>
        <span className="spacer" />
        {classic ? (
          <span className="mistakes" aria-label={`${CLASSIC_MISTAKES - mistakes} mistakes left`}>
            Mistakes left
            {Array.from({ length: CLASSIC_MISTAKES }, (_, k) => <i key={k} className={k < mistakes ? 'used' : ''} />)}
          </span>
        ) : (
          <span className="mistakes">Mistakes: {mistakes}</span>
        )}
      </div>
      <div className="settings-grid" style={{ gap: 8 }}>
        {solved.map((g) => groupView(g, false))}
        {revealed.map((g) => groupView(g, true))}
      </div>
      {!over && (
        <div className={`web-grid ${flash === 'bad' ? 'shake' : ''}`} role="group" aria-label="Words"
          onKeyDown={(e) => { if (e.key === 'Enter' && selected.length === 4) { e.preventDefault(); submit(); } }}>
          {remaining.map((w) => (
            <button key={w} className="web-cell" aria-pressed={selected.includes(w)} onClick={() => toggle(w)}>
              {w}
            </button>
          ))}
        </div>
      )}
      <p className={`feedback ${msg.tone}`} aria-live="off">{msg.text}</p>
      {!over ? (
        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => setOrder((o) => shuffle(o))}>
            <Icon name="shuffle" size={16} /> Shuffle
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])} disabled={!selected.length}>Deselect</button>
          <span className="spacer" />
          {!classic && <button className="btn btn-ghost btn-sm" onClick={giveUp}>Show answers</button>}
          <button className="btn btn-primary" onClick={submit} disabled={selected.length !== 4}>
            Submit {selected.length}/4
          </button>
        </div>
      ) : (
        <div className="row end">
          <button className="btn btn-primary" onClick={finish} autoFocus>
            {outOfMistakes || revealed.length ? 'See explanations' : 'See results'}
          </button>
        </div>
      )}
    </>
  );
}

import React, { useMemo, useRef, useState } from 'react';
import type { PlayProps, Learning } from '../../engine/types';
import { useCountdown, useFlash, announce, useLatest } from '../../engine/hooks';
import { speedBonus, chainMultiplier } from '../../engine/scoring';
import { pickFresh } from '../../engine/random';
import { sfx } from '../../engine/sound';
import { TimerBar, Icon, fmt } from '../../ui/components';
import { judgeLink, neighbours, STARTER_WORDS, isKnown } from './graph';

interface Link {
  from: string;
  word: string;
  reason: string;
  points: number;
  vouched: boolean;
}

const DURATION: Record<string, number | null> = { sprint60: 60_000, sprint90: 90_000, relaxed: null };
const RELAXED_GOAL = 12;

export default function WordRush({ config, store, paused, onFinish, onScore }: PlayProps) {
  const total = DURATION[config.mode] ?? null;
  const starters = useMemo(
    () => pickFresh(STARTER_WORDS, 20, (w) => w, store.recentSet('word-rush')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const starterIdx = useRef(0);
  const [segments, setSegments] = useState<{ start: string; links: Link[] }[]>([{ start: starters[0], links: [] }]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; tone: 'good' | 'bad' | 'warn' | '' }>({ text: '', tone: '' });
  const [pendingVouch, setPendingVouch] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [flash, trigger] = useFlash<'good' | 'bad'>();
  const lastAt = useRef(0);
  const done = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const seg = segments[segments.length - 1];
  const current = seg.links.length ? seg.links[seg.links.length - 1].word : seg.start;
  const anchor = [...seg.links].reverse().find((l) => isKnown(l.word))?.word ?? seg.start;
  const used = useMemo(() => new Set([seg.start, ...seg.links.map((l) => l.word)]), [seg]);
  const allLinks = segments.flatMap((s) => s.links);
  const latest = useLatest({ score, segments });

  const finish = () => {
    if (done.current) return;
    done.current = true;
    const { score, segments } = latest.current;
    const allLinks = segments.flatMap((s) => s.links);
    const longest = Math.max(0, ...segments.map((s) => s.links.length));
    const vouched = allLinks.filter((l) => l.vouched).length;
    const learnings: Learning[] = allLinks.map((l, i) => ({
      id: `l${i}`,
      title: `${l.from} → ${l.word}`,
      body: l.vouched ? 'Your call: not in our dictionary yet, counted at half points.' : l.reason,
      outcome: l.vouched ? 'partial' : 'correct',
    }));
    const usedAll = new Set(segments.flatMap((s) => [s.start, ...s.links.map((l) => l.word)]));
    for (const s of segments) {
      const n = neighbours(s.start, 6, usedAll);
      if (n.length) learnings.push({ id: `n-${s.start}`, title: `Other strong links from ${s.start}`, body: n.join(', '), outcome: 'info' });
    }
    sfx.complete();
    onFinish({
      score,
      correct: allLinks.length - vouched,
      attempted: allLinks.length,
      durationMs: clock.now(),
      headline: longest ? `Longest chain: ${longest} link${longest === 1 ? '' : 's'}` : 'No links this time',
      stats: [
        { label: 'Links', value: String(allLinks.length) },
        { label: 'Longest chain', value: String(longest) },
        { label: 'Your calls', value: String(vouched) },
      ],
      numbers: { links: allLinks.length, longestChain: longest },
      learnings,
      learningsTitle: 'How your chain connects',
      reviewUpdates: [],
      seenIds: segments.map((s) => s.start),
    });
  };

  const clock = useCountdown(total, paused, finish);

  const addLink = (word: string, reason: string, vouched: boolean) => {
    const t = clock.now();
    const dt = t - lastAt.current;
    lastAt.current = t;
    const idx = seg.links.length;
    const mult = chainMultiplier(idx);
    const pts = Math.round(vouched ? 50 * mult : (100 + speedBonus(dt, 100)) * mult);
    const newScore = score + pts;
    setScore(newScore);
    onScore(newScore);
    setSegments((ss) => [...ss.slice(0, -1), { ...seg, links: [...seg.links, { from: current, word, reason, points: pts, vouched }] }]);
    setFeedback({ text: vouched ? `Counted as your call: +${pts}` : `${reason}  +${pts}`, tone: vouched ? 'warn' : 'good' });
    announce(`${word} accepted. ${pts} points.`);
    setPendingVouch(null);
    setInput('');
    trigger('good');
    if (idx >= 4) sfx.combo(idx - 3);
    else sfx.correct();
    if (config.mode === 'relaxed' && allLinks.length + 1 >= RELAXED_GOAL) setTimeout(finish, 700);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (paused || done.current) return;
    const v = judgeLink(current, input, used, anchor !== current ? anchor : undefined);
    if (v.ok) return addLink(v.word, v.reason, false);
    if ((v.why === 'unknown' || v.why === 'unlinked') && pendingVouch === v.word) {
      return addLink(v.word, '', true);
    }
    if (v.why === 'unknown' || v.why === 'unlinked') {
      setPendingVouch(v.word);
      setFeedback({ text: v.message, tone: 'warn' });
      announce(`${v.message} Press Enter again to count it as your call, or try another word.`);
      sfx.wrong();
      return;
    }
    setFeedback({ text: v.message, tone: 'bad' });
    announce(v.message);
    trigger('bad');
    sfx.wrong();
  };

  const skip = () => {
    if (done.current) return;
    starterIdx.current = (starterIdx.current + 1) % starters.length;
    const next = starters[starterIdx.current];
    setSegments((ss) => [...ss, { start: next, links: [] }]);
    setPendingVouch(null);
    setInput('');
    setFeedback({ text: `New word. Your multiplier starts again.`, tone: '' });
    announce(`New word: ${next}`);
    lastAt.current = clock.now();
    inputRef.current?.focus();
  };

  const mult = chainMultiplier(seg.links.length);
  const recent = seg.links.slice(-6);

  return (
    <>
      <TimerBar remaining={clock.remaining} total={total} label={config.mode === 'relaxed' ? `Link ${allLinks.length} of ${RELAXED_GOAL}` : 'Time left'} />
      <div className="chain" aria-label="Your chain so far" hidden={seg.links.length === 0}>
        {seg.links.length > recent.length && <span className="muted small">…</span>}
        {(seg.links.length <= recent.length ? [seg.start] : []).map((w) => (
          <span key="start" className="link"><span className="w">{w}</span></span>
        ))}
        {recent.map((l, i) => (
          <span key={i} className={`link ${l.vouched ? 'vouched' : ''}`}>
            <span className="arrow" aria-hidden="true">→</span>
            <span className="w">{l.word}</span>
          </span>
        ))}
      </div>
      <div>
        <div className="row">
          <span className="prompt-label">What comes to mind after…</span>
          <span className="spacer" />
          <span className="mult" aria-label={`Chain multiplier ${mult}`}>×{mult}</span>
        </div>
        <div key={current} className="big-word lift">{current}</div>
      </div>
      <form onSubmit={submit} className={flash === 'bad' ? 'shake' : ''}>
        <label htmlFor="wr-input" className="sr-only">Your next word</label>
        <div className="answer-row">
          <input
            id="wr-input"
            ref={inputRef}
            className={`answer ${flash === 'good' ? 'is-good' : flash === 'bad' ? 'is-bad' : ''}`}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (pendingVouch) setPendingVouch(null);
            }}
            placeholder="Your next word"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            autoFocus
            disabled={paused}
          />
          <button className="btn btn-primary" type="submit" disabled={!input.trim()}>
            Link
          </button>
        </div>
      </form>
      <p className={`feedback ${feedback.tone}`}>{feedback.text}</p>
      {pendingVouch && (
        <div className="vouch">
          <p>
            Sure <b>{pendingVouch}</b> connects to <b>{current}</b>? Count it as your call for half points, or try another word.
          </p>
          <div className="row">
            <button className="btn btn-tile btn-sm" onClick={() => submit()} type="button">
              Count it (Enter)
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setPendingVouch(null); setInput(''); inputRef.current?.focus(); }}>
              Try another word
            </button>
          </div>
        </div>
      )}
      <div className="row">
        <button className="btn btn-ghost btn-sm" type="button" onClick={skip}>
          <Icon name="shuffle" size={16} /> New word
        </button>
        <span className="spacer" />
        <span className="muted small tnum">{fmt(score)} pts</span>
        <button className="btn btn-ghost btn-sm" type="button" onClick={finish}>
          Finish round
        </button>
      </div>
    </>
  );
}

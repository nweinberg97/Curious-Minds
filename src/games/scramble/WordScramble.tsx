import React, { useMemo, useRef, useState } from 'react';
import type { PlayProps, Learning } from '../../engine/types';
import type { ScrambleWord, Difficulty } from '../../content/types';
import type { ReviewUpdate } from '../../engine/review';
import { useCountdown, useFlash, announce, useLatest } from '../../engine/hooks';
import { speedBonus, hintFactor } from '../../engine/scoring';
import { pickFresh } from '../../engine/random';
import { sfx } from '../../engine/sound';
import { SCRAMBLE_WORDS } from '../../content/scramble';
import { TimerBar } from '../../ui/components';
import {
  WORDS_PER_ROUND, WORD_TIME_MS, scrambleLetters, isCorrect, hintPrefix, maxHints, wordsAt, nextDifficulty, DIFFICULTY_FACTOR,
} from './logic';

interface Turn {
  w: ScrambleWord;
  result: 'correct' | 'missed';
  points: number;
  hints: number;
  ms: number;
}

const BY_WORD = new Map(SCRAMBLE_WORDS.map((w) => [w.word, w]));

export default function WordScramble({ config, store, paused, onFinish, onScore }: PlayProps) {
  const timed = config.mode !== 'relaxed';
  const start = Math.max(1, Math.min(4, config.difficulty)) as Difficulty;
  const recent = useMemo(() => store.recentSet('word-scramble'), [store]);
  const reviewQueue = useRef(
    config.review
      .filter((r) => r.key.startsWith('scramble:'))
      .map((r) => BY_WORD.get(r.key.slice(9)))
      .filter((w): w is ScrambleWord => !!w)
      .slice(0, config.reviewFocus ? WORDS_PER_ROUND : 2),
  );
  const usedIds = useRef(new Set<string>());

  const pickWord = (d: Difficulty, idx: number): ScrambleWord => {
    // Mix review words in at positions 2 and 5 (or everywhere in review focus).
    if (reviewQueue.current.length && (config.reviewFocus || idx === 2 || idx === 5)) {
      const w = reviewQueue.current.shift()!;
      if (!usedIds.current.has(w.word)) {
        usedIds.current.add(w.word);
        return w;
      }
    }
    const pool = wordsAt(d).filter((w) => !usedIds.current.has(w.word));
    const w = pickFresh(pool.length ? pool : SCRAMBLE_WORDS, 1, (x) => x.word, recent)[0];
    usedIds.current.add(w.word);
    return w;
  };

  const [difficulty, setDifficulty] = useState<Difficulty>(start);
  const [current, setCurrent] = useState<ScrambleWord>(() => pickWord(start, 0));
  const [turnNo, setTurnNo] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [score, setScore] = useState(0);
  const [fastStreak, setFastStreak] = useState(0);
  const latest = useLatest({ turns, score });
  const done = useRef(false);

  const finish = (allTurns: Turn[], finalScore: number) => {
    if (done.current) return;
    done.current = true;
    const correct = allTurns.filter((t) => t.result === 'correct').length;
    const learnings: Learning[] = allTurns.map((t) => ({
      id: t.w.word,
      title: t.w.word,
      body: t.w.definition,
      extra: [t.w.example, t.w.note].filter(Boolean).join(' '),
      outcome: t.result === 'correct' ? (t.hints ? 'partial' : 'correct') : 'wrong',
    }));
    const reviewUpdates: ReviewUpdate[] = allTurns.map((t) => ({
      key: `scramble:${t.w.word}`,
      gameId: 'word-scramble',
      label: t.w.word,
      result: t.result === 'missed' ? 'wrong' : t.hints ? 'partial' : 'correct',
    }));
    sfx.complete();
    onFinish({
      score: finalScore,
      correct,
      attempted: allTurns.length,
      durationMs: allTurns.reduce((s, t) => s + t.ms, 0),
      headline: `${correct} of ${allTurns.length} unscrambled`,
      stats: [
        { label: 'Solved', value: `${correct}/${allTurns.length}` },
        { label: 'Hints used', value: String(allTurns.reduce((s, t) => s + t.hints, 0)) },
        { label: 'Reached', value: ['Starter', 'Standard', 'Tricky', 'Expert'][Math.max(...allTurns.map((t) => t.w.difficulty)) - 1] ?? '' },
      ],
      numbers: { solved: correct },
      learnings,
      learningsTitle: 'The words',
      reviewUpdates,
      seenIds: allTurns.map((t) => t.w.word),
    });
  };

  const onTurnDone = (t: Turn) => {
    const allTurns = [...turns, t];
    const ns = score + t.points;
    setTurns(allTurns);
    setScore(ns);
    onScore(ns);
    const res = t.result === 'missed' ? 'miss' : t.hints === 0 && t.ms < 10_000 ? 'fast' : 'ok';
    const streak = res === 'fast' ? fastStreak + 1 : 0;
    setFastStreak(res === 'fast' && streak >= 2 ? 0 : streak);
    const nd = nextDifficulty(difficulty, res, streak, start);
    setDifficulty(nd);
    return { allTurns, ns, nd };
  };

  const next = (allTurns: Turn[], ns: number, nd: Difficulty) => {
    if (allTurns.length >= WORDS_PER_ROUND) return finish(allTurns, ns);
    setCurrent(pickWord(nd, allTurns.length));
    setTurnNo((n) => n + 1);
  };

  return (
    <>
      <div className="row">
        <div className="progress-dots" aria-label={`Word ${turns.length + 1} of ${WORDS_PER_ROUND}`}>
          {Array.from({ length: WORDS_PER_ROUND }, (_, i) => (
            <span key={i} className={i < turns.length ? (turns[i].result === 'correct' ? 'good' : 'bad') : i === turnNo ? 'now' : ''} />
          ))}
        </div>
        <span className="spacer" />
        <span className="muted small">{['Starter', 'Standard', 'Tricky', 'Expert'][difficulty - 1]}</span>
      </div>
      <TurnView
        key={turnNo}
        w={current}
        timed={timed}
        paused={paused}
        onDone={(t) => {
          const r = onTurnDone(t);
          return () => next(r.allTurns, r.ns, r.nd);
        }}
        onQuit={() => finish(latest.current.turns, latest.current.score)}
        last={turns.length + 1 >= WORDS_PER_ROUND}
      />
    </>
  );
}

function TurnView({ w, timed, paused, onDone, onQuit, last }: {
  w: ScrambleWord;
  timed: boolean;
  paused: boolean;
  onDone: (t: Turn) => () => void;
  onQuit: () => void;
  last: boolean;
}) {
  const letters = useMemo(() => scrambleLetters(w.word, Math.random, w.alsoAccept), [w]);
  const [input, setInput] = useState('');
  const [hints, setHints] = useState(0);
  const [phase, setPhase] = useState<'solving' | 'revealed'>('solving');
  const [outcome, setOutcome] = useState<Turn | null>(null);
  const [feedback, setFeedback] = useState('');
  const [flash, trigger] = useFlash<'good' | 'bad'>();
  const advance = useRef<(() => void) | null>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const prefix = hintPrefix(w.word, hints);

  const end = (result: 'correct' | 'missed', ms: number) => {
    if (phase !== 'solving') return;
    const base = 100 + (timed ? speedBonus(ms, 100, 3000, 25_000) : 50);
    const points = result === 'correct' ? Math.round(base * hintFactor(hints) * DIFFICULTY_FACTOR[w.difficulty]) : 0;
    const t: Turn = { w, result, points, hints, ms };
    setOutcome(t);
    setPhase('revealed');
    advance.current = onDone(t);
    if (result === 'correct') {
      sfx.correct();
      trigger('good');
      announce(`Correct, ${w.word}. ${points} points. ${w.definition}`);
    } else {
      sfx.wrong();
      announce(`The word was ${w.word}. ${w.definition}`);
    }
    setTimeout(() => nextBtn.current?.focus(), 30);
  };

  const clock = useCountdown(timed ? WORD_TIME_MS : null, paused || phase !== 'solving', () => end('missed', WORD_TIME_MS));

  // Tap-to-type: track which scrambled tiles are used by the current input.
  const usedMask = useMemo(() => {
    const mask = new Array(letters.length).fill(false);
    for (const ch of input.toLowerCase()) {
      const i = letters.split('').findIndex((c, j) => c === ch && !mask[j]);
      if (i >= 0) mask[i] = true;
    }
    return mask;
  }, [input, letters]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'solving' || paused) return;
    if (isCorrect(input, w)) return end('correct', clock.now());
    const n = input.trim().toLowerCase();
    if (n.length && n.length !== w.word.length) setFeedback(`Use all ${w.word.length} letters.`);
    else setFeedback('Not quite. Keep shuffling.');
    trigger('bad');
    sfx.wrong();
  };

  const hint = () => {
    if (hints >= maxHints(w.word) || phase !== 'solving') return;
    const h = hints + 1;
    setHints(h);
    setInput(w.word.slice(0, h));
    announce(`Starts with ${w.word.slice(0, h).split('').join(' ')}`);
  };

  if (phase === 'revealed' && outcome) {
    return (
      <>
        <div className={`reveal ${outcome.result === 'correct' ? 'lift' : ''}`}>
          <p className={`feedback ${outcome.result === 'correct' ? 'good' : 'bad'}`}>
            {outcome.result === 'correct' ? `Solved: +${outcome.points}${outcome.hints ? ` (${outcome.hints} hint${outcome.hints > 1 ? 's' : ''})` : ''}` : 'The word was'}
          </p>
          <div className="scramble-tiles" aria-hidden="true" style={{ '--n': w.word.length } as React.CSSProperties}>
            {w.word.split('').map((c, i) => (
              <span key={i} className="tile t-accent">{c}</span>
            ))}
          </div>
          <h2 className="sr-only">{w.word}</h2>
          <p className="def">{w.definition}</p>
          <p className="ex">{w.example}</p>
          {w.note && <p className="note">{w.note}</p>}
          {w.alsoAccept?.length ? <p className="note">Same letters: {w.alsoAccept.join(', ')}.</p> : null}
        </div>
        <div className="row end">
          <button ref={nextBtn} className="btn btn-primary" onClick={() => advance.current?.()} autoFocus>
            {last ? 'See results' : 'Next word'}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <TimerBar remaining={clock.remaining} total={timed ? WORD_TIME_MS : null} label="This word" />
      <div className="scramble-tiles" style={{ '--n': w.word.length } as React.CSSProperties} role="group" aria-label={`Scrambled letters: ${letters.split('').join(' ')}`}>
        {letters.split('').map((c, i) => (
          <button
            key={i}
            type="button"
            className={`tile ${usedMask[i] ? 'used' : ''}`}
            aria-label={`Letter ${c}`}
            tabIndex={-1}
            onClick={() => !usedMask[i] && setInput((v) => v + c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="slots" aria-hidden="true" style={{ '--n': w.word.length } as React.CSSProperties}>
        {w.word.split('').map((_, i) => {
          const ch = input[i];
          return (
            <span key={i} className={`tile ${ch ? (i < prefix.length ? 'hinted' : '') : 't-ghost'}`}>
              {ch ?? '·'}
            </span>
          );
        })}
      </div>
      <form onSubmit={submit} className={flash === 'bad' ? 'shake' : ''}>
        <label htmlFor="ws-input" className="sr-only">Unscrambled word</label>
        <div className="answer-row">
          <input
            id="ws-input"
            className={`answer ${flash === 'bad' ? 'is-bad' : ''}`}
            value={input}
            onChange={(e) => {
              const v = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, w.word.length);
              setInput(v.startsWith(prefix) ? v : prefix + v.slice(prefix.length));
              setFeedback('');
            }}
            placeholder={`${w.word.length} letters`}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            autoFocus
            disabled={paused}
          />
          <button className="btn btn-primary" type="submit" disabled={input.length !== w.word.length}>Solve</button>
        </div>
      </form>
      <p className="feedback bad">{feedback}</p>
      <div className="row">
        <button type="button" className="btn btn-ghost btn-sm" onClick={hint} disabled={hints >= maxHints(w.word)}>
          Hint ({maxHints(w.word) - hints} left, −25%)
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInput(prefix)} disabled={input.length <= prefix.length}>
          Clear
        </button>
        <span className="spacer" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => end('missed', clock.now())}>Reveal</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onQuit}>Finish</button>
      </div>
    </>
  );
}

import React, { useRef, useState } from 'react';
import type { PlayProps, Learning } from '../../engine/types';
import { useCountdown, useFlash, announce, useLatest } from '../../engine/hooks';
import { sfx } from '../../engine/sound';
import { TimerBar, Icon } from '../../ui/components';
import { chooseRound, judgeAnswer, pointsFor, missedFor, type CategoryIndex, type Answer } from './logic';

const DURATION: Record<string, number | null> = { s30: 30_000, s60: 60_000, s90: 90_000, relaxed: null };

interface Board {
  letter: string;
  cats: CategoryIndex[];
  found: Answer[];
}

export default function AlphabetSprint({ config, paused, onFinish, onScore }: PlayProps) {
  const total = config.mode in DURATION ? DURATION[config.mode] : 60_000;
  const [boards, setBoards] = useState<Board[]>(() => {
    const r = chooseRound(3);
    return [{ letter: r.letter, cats: r.categories, found: [] }];
  });
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; tone: string }>({ text: '', tone: '' });
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [flash, trigger] = useFlash<'good' | 'bad'>();
  const done = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useLatest({ boards, score, misses });

  const board = boards[boards.length - 1];
  const already = new Set(board.found.map((a) => `${a.categoryId}:${a.canonical}`));

  const finish = () => {
    if (done.current) return;
    done.current = true;
    const { boards, score, misses } = latest.current;
    const found = boards.flatMap((b) => b.found);
    const deep = found.filter((a) => !a.common).length;
    const learnings: Learning[] = [];
    for (const b of boards) {
      const got = new Set(b.found.map((a) => `${a.categoryId}:${a.canonical}`));
      for (const c of b.cats) {
        const mine = b.found.filter((a) => a.categoryId === c.cat.id).map((a) => a.canonical);
        const missed = missedFor(c, b.letter, got, 8);
        learnings.push({
          id: `${b.letter}-${c.cat.id}`,
          title: `${c.cat.title} starting with ${b.letter.toUpperCase()}`,
          body: mine.length ? `You found: ${mine.join(', ')}.` : 'None this time.',
          extra: missed.length ? `Also on our list: ${missed.map((a) => a.canonical).join(', ')}.` : undefined,
          outcome: mine.length ? 'correct' : 'info',
        });
      }
    }
    sfx.complete();
    onFinish({
      score,
      correct: found.length,
      attempted: found.length + misses,
      durationMs: clock.now(),
      headline: `${found.length} answer${found.length === 1 ? '' : 's'}${deep ? `, ${deep} deep cut${deep === 1 ? '' : 's'}` : ''}`,
      stats: [
        { label: 'Answers', value: String(found.length) },
        { label: 'Deep cuts', value: String(deep) },
        { label: 'Letters', value: boards.map((b) => b.letter.toUpperCase()).join(' ') },
      ],
      numbers: { answers: found.length, deepCuts: deep },
      learnings,
      learningsTitle: 'What else was out there',
      reviewUpdates: [],
      seenIds: boards.map((b) => b.letter),
    });
  };
  const clock = useCountdown(total, paused, finish);

  const [suggestion, setSuggestion] = useState<Answer | null>(null);

  const accept = (answer: Answer, fuzzy: boolean) => {
    {
      const v = { answer, fuzzy };
      const pts = pointsFor(v.answer);
      const ns = score + pts;
      setScore(ns);
      onScore(ns);
      setBoards((bs) => [...bs.slice(0, -1), { ...board, found: [...board.found, v.answer] }]);
      const cat = board.cats.find((c) => c.cat.id === v.answer.categoryId)!;
      const msg = `${v.fuzzy ? `Counted as ${v.answer.canonical}. ` : ''}${cat.cat.title}${v.answer.common ? '' : ', deep cut'}: +${pts}`;
      setFeedback({ text: msg, tone: 'good' });
      announce(`${v.answer.canonical} accepted. ${msg}`);
      setInput('');
      setSuggestion(null);
      trigger('good');
      sfx.correct();
      inputRef.current?.focus();
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paused || done.current || !input.trim()) return;
    const v = judgeAnswer(input, board.letter, board.cats, already);
    if (v.ok) return accept(v.answer, v.fuzzy);
    setSuggestion(v.suggestion ?? null);
    if (!v.suggestion) setMisses((m) => m + 1);
    setFeedback({ text: v.message, tone: v.suggestion ? 'warn' : 'bad' });
    announce(v.message);
    trigger('bad');
    sfx.wrong();
  };

  const newLetter = () => {
    const r = chooseRound(3, Math.random, board.letter);
    setBoards((bs) => [...bs, { letter: r.letter, cats: r.categories, found: [] }]);
    setFeedback({ text: `New letter: ${r.letter.toUpperCase()}`, tone: '' });
    announce(`New letter ${r.letter.toUpperCase()}. Categories: ${r.categories.map((c) => c.cat.title).join(', ')}`);
    inputRef.current?.focus();
  };

  return (
    <>
      <TimerBar remaining={clock.remaining} total={total} label="Time left" />
      <div className="letter-hero">
        <span key={board.letter} className="tile t-accent lift" aria-label={`Letter ${board.letter.toUpperCase()}`}>
          {board.letter.toUpperCase()}
        </span>
        <p className="dim">
          Name {board.cats.map((c, i) => (
            <React.Fragment key={c.cat.id}>
              {i > 0 && (i === board.cats.length - 1 ? ', or ' : ', ')}
              <b>{c.cat.prompt}</b>
            </React.Fragment>
          ))}{' '}
          beginning with <b>{board.letter.toUpperCase()}</b>. As many as you can.
        </p>
      </div>
      <form onSubmit={submit} className={flash === 'bad' ? 'shake' : ''}>
        <label htmlFor="as-input" className="sr-only">Your answer</label>
        <div className="answer-row">
          <input
            id="as-input"
            ref={inputRef}
            className={`answer ${flash === 'good' ? 'is-good' : flash === 'bad' ? 'is-bad' : ''}`}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSuggestion(null);
            }}
            placeholder={`Something starting with ${board.letter.toUpperCase()}`}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            autoFocus
            disabled={paused}
          />
          <button className="btn btn-primary" type="submit" disabled={!input.trim()}>Add</button>
        </div>
      </form>
      <p className={`feedback ${feedback.tone}`}>{feedback.text}</p>
      {suggestion && (
        <div className="row">
          <button type="button" className="btn btn-tile btn-sm" onClick={() => accept(suggestion, true)}>
            Yes, {suggestion.canonical}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSuggestion(null); setInput(''); inputRef.current?.focus(); }}>
            No, clear it
          </button>
        </div>
      )}
      <div className="cats">
        {board.cats.map((c) => {
          const mine = board.found.filter((a) => a.categoryId === c.cat.id);
          return (
            <section key={c.cat.id} className="cat-col" aria-label={c.cat.title}>
              <h3>
                <span>{c.cat.title}</span>
                <span className="tnum">{mine.length}</span>
              </h3>
              <ul>
                {mine.map((a) => (
                  <li key={a.canonical} className={a.common ? '' : 'deep'} title={a.common ? undefined : 'Deep cut: +50'}>
                    {a.canonical}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <div className="row">
        <button className="btn btn-ghost btn-sm" type="button" onClick={newLetter}>
          <Icon name="shuffle" size={16} /> New letter
        </button>
        <span className="spacer" />
        <button className="btn btn-ghost btn-sm" type="button" onClick={finish}>Finish round</button>
      </div>
    </>
  );
}

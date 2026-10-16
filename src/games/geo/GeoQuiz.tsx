import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { PlayProps, Learning } from '../../engine/types';
import type { Country } from '../../content/types';
import type { ReviewUpdate } from '../../engine/review';
import { useCountdown, useFlash, announce, useLatest } from '../../engine/hooks';
import { speedBonus, streakMultiplier } from '../../engine/scoring';
import { pickFresh, shuffle } from '../../engine/random';
import { sfx } from '../../engine/sound';
import { TimerBar } from '../../ui/components';
import {
  BY_CODE, QUESTIONS_PER_ROUND, poolFor, distractors, flagUrl, matchCountry, judgeCapital, fullCapitals, capitalFact, geoLine,
} from './logic';

type Kind = 'flag' | 'capital';
type Outcome = 'correct' | 'partial' | 'wrong';

interface Answered {
  c: Country;
  outcome: Outcome;
  points: number;
  given: string;
  ms: number;
}

const TIME: Record<string, number | null> = { pick: 15_000, recall: 20_000, relaxed: null };

export function makeGeoGame(kind: Kind) {
  const gameId = kind === 'flag' ? 'flag-finder' : 'capital-quest';

  return function GeoQuiz({ config, store, paused, onFinish, onScore }: PlayProps) {
    const questions = useMemo(() => {
      const pool = poolFor(config.difficulty);
      const review = config.review
        .filter((r) => r.key.startsWith(`${kind}:`))
        .map((r) => BY_CODE.get(r.key.split(':')[1]))
        .filter((c): c is Country => !!c);
      return pickFresh(pool, QUESTIONS_PER_ROUND, (c) => c.code, store.recentSet(gameId), {
        priority: review,
        maxPriority: config.reviewFocus ? QUESTIONS_PER_ROUND : 3,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [i, setI] = useState(0);
    const [answers, setAnswers] = useState<Answered[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const latest = useLatest({ answers, score });
    const done = useRef(false);

    const finish = (all: Answered[], finalScore: number) => {
      if (done.current) return;
      done.current = true;
      const correct = all.filter((a) => a.outcome === 'correct').length;
      const breakdown: Record<string, [number, number]> = {};
      for (const a of all) {
        const b = breakdown[a.c.region] ?? [0, 0];
        breakdown[a.c.region] = [b[0] + (a.outcome === 'correct' ? 1 : 0), b[1] + 1];
      }
      const learnings: Learning[] = all.map((a) => {
        const caps = fullCapitals(a.c).map((x) => (x.role ? `${x.name} (${x.role})` : x.name)).join(', ');
        return {
          id: a.c.code,
          title: kind === 'flag' ? a.c.name : `${a.c.name}: ${caps}`,
          body: kind === 'flag' ? a.c.flagFact ?? geoLine(a.c) : capitalFact(a.c) ?? a.c.capitalNote ?? geoLine(a.c),
          extra:
            (a.outcome !== 'correct' && a.given ? `You said ${a.given}. ` : '') +
            (kind === 'flag' ? `Capital: ${caps}. ${a.c.subregion}.` : a.c.capitalNote && capitalFact(a.c) ? a.c.capitalNote : a.c.subregion),
          outcome: a.outcome,
          image: kind === 'flag' ? flagUrl(a.c.code) : undefined,
        };
      });
      const reviewUpdates: ReviewUpdate[] = all.map((a) => ({
        key: `${kind}:${a.c.code}`,
        gameId,
        label: kind === 'flag' ? `Flag of ${a.c.name}` : `Capital of ${a.c.name}`,
        result: a.outcome,
      }));
      sfx.complete();
      onFinish({
        score: finalScore,
        correct,
        attempted: all.length,
        durationMs: all.reduce((s, a) => s + a.ms, 0),
        headline: `${correct} of ${all.length} correct`,
        stats: [
          { label: 'Correct', value: `${correct}/${all.length}` },
          { label: 'Partial', value: String(all.filter((a) => a.outcome === 'partial').length) },
          { label: 'Regions', value: String(Object.keys(breakdown).length) },
        ],
        numbers: { correct },
        breakdown,
        learnings,
        learningsTitle: kind === 'flag' ? 'The flags' : 'The capitals',
        reviewUpdates,
        seenIds: all.map((a) => a.c.code),
      });
    };

    const c = questions[i];
    if (!c) return null;
    return (
      <>
        <div className="row">
          <div className="progress-dots" aria-label={`Question ${i + 1} of ${questions.length}`}>
            {questions.map((_, k) => (
              <span key={k} className={k < answers.length ? (answers[k].outcome === 'wrong' ? 'bad' : 'good') : k === i ? 'now' : ''} />
            ))}
          </div>
          <span className="spacer" />
          {streak >= 3 && <span className="mult">Streak ×{streakMultiplier(streak)}</span>}
        </div>
        <Question
          key={c.code}
          kind={kind}
          c={c}
          mode={config.mode}
          difficulty={config.difficulty}
          paused={paused}
          last={i + 1 >= questions.length}
          streak={streak}
          onAnswer={(a) => {
            const all = [...answers, a];
            const ns = score + a.points;
            setAnswers(all);
            setScore(ns);
            onScore(ns);
            setStreak(a.outcome === 'correct' ? streak + 1 : 0);
          }}
          onNext={() => {
            const all = latest.current.answers;
            if (all.length >= questions.length) finish(all, latest.current.score);
            else setI(i + 1);
          }}
          onQuit={() => finish(latest.current.answers, latest.current.score)}
        />
      </>
    );
  };
}

function Question({ kind, c, mode, difficulty, paused, last, streak, onAnswer, onNext, onQuit }: {
  kind: Kind;
  c: Country;
  mode: string;
  difficulty: number;
  paused: boolean;
  last: boolean;
  streak: number;
  onAnswer: (a: Answered) => void;
  onNext: () => void;
  onQuit: () => void;
}) {
  const total = mode in TIME ? TIME[mode] : 15_000;
  const [showChoices, setShowChoices] = useState(mode === 'pick');
  const [usedChoices, setUsedChoices] = useState(mode === 'pick');
  const [result, setResult] = useState<Answered | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');
  const [flash, trigger] = useFlash<'good' | 'bad'>();
  const nextRef = useRef<HTMLButtonElement>(null);

  const options = useMemo(() => shuffle([c, ...distractors(c, difficulty, kind)]), [c, difficulty, kind]);
  const label = (o: Country) => (kind === 'flag' ? o.name : fullCapitals(o)[0].name);

  const settle = (outcome: Outcome, given: string, ms: number, partialNote?: string) => {
    if (result) return;
    const timedBonus = total ? speedBonus(ms, 50, 2000, total * 0.8) : 0;
    let points = outcome === 'correct' ? Math.round((100 + timedBonus) * streakMultiplier(outcome === 'correct' ? streak + 1 : 0)) : outcome === 'partial' ? 50 : 0;
    if (usedChoices && mode !== 'pick') points = Math.round(points / 2);
    const a: Answered = { c, outcome, points, given, ms };
    setResult(a);
    onAnswer(a);
    if (outcome === 'correct') {
      sfx.correct();
      trigger('good');
    } else sfx.wrong();
    const answerText = kind === 'flag' ? c.name : fullCapitals(c).map((x) => x.name).join(' or ');
    setMsg(partialNote ?? '');
    announce(`${outcome === 'correct' ? 'Correct' : outcome === 'partial' ? 'Partly right' : 'Not quite'}. ${answerText}.`);
    setTimeout(() => nextRef.current?.focus(), 30);
  };

  const clock = useCountdown(total, paused || !!result, () => settle('wrong', '', total ?? 0));

  const choose = (o: Country) => {
    if (result || paused) return;
    setPicked(o.code);
    settle(o.code === c.code ? 'correct' : 'wrong', label(o), clock.now());
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (result || paused || !input.trim()) return;
    if (kind === 'flag') {
      const m = matchCountry(input);
      if (m?.code === c.code) return settle('correct', input, clock.now());
      return settle('wrong', m ? m.name : input.trim(), clock.now());
    }
    const v = judgeCapital(input, c);
    if (v.result === 'correct') return settle('correct', input, clock.now());
    if (v.result === 'partial') return settle('partial', v.capital.name, clock.now(), `${v.capital.name} is ${v.capital.role ?? 'related'}, so half points.`);
    return settle('wrong', input.trim(), clock.now());
  };

  useEffect(() => {
    if (!showChoices || result) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) choose(options[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const caps = fullCapitals(c);
  return (
    <>
      <TimerBar remaining={clock.remaining} total={total} label={result ? 'Answered' : 'Time'} />
      {kind === 'flag' ? (
        <div className="flag-frame">
          <img src={flagUrl(c.code)} alt="Flag to identify" width={420} height={315} />
        </div>
      ) : (
        <div className="country-hero">
          <span className="prompt-label">What is the capital of…</span>
          <div className="big-word">{c.name}</div>
          <span className="meta">{c.subregion}</span>
        </div>
      )}

      {!result && !showChoices && (
        <form onSubmit={submit} className={flash === 'bad' ? 'shake' : ''}>
          <label htmlFor="geo-input" className="sr-only">{kind === 'flag' ? 'Country name' : 'Capital city'}</label>
          <div className="answer-row">
            <input
              id="geo-input"
              className="answer"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={kind === 'flag' ? 'Which country?' : 'Capital city'}
              autoComplete="off"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              autoFocus
              disabled={paused}
            />
            <button className="btn btn-primary" type="submit" disabled={!input.trim()}>Answer</button>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowChoices(true); setUsedChoices(true); }}>
              Show choices (half points)
            </button>
            <span className="spacer" />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => settle('wrong', '', clock.now())}>Reveal</button>
          </div>
        </form>
      )}

      {(showChoices || (result && picked)) && (
        <div className="options" role="group" aria-label="Choices">
          {options.map((o, k) => {
            const isRight = !!result && o.code === c.code;
            const isWrong = !!result && picked === o.code && o.code !== c.code;
            return (
              <button key={o.code} className={`option ${isRight ? 'is-right' : ''} ${isWrong ? 'is-wrong' : ''}`} onClick={() => choose(o)} disabled={!!result}>
                <kbd aria-hidden="true">{k + 1}</kbd>
                <span>{label(o)}</span>
              </button>
            );
          })}
        </div>
      )}

      {result && (
        <div className="factbox lift" aria-live="off">
          <p className={`t ${result.outcome === 'correct' ? 'good' : result.outcome === 'partial' ? 'partial' : 'bad'}`}>
            {result.outcome === 'correct' ? `Correct: +${result.points}` : result.outcome === 'partial' ? `Partly right: +${result.points}` : result.given ? `Not ${result.given}` : 'Out of time'}
          </p>
          {msg && <p className="dim">{msg}</p>}
          {kind === 'flag' ? (
            <p>
              <b>{c.name}</b>. Capital: {caps.map((x) => x.name).join(', ')}. {c.subregion}.
            </p>
          ) : (
            <p>
              The capital of <b>{c.name}</b> is {caps.map((x, k) => (
                <React.Fragment key={x.name}>
                  {k > 0 && (k === caps.length - 1 ? ' and ' : ', ')}
                  <b>{x.name}</b>{x.role && caps.length > 1 ? ` (${x.role})` : ''}
                </React.Fragment>
              ))}
              .
            </p>
          )}
          <p className="dim">{kind === 'flag' ? c.flagFact ?? geoLine(c) : capitalFact(c) ?? geoLine(c)}</p>
          {kind === 'capital' && c.capitalNote && capitalFact(c) && <p className="muted small">{c.capitalNote}</p>}
          {c.statusNote && <p className="muted small">{c.statusNote}</p>}
        </div>
      )}

      <div className="row">
        {result ? (
          <button ref={nextRef} className="btn btn-primary" onClick={onNext}>
            {last ? 'See results' : 'Next'}
          </button>
        ) : null}
        <span className="spacer" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onQuit}>Finish</button>
      </div>
    </>
  );
}

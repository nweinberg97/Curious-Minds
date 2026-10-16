import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { PlayProps, Learning } from '../../engine/types';
import type { VocabWord } from '../../content/types';
import type { ReviewUpdate } from '../../engine/review';
import { announce, useLatest } from '../../engine/hooks';
import { pickFresh } from '../../engine/random';
import { sfx } from '../../engine/sound';
import { VOCAB, VOCAB_COLLECTIONS } from '../../content/vocab';
import { keywordEvaluator, VERDICT_POINTS, type EvaluationResult, type Verdict } from './evaluate';
import { normalize } from '../../engine/normalize';

export const WORDS_PER_ROUND = 6;
const BY_ID = new Map(VOCAB.map((v) => [v.id, v]));

export function defineOptions() {
  return [{ id: 'all', label: 'All collections' }, ...VOCAB_COLLECTIONS.map((c) => ({ id: c.id, label: c.title }))];
}

interface Turn {
  w: VocabWord;
  verdict: Verdict;
  definition: string;
  sentence: string;
  bookmarked: boolean;
}

export default function DefineIt({ config, store, onFinish, onScore }: PlayProps) {
  const quick = config.mode === 'quick';
  const words = useMemo(() => {
    const coll = config.option && config.option !== 'all' ? config.option : null;
    const range = config.difficulty === 2 ? [1, 2] : config.difficulty === 3 ? [3, 4] : [1, 4];
    let pool = VOCAB.filter((v) => (!coll || v.collection === coll) && v.difficulty >= range[0] && v.difficulty <= range[1]);
    if (pool.length < WORDS_PER_ROUND) pool = VOCAB.filter((v) => !coll || v.collection === coll);
    const review = config.review
      .filter((r) => r.key.startsWith('vocab:'))
      .map((r) => BY_ID.get(r.key.slice(6)))
      .filter((v): v is VocabWord => !!v);
    return pickFresh(pool, WORDS_PER_ROUND, (v) => v.id, store.recentSet('define-it'), {
      priority: review,
      maxPriority: config.reviewFocus ? WORDS_PER_ROUND : 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [i, setI] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [score, setScore] = useState(0);
  const latest = useLatest({ turns, score });
  const startedAt = useRef(Date.now());

  const finish = (all: Turn[], finalScore: number) => {
    const nailed = all.filter((t) => t.verdict === 'nailed').length;
    const learnings: Learning[] = all.map((t) => ({
      id: t.w.id,
      title: `${t.w.word} (${t.w.partOfSpeech})`,
      body: t.w.definition,
      extra: [t.w.example, t.w.nuance].filter(Boolean).join(' '),
      outcome: t.verdict === 'nailed' ? 'correct' : t.verdict === 'partly' ? 'partial' : 'wrong',
      bookmark: { key: `vocab:${t.w.id}`, label: t.w.word },
    }));
    const reviewUpdates: ReviewUpdate[] = all.map((t) => ({
      key: `vocab:${t.w.id}`,
      gameId: 'define-it',
      label: t.w.word,
      result: t.verdict === 'nailed' ? 'correct' : t.verdict === 'partly' ? 'partial' : 'wrong',
      bookmark: t.bookmarked || undefined,
    }));
    sfx.complete();
    onFinish({
      score: finalScore,
      correct: nailed,
      attempted: all.length,
      durationMs: Date.now() - startedAt.current,
      headline: `${nailed} nailed, ${all.filter((t) => t.verdict === 'partly').length} partly`,
      stats: [
        { label: 'Nailed', value: String(nailed) },
        { label: 'Words', value: String(all.length) },
        { label: 'Sentences written', value: String(all.filter((t) => t.sentence.trim()).length) },
      ],
      numbers: { nailed },
      learnings,
      learningsTitle: 'Your words',
      reviewUpdates,
      seenIds: all.map((t) => t.w.id),
    });
  };

  const w = words[i];
  if (!w) return null;
  return (
    <>
      <div className="row">
        <div className="progress-dots" aria-label={`Word ${i + 1} of ${words.length}`}>
          {words.map((_, k) => (
            <span key={k} className={k < turns.length ? (turns[k].verdict === 'missed' ? 'bad' : 'good') : k === i ? 'now' : ''} />
          ))}
        </div>
        <span className="spacer" />
        <span className="muted small">{VOCAB_COLLECTIONS.find((c) => c.id === w.collection)?.title}</span>
      </div>
      <WordTurn
        key={w.id}
        w={w}
        quick={quick}
        last={i + 1 >= words.length}
        onDone={(t) => {
          const all = [...turns, t];
          const ns = score + VERDICT_POINTS[t.verdict];
          setTurns(all);
          setScore(ns);
          onScore(ns);
          if (all.length >= words.length) finish(all, ns);
          else setI(i + 1);
        }}
        onQuit={() => finish(latest.current.turns, latest.current.score)}
      />
    </>
  );
}

function WordTurn({ w, quick, last, onDone, onQuit }: { w: VocabWord; quick: boolean; last: boolean; onDone: (t: Turn) => void; onQuit: () => void }) {
  const [definition, setDefinition] = useState('');
  const [sentence, setSentence] = useState('');
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const verdictRef = useRef<HTMLDivElement>(null);

  const reveal = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const r = await keywordEvaluator.evaluate({ word: w, definition, sentence });
    setEvalResult(r);
    setRevealed(true);
    announce(`${w.word}: ${w.definition}`);
    sfx.tap();
  };

  useEffect(() => {
    if (revealed) verdictRef.current?.querySelector('button')?.focus();
  }, [revealed]);

  useEffect(() => {
    if (!revealed) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.key === '1') choose('nailed');
      if (e.key === '2') choose('partly');
      if (e.key === '3') choose('missed');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const choose = (verdict: Verdict) => {
    if (verdict === 'nailed') sfx.correct();
    onDone({ w, verdict, definition, sentence, bookmarked });
  };

  const matchedSet = new Set(evalResult?.matched ?? []);
  const ideas = useMemo(() => w.synonyms.map((s) => normalize(s)), [w]);

  return (
    <>
      <div className="entry">
        <div className="big-word" lang="en">{w.word}</div>
        <span className="pos">{w.partOfSpeech}</span>
      </div>

      {!revealed && (
        <form onSubmit={reveal} className="settings-grid" onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) reveal(e); }}>
          {!quick && (
            <>
              <div>
                <label className="field-label" htmlFor="di-def">What does it mean? In your own words.</label>
                <textarea id="di-def" className="answer" value={definition} onChange={(e) => setDefinition(e.target.value)} autoFocus placeholder="It means…" />
              </div>
              <div>
                <label className="field-label" htmlFor="di-sen">Use it in a sentence.</label>
                <textarea id="di-sen" className="answer" value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder={`A sentence with “${w.word}”`} />
              </div>
            </>
          )}
          {quick && <p className="dim">Say what it means out loud or in your head, then reveal and be honest with yourself.</p>}
          <div className="row">
            <button className="btn btn-primary" type="submit" autoFocus={quick}>
              {quick ? 'Reveal' : 'Compare'}
            </button>
            {!quick && <span className="muted small">Ctrl/⌘ + Enter</span>}
            <span className="spacer" />
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => reveal()}>
              I don't know it
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onQuit}>Finish</button>
          </div>
        </form>
      )}

      {revealed && (
        <>
          <div className="reveal lift">
            <p className="def">{w.definition}</p>
            <p className="ex">{w.example}</p>
            {w.synonyms.length > 0 && (
              <div className="pills" aria-label="Synonyms">
                <span className="muted small">Similar:</span>
                {w.synonyms.map((s) => (
                  <span key={s} className={`pill ${matchedSet.has(normalize(s)) ? 'hit' : ''}`}>{s}</span>
                ))}
              </div>
            )}
            {w.antonyms.length > 0 && (
              <div className="pills" aria-label="Opposites">
                <span className="muted small">Opposite:</span>
                {w.antonyms.map((s) => <span key={s} className="pill">{s}</span>)}
              </div>
            )}
            {w.nuance && <p className="note-box">{w.nuance}</p>}
          </div>

          {!quick && evalResult && (
            <div className="compare">
              <div>
                <h3>Your definition</h3>
                <p className="yours">{definition.trim() || <span className="muted">Nothing written</span>}</p>
                <h3>Your sentence</h3>
                <p className="yours">{sentence.trim() || <span className="muted">Nothing written</span>}</p>
              </div>
              <div>
                <h3>Keyword check</h3>
                <p>{evalResult.summary}</p>
                {evalResult.matched.length > 0 && (
                  <div className="pills">
                    {evalResult.matched.map((m) => <span key={m} className="pill hit">{m}</span>)}
                  </div>
                )}
                <p className={evalResult.usedWord ? 'feedback good' : 'feedback warn'}>
                  {sentence.trim() ? (evalResult.usedWord ? `Your sentence uses “${w.word}”.` : `Your sentence doesn't include “${w.word}” or a form of it.`) : 'No sentence written.'}
                </p>
                <p className="muted small">
                  This compares words, not meaning, so it can miss a correct answer phrased differently{ideas.length ? '' : ''}. You decide below.
                </p>
              </div>
            </div>
          )}

          <div>
            <span className="field-label" id="verdict-label">How did you do?</span>
            <div className="verdicts" role="group" aria-labelledby="verdict-label" ref={verdictRef}>
              <button className="btn btn-primary" onClick={() => choose('nailed')}>Nailed it <small className="muted">1</small></button>
              <button className="btn btn-tile" onClick={() => choose('partly')}>Partly <small>2</small></button>
              <button className="btn btn-ghost" onClick={() => choose('missed')}>Missed it <small className="muted">3</small></button>
            </div>
          </div>
          <div className="row">
            <button type="button" className="revisit" aria-pressed={bookmarked} onClick={() => setBookmarked((b) => !b)}>
              {bookmarked ? 'Saved to revisit' : 'Revisit this word later'}
            </button>
            <span className="spacer" />
            <span className="muted small">{last ? 'Last word' : ''}</span>
          </div>
        </>
      )}
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A pausable clock. Returns elapsed ms since start (excluding paused time).
 * `durationMs` null = count up forever (untimed). `onExpire` fires once when time runs out.
 */
export function useCountdown(durationMs: number | null, paused: boolean, onExpire?: () => void, running = true) {
  const [elapsed, setElapsed] = useState(0);
  const acc = useRef(0);
  const last = useRef<number | null>(null);
  const fired = useRef(false);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (paused || !running) {
      last.current = null;
      return;
    }
    last.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      if (last.current !== null) acc.current += now - last.current;
      last.current = now;
      setElapsed(acc.current);
      if (durationMs !== null && acc.current >= durationMs && !fired.current) {
        fired.current = true;
        expireRef.current?.();
      }
    }, 100);
    return () => {
      const now = performance.now();
      if (last.current !== null) acc.current += now - last.current;
      last.current = null;
      clearInterval(id);
    };
  }, [paused, running, durationMs]);

  /** Read precise elapsed time right now (for scoring an answer). */
  const now = useCallback(() => acc.current + (last.current !== null ? performance.now() - last.current : 0), []);
  const reset = useCallback(() => {
    acc.current = 0;
    last.current = performance.now();
    fired.current = false;
    setElapsed(0);
  }, []);

  const remaining = durationMs === null ? null : Math.max(0, durationMs - elapsed);
  return { elapsed, remaining, now, reset };
}

/** Screen-reader announcements through a single polite live region (see LiveRegion in ui). */
let announceFn: (msg: string) => void = () => {};
export function setAnnouncer(fn: (msg: string) => void) {
  announceFn = fn;
}
export function announce(msg: string) {
  announceFn(msg);
}

/** Temporary visual state (e.g. 'correct' | 'wrong') that clears itself. */
export function useFlash<T extends string>(ms = 450) {
  const [flash, setFlash] = useState<T | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const trigger = useCallback(
    (v: T) => {
      clearTimeout(t.current);
      setFlash(null);
      requestAnimationFrame(() => setFlash(v));
      t.current = setTimeout(() => setFlash(null), ms);
    },
    [ms],
  );
  useEffect(() => () => clearTimeout(t.current), []);
  return [flash, trigger] as const;
}

/** Run once on mount with the latest values, avoiding stale closures in keyboard handlers. */
export function useLatest<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}

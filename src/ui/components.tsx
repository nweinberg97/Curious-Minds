import React, { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { setAnnouncer } from '../engine/hooks';
import type { PlayerStore } from '../storage/store';

/* ---------------- store context ---------------- */
export const StoreCtx = createContext<PlayerStore | null>(null);

/** Read the player store and re-render when it changes. */
export function useStore(): PlayerStore {
  const s = useContext(StoreCtx);
  if (!s) throw new Error('StoreCtx missing');
  useSyncExternalStore(s.subscribe, s.getVersion);
  return s;
}

/* ---------------- navigation ---------------- */
export function go(route: string) {
  const target = route ? `#${route}` : '#';
  if (location.hash === target || (!route && !location.hash)) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = route;
  }
}

/* ---------------- live region ---------------- */
export function LiveRegion() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    setAnnouncer((m) => {
      setMsg('');
      requestAnimationFrame(() => setMsg(m));
    });
  }, []);
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {msg}
    </div>
  );
}

/* ---------------- toast ---------------- */
let toastFn: (m: string) => void = () => {};
export function toast(m: string) {
  toastFn(m);
}
export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    toastFn = (m) => {
      setMsg(m);
      clearTimeout(t.current);
      t.current = setTimeout(() => setMsg(null), 3200);
    };
  }, []);
  if (!msg) return null;
  return (
    <div className="toast" role="status">
      {msg}
    </div>
  );
}

/* ---------------- timer ---------------- */
export function TimerBar({ remaining, total, label = 'Time' }: { remaining: number | null; total: number | null; label?: string }) {
  if (remaining === null || total === null) {
    return (
      <div className="timer">
        <div className="timer-row">
          <span>{label}</span>
          <span className="t">Untimed</span>
        </div>
      </div>
    );
  }
  const secs = Math.ceil(remaining / 1000);
  const low = remaining <= Math.min(10_000, total * 0.2);
  return (
    <div className="timer">
      <div className="timer-row">
        <span>{label}</span>
        <span className={`t tnum ${low ? 'low' : ''}`} role="timer" aria-label={`${secs} seconds left`}>
          {secs}s
        </span>
      </div>
      <div className="timer-track" aria-hidden="true">
        <div className={`timer-fill ${low ? 'low' : ''}`} style={{ transform: `scaleX(${Math.max(0, remaining / total)})` }} />
      </div>
    </div>
  );
}

/* ---------------- segmented ---------------- */
export function Seg<T extends string | number>({
  options,
  value,
  onChange,
  label,
  hideLabel = false,
}: {
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  hideLabel?: boolean;
}) {
  return (
    <div role="group" aria-label={label}>
      {!hideLabel && <span className="field-label">{label}</span>}
      <div className="seg">
        {options.map((o) => (
          <button key={String(o.id)} type="button" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
            {o.label}
            {o.hint && <small>{o.hint}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" className="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

/* ---------------- icons (inline, stroke-based) ---------------- */
const paths: Record<string, React.ReactNode> = {
  back: <path d="M15 5l-7 7 7 7" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  sound: <path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />,
  mute: <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />,
  pause: <path d="M8 5v14M16 5v14" />,
  shuffle: <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />,
  replay: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
};
export function Icon({ name, size = 20 }: { name: keyof typeof paths | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ---------------- wordmark ---------------- */
const MARK_STYLE = [
  { c: '#fff4e0', r: '-6deg', y: '0px' },
  { c: '#ff5fa8', r: '4deg', y: '-2px' },
  { c: '#ffc93c', r: '-3deg', y: '1px' },
  { c: '#45d4f5', r: '5deg', y: '-1px' },
  { c: '#a8e063', r: '-4deg', y: '2px' },
  { c: '#ff8a3d', r: '3deg', y: '-2px' },
  { c: '#b98cff', r: '-5deg', y: '0px' },
];
export function Wordmark() {
  return (
    <a className="mark" href="#" aria-label="Curious Minds home" onClick={(e) => { e.preventDefault(); go(''); }}>
      <span className="mark-tiles" aria-hidden="true">
        {'curious'.split('').map((ch, i) => (
          <span key={i} style={{ ['--c' as string]: MARK_STYLE[i].c, ['--r' as string]: MARK_STYLE[i].r, ['--y' as string]: MARK_STYLE[i].y }}>{ch}</span>
        ))}
      </span>
      <span className="mark-word" aria-hidden="true">minds</span>
    </a>
  );
}

export function fmt(n: number): string {
  return Math.round(n).toLocaleString('en');
}

/** Number that counts up once on mount (respects reduced motion via CSS? JS: skip if reduced). */
export function CountUp({ value, ms = 900 }: { value: number; ms?: number }) {
  const reduced = typeof matchMedia !== 'undefined' && (document.documentElement.dataset.motion === 'reduced' ||
    (document.documentElement.dataset.motion !== 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const [v, setV] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) {
      setV(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms, reduced]);
  return <span className="tnum">{fmt(v)}</span>;
}

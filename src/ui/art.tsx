import React from 'react';

/** Small hand-drawn illustrations, one per game, built from the tile vocabulary. Decorative: aria-hidden. */

const T = ({ x, y, ch, fill = 'var(--tile)', edge = 'var(--tile-edge)', ink = 'var(--tile-ink)', r = 0, s = 30 }: {
  x: number; y: number; ch: string; fill?: string; edge?: string; ink?: string; r?: number; s?: number;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r} ${s / 2} ${s / 2})`}>
    <rect width={s} height={s * 1.1} rx={s * 0.16} fill={edge} />
    <rect width={s} height={s * 1.1 - 4} rx={s * 0.16} fill={fill} />
    <text x={s / 2} y={s * 0.72} textAnchor="middle" fontFamily="var(--sans)" fontWeight="800" fontSize={s * 0.55} fill={ink}>
      {ch}
    </text>
  </g>
);

const A = { fill: 'var(--accent)', edge: 'var(--accent-edge)' };

function WordRushArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <path d="M40 92 C 70 40, 110 120, 140 62 S 190 50, 196 40" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      <T x={22} y={78} ch="S" r={-6} s={28} />
      <T x={70} y={58} ch="E" r={4} s={28} />
      <T x={118} y={50} ch="A" r={-3} s={28} {...A} />
      <T x={170} y={22} ch="?" r={8} s={30} fill="transparent" edge="var(--line-strong)" ink="var(--bone)" />
    </svg>
  );
}

function AlphabetArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <circle cx="110" cy="70" r="52" fill="none" stroke="var(--line-strong)" strokeWidth="8" />
      <circle cx="110" cy="70" r="52" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray="230 400" transform="rotate(-90 110 70)" strokeLinecap="round" />
      <T x={86} y={42} ch="M" s={48} {...A} />
      <T x={22} y={24} ch="A" r={-12} s={22} />
      <T x={178} y={96} ch="Z" r={10} s={22} />
    </svg>
  );
}

function ScrambleArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <T x={28} y={70} ch="R" r={-14} s={30} />
      <T x={66} y={36} ch="W" r={10} s={30} />
      <T x={104} y={78} ch="O" r={-4} s={30} {...A} />
      <T x={142} y={34} ch="D" r={16} s={30} />
      <path d="M58 118 q 52 18 104 0" fill="none" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DefineArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <rect x="40" y="22" width="140" height="100" rx="8" fill="var(--slate-2)" />
      <text x="56" y="56" fontFamily="var(--display)" fontSize="24" fill="var(--bone)">laconic</text>
      <text x="56" y="76" fontFamily="var(--display)" fontStyle="italic" fontSize="13" fill="var(--accent)">adjective</text>
      <rect x="56" y="88" width="104" height="6" rx="3" fill="var(--line-strong)" />
      <rect x="56" y="102" width="72" height="6" rx="3" fill="var(--line-strong)" />
      <path d="M168 104 l 22 -40 l 8 4 l -22 40 z" fill="var(--accent)" />
      <path d="M168 104 l 8 4 l -9 6 z" fill="var(--bone)" />
    </svg>
  );
}

function FlagArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <g transform="rotate(-8 70 70)">
        <rect x="26" y="40" width="72" height="54" rx="4" fill="#0055a4" />
        <rect x="50" y="40" width="24" height="54" fill="#fff" />
        <rect x="74" y="40" width="24" height="54" fill="#ef4135" />
      </g>
      <g transform="rotate(6 150 70)">
        <rect x="112" y="34" width="80" height="60" rx="4" fill="#fff" />
        <circle cx="152" cy="64" r="16" fill="#bc002d" />
      </g>
      <rect x="84" y="104" width="52" height="10" rx="5" fill="var(--accent)" />
    </svg>
  );
}

function CapitalArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <path d="M30 104 C 60 70, 90 120, 120 88 S 170 60, 196 80" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
      <path d="M30 120 C 70 96, 110 130, 150 108 S 190 100, 200 104" fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d="M110 22 c -16 0 -26 12 -26 26 c 0 20 26 46 26 46 s 26 -26 26 -46 c 0 -14 -10 -26 -26 -26 z" fill="var(--accent)" />
      <path d="M110 36 l 4 9 l 10 1 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1 z" fill="var(--tile-ink)" />
    </svg>
  );
}

function WebArt() {
  const colors = ['#f4d35e', '#7fd1b9', '#8fb3ff', '#d6a2f5'];
  const cells = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const solved = r === 0;
      cells.push(
        <rect key={`${r}${c}`} x={46 + c * 33} y={12 + r * 30} width={29} height={26} rx={5}
          fill={solved ? colors[0] : (r * 4 + c) % 5 === 1 ? 'var(--accent)' : 'var(--tile)'} opacity={solved ? 1 : 0.92} />,
      );
    }
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      {cells}
      <path d="M74 56 L 140 86 L 107 116" fill="none" stroke="var(--tile-ink)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export const ART: Record<string, () => React.JSX.Element> = {
  'word-rush': WordRushArt,
  'alphabet-sprint': AlphabetArt,
  'word-scramble': ScrambleArt,
  'define-it': DefineArt,
  'flag-finder': FlagArt,
  'capital-quest': CapitalArt,
  'word-web': WebArt,
};

export function GameArt({ id }: { id: string }) {
  const C = ART[id];
  return C ? <C /> : null;
}

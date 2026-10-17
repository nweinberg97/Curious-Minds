/**
 * Sticker illustrations, one per game, plus small icons for the arcade buttons.
 * Drawn in the brand's sticker style: ink outlines, cream tiles, candy accents. Decorative: aria-hidden.
 * Flag art uses the same open-source flag-icons files the game uses.
 */
const INK = '#0b0620';
const CREAM = '#fff4e0';

function Tile({ x, y, ch, fill = CREAM, r = 0, s = 30 }: { x: number; y: number; ch: string; fill?: string; r?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r} ${s / 2} ${s / 2})`}>
      <rect y={4} width={s} height={s * 1.08} rx={s * 0.2} fill={INK} />
      <rect width={s} height={s * 1.08} rx={s * 0.2} fill={fill} stroke={INK} strokeWidth={3} />
      <text x={s / 2} y={s * 0.76} textAnchor="middle" fontFamily="var(--display)" fontSize={s * 0.62} fill={INK}>
        {ch}
      </text>
    </g>
  );
}

function Spark({ x, y, s = 1, c = CREAM }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z"
      fill={c}
      stroke={INK}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );
}

function WordRushArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <path d="M30 98 C 62 40, 100 120, 136 58 S 186 44, 196 34" fill="none" stroke={INK} strokeWidth="4" strokeDasharray="1 10" strokeLinecap="round" />
      <Tile x={14} y={78} ch="S" r={-8} />
      <Tile x={62} y={58} ch="E" r={6} fill="#ffc93c" />
      <Tile x={112} y={48} ch="A" r={-4} fill="#ff5fa8" />
      <Tile x={162} y={14} ch="?" r={10} fill="#45d4f5" />
      <Spark x={196} y={86} s={0.9} c="#ffc93c" />
    </svg>
  );
}

function AlphabetArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <circle cx="110" cy="72" r="54" fill={CREAM} stroke={INK} strokeWidth="4" />
      <path d="M110 18 A54 54 0 1 1 57 83" fill="none" stroke="#ff5fa8" strokeWidth="10" strokeLinecap="round" />
      <circle cx="110" cy="72" r="54" fill="none" stroke={INK} strokeWidth="4" />
      <Tile x={84} y={44} ch="M" s={52} fill="#ffc93c" r={-5} />
      <Tile x={18} y={22} ch="A" r={-14} s={26} />
      <Tile x={178} y={92} ch="Z" r={12} s={26} fill="#45d4f5" />
    </svg>
  );
}

function ScrambleArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <Tile x={20} y={68} ch="R" r={-16} />
      <Tile x={62} y={30} ch="W" r={12} fill="#ff8a3d" />
      <Tile x={106} y={74} ch="O" r={-6} fill="#ffc93c" />
      <Tile x={150} y={30} ch="D" r={18} />
      <Spark x={36} y={30} s={0.8} c="#ff5fa8" />
      <Spark x={190} y={100} s={1} c="#45d4f5" />
      <path d="M150 112 q 18 -14 36 -2" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M182 104 l 6 6 -8 3" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DefineArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <g transform="rotate(-4 110 70)">
        <rect x="34" y="26" width="150" height="98" rx="12" fill={INK} />
        <rect x="34" y="20" width="150" height="98" rx="12" fill={CREAM} stroke={INK} strokeWidth="4" />
        <text x="50" y="56" fontFamily="var(--display)" fontSize="26" fill={INK}>laconic</text>
        <rect x="50" y="64" width="62" height="16" rx="8" fill="#a8e063" stroke={INK} strokeWidth="2.5" />
        <text x="81" y="76" textAnchor="middle" fontFamily="var(--sans)" fontWeight="800" fontSize="10" fill={INK}>adjective</text>
        <rect x="50" y="90" width="110" height="7" rx="3.5" fill="#c9bfe6" />
        <rect x="50" y="103" width="76" height="7" rx="3.5" fill="#c9bfe6" />
      </g>
      <g transform="rotate(30 186 70)">
        <rect x="180" y="34" width="14" height="64" rx="3" fill="#ffc93c" stroke={INK} strokeWidth="3.5" />
        <path d="M180 98 L187 112 L194 98 Z" fill={CREAM} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function FlagArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <g transform="rotate(-9 64 70)">
        <rect x="22" y="44" width="84" height="63" rx="6" fill={INK} />
        <image href="flags/br.svg" x="22" y="38" width="84" height="63" preserveAspectRatio="none" />
        <rect x="22" y="38" width="84" height="63" rx="6" fill="none" stroke={INK} strokeWidth="4" />
      </g>
      <g transform="rotate(6 150 66)">
        <rect x="108" y="36" width="88" height="66" rx="6" fill={INK} />
        <image href="flags/jp.svg" x="108" y="30" width="88" height="66" preserveAspectRatio="none" />
        <rect x="108" y="30" width="88" height="66" rx="6" fill="none" stroke={INK} strokeWidth="4" />
      </g>
      <Spark x={104} y={20} s={1} c="#ffc93c" />
    </svg>
  );
}

function CapitalArt() {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="110" cy="112" rx="84" ry="16" fill={CREAM} stroke={INK} strokeWidth="4" />
      <path d="M48 112 q 20 -6 40 0 t 40 0 t 40 0" fill="none" stroke="#45d4f5" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 18 c -20 0 -32 15 -32 32 c 0 24 32 56 32 56 s 32 -32 32 -56 c 0 -17 -12 -32 -32 -32 z" fill="#ff5fa8" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M110 34 l 5 11 l 12 1.5 l -9 8 l 2.5 12 l -10.5 -6 l -10.5 6 l 2.5 -12 l -9 -8 l 12 -1.5 z" fill="#ffc93c" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <Spark x={176} y={36} s={0.8} c={CREAM} />
    </svg>
  );
}

function WebArt() {
  const fills = ['#ffc93c', '#ffc93c', '#ffc93c', '#ffc93c', CREAM, '#b98cff', CREAM, CREAM, CREAM, CREAM, '#b98cff', CREAM, '#b98cff', CREAM, CREAM, '#b98cff'];
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%" aria-hidden="true">
      {fills.map((f, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        return (
          <g key={i}>
            <rect x={44 + c * 34} y={13 + r * 30} width={29} height={26} rx={6} fill={INK} />
            <rect x={44 + c * 34} y={10 + r * 30} width={29} height={26} rx={6} fill={f} stroke={INK} strokeWidth={2.5} />
          </g>
        );
      })}
      <Spark x={196} y={30} s={0.8} c="#ff5fa8" />
      <Spark x={24} y={110} s={0.7} c="#45d4f5" />
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

/** Simple bold icons for the cabinet's arcade buttons. */
const ICONS: Record<string, React.ReactNode> = {
  'word-rush': <path d="M4 17 C 8 6, 12 18, 16 9 L 20 5 M16 5 h4 v4" />,
  'alphabet-sprint': <path d="M4 19 L9 5 L14 19 M6 14 h6 M15 9 h5 l-5 10 h5" />,
  'word-scramble': <path d="M4 7 h6 v6 h-6 z M14 11 h6 v6 h-6 z M8 17 q 2 3 6 2 M16 7 q -2 -3 -6 -2" />,
  'define-it': <path d="M5 4 h10 l4 4 v12 h-14 z M8 11 h8 M8 15 h6" />,
  'flag-finder': <path d="M6 21 V4 M6 5 h11 l-3 4 l3 4 H6" />,
  'capital-quest': <path d="M12 21 s7 -7 7 -12 a7 7 0 0 0 -14 0 c0 5 7 12 7 12 z M12 6.5 l1.2 2.4 2.6 .3 -2 1.8 .6 2.6 -2.4 -1.4 -2.4 1.4 .6 -2.6 -2 -1.8 2.6 -.3 z" />,
  'word-web': <path d="M4 4 h6 v6 h-6 z M14 4 h6 v6 h-6 z M4 14 h6 v6 h-6 z M14 14 h6 v6 h-6 z" />,
};
export function GameIcon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[id]}
    </svg>
  );
}

import { useEffect, useState } from 'react';
import { PlayerStore } from '../storage/store';
import { openBackend } from '../storage/db';
import { GAME_BY_ID } from '../games/registry';
import { setSoundEnabled } from '../engine/sound';
import { inArtifactViewer } from '../storage/transfer';
import { Home } from './Home';
import { GameScreen } from './GameScreen';
import { Progress } from './Progress';
import { Settings } from './Settings';
import { Icon, LiveRegion, StoreCtx, Toaster, Wordmark, fmt, toast, useStore } from './components';
import { rankFor, totalTokens } from '../engine/levels';

type Offline = 'ready' | 'installing' | 'unsupported' | 'artifact';

type Route =
  | { view: 'game'; id: string; autostart: boolean; review: boolean }
  | { view: 'home' | 'progress' | 'settings' };

function parseRoute(hash: string): Route {
  const h = decodeURIComponent(hash.replace(/^#/, ''));
  if (h.startsWith('play.')) return { view: 'game' as const, id: h.slice(5), autostart: true, review: false };
  if (h.startsWith('review.')) return { view: 'game' as const, id: h.slice(7), autostart: false, review: true };
  if (GAME_BY_ID.has(h)) return { view: 'game' as const, id: h, autostart: false, review: false };
  if (h === 'progress' || h === 'settings') return { view: h };
  return { view: 'home' };
}

function useHash() {
  const [hash, setHash] = useState(location.hash);
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    const on = () => {
      setHash(location.hash);
      setNonce((n) => n + 1);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return [hash, nonce] as const;
}

function useOffline(): Offline {
  const [state, setState] = useState<Offline>(() =>
    inArtifactViewer() ? 'artifact' : 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') ? 'installing' : 'unsupported',
  );
  useEffect(() => {
    if (state !== 'installing') return;
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => navigator.serviceWorker.ready.then(() => reg))
      .then(() => setState('ready'))
      .catch(() => setState('unsupported'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

function Shell() {
  const store = useStore();
  const [hash, nonce] = useHash();
  const route = parseRoute(hash);
  const offline = useOffline();

  useEffect(() => {
    document.documentElement.dataset.motion = store.settings.motion;
    setSoundEnabled(store.settings.sound);
  }, [store.settings.motion, store.settings.sound]);

  useEffect(() => {
    if (store.repaired > 0) toast(`Skipped ${store.repaired} damaged saved entries. Everything else loaded.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = { home: 'Curious Minds', progress: 'Your progress · Curious Minds', settings: 'Settings · Curious Minds' };
    document.title = route.view === 'game' ? `${GAME_BY_ID.get(route.id)?.title ?? 'Game'} · Curious Minds` : titles[route.view];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, route.view]);

  if (route.view === 'game') {
    const g = GAME_BY_ID.get(route.id);
    if (g) return <GameScreen key={`${route.id}-${nonce}`} game={g} autostart={route.autostart} reviewFocus={route.review} />;
  }

  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <header className="topbar">
        <div className="wrap">
          <Wordmark />
          <nav aria-label="Main">
            <LevelChip />
            <a className="iconbtn hide-sm" href="#progress" aria-current={route.view === 'progress' ? 'page' : undefined}>
              <Icon name="chart" /> <span className="label">Progress</span>
            </a>
            <a className="iconbtn" href="#settings" aria-current={route.view === 'settings' ? 'page' : undefined}>
              <Icon name="gear" /> <span className="label">Settings</span>
            </a>
            <button
              className="iconbtn"
              aria-pressed={store.settings.sound}
              aria-label={store.settings.sound ? 'Sound on' : 'Sound off'}
              onClick={() => store.updateSettings({ sound: !store.settings.sound })}
            >
              <Icon name={store.settings.sound ? 'sound' : 'mute'} />
            </button>
          </nav>
        </div>
      </header>
      {route.view === 'home' && <Home />}
      {route.view === 'progress' && <Progress />}
      {route.view === 'settings' && <Settings offline={offline} />}
    </>
  );
}

function LevelChip() {
  const store = useStore();
  const tokens = totalTokens(store.sessions);
  const rank = rankFor(tokens);
  return (
    <a className="level-chip" href="#progress" aria-label={`Level ${rank.level}, ${rank.name}. ${tokens} tokens.`}>
      <span className="coin" aria-hidden="true">c</span>
      <span className="tnum">{fmt(tokens)}</span>
      <span className="lv">Lv {rank.level}</span>
      <span className="txt">{rank.name}</span>
    </a>
  );
}

export function App() {
  const [store, setStore] = useState<PlayerStore | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  useEffect(() => {
    openBackend().then(async ({ backend, error }) => {
      setStore(await PlayerStore.load(backend));
      if (error) setWarning(error);
    });
  }, []);
  useEffect(() => {
    if (warning) toast(warning);
  }, [warning, store]);

  if (!store) {
    return (
      <div className="boot" aria-busy="true">
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  return (
    <StoreCtx.Provider value={store}>
      <Shell />
      <LiveRegion />
      <Toaster />
    </StoreCtx.Provider>
  );
}

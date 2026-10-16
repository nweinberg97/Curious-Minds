import React, { useRef, useState } from 'react';
import { Seg, Switch, fmt, toast, useStore } from './components';
import { parseExport, type ExportFile } from '../storage/schema';
import { inArtifactViewer, readFileText, saveTextFile } from '../storage/transfer';
import { dayKey } from '../engine/random';
import { setSoundEnabled, sfx } from '../engine/sound';

export function Settings({ offline }: { offline: 'ready' | 'installing' | 'unsupported' | 'artifact' }) {
  const store = useStore();
  const st = store.settings;
  const [pending, setPending] = useState<{ file: ExportFile; skipped: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [paste, setPaste] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [copyText, setCopyText] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportName = `curious-minds-${dayKey()}.json`;

  const doExport = async () => {
    const text = JSON.stringify(store.exportData(), null, 1);
    const r = await saveTextFile(exportName, text);
    if (r === 'saved') toast('Exported. Keep the file somewhere you can reach from your other device.');
    else if (r === 'declined') toast('Export cancelled.');
    else {
      setCopyText(text);
      toast("Downloads aren't available here. Copy your data below instead.");
    }
  };

  const copy = async () => {
    const text = copyText ?? JSON.stringify(store.exportData());
    setCopyText(text);
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied. Paste it into Import on your other device.');
    } catch {
      toast('Select the text below and copy it.');
      requestAnimationFrame(() => (document.getElementById('export-text') as HTMLTextAreaElement | null)?.select());
    }
  };

  const stage = (text: string) => {
    setImportError(null);
    const r = parseExport(text);
    if (!r.ok) {
      setPending(null);
      setImportError(r.error);
      return;
    }
    setPending({ file: r.file, skipped: r.skipped });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      stage(await readFileText(f));
    } catch {
      setImportError("That file couldn't be read. Try choosing it again.");
    }
  };

  const apply = async (how: 'merge' | 'replace') => {
    if (!pending) return;
    await store.importData(pending.file, how);
    setSoundEnabled(store.settings.sound);
    setPending(null);
    setPaste('');
    setShowPaste(false);
    toast(how === 'merge' ? 'Imported and merged with this device.' : 'Imported. This device now matches the file.');
  };

  const preview = pending ? store.previewImport(pending.file) : null;
  const where = store.backend.kind === 'indexeddb' ? 'saved in this browser' : 'held in memory only (storage is blocked)';

  return (
    <main className="wrap page" id="main">
      <h1 className="page-title">Settings and your data</h1>

      <section className="section" aria-labelledby="s-play">
        <h2 id="s-play">Play</h2>
        <div>
          <div className="setting">
            <div>
              <strong>Sound effects</strong>
              <span>Short, quiet tones for right and wrong answers.</span>
            </div>
            <Switch
              label="Sound effects"
              checked={st.sound}
              onChange={(v) => {
                store.updateSettings({ sound: v });
                setSoundEnabled(v);
                if (v) sfx.correct();
              }}
            />
          </div>
          <div className="setting">
            <div>
              <strong>Prefer relaxed modes</strong>
              <span>Start games in their untimed mode unless you pick another.</span>
            </div>
            <Switch label="Prefer relaxed modes" checked={st.relaxedByDefault} onChange={(v) => store.updateSettings({ relaxedByDefault: v })} />
          </div>
          <div className="setting">
            <div>
              <strong>Motion</strong>
              <span>Animations for answers, scores and transitions.</span>
            </div>
            <Seg
              hideLabel
              label="Motion"
              options={[
                { id: 'system', label: 'Match device' },
                { id: 'reduced', label: 'Reduced' },
                { id: 'full', label: 'Full' },
              ]}
              value={st.motion}
              onChange={(v) => store.updateSettings({ motion: v })}
            />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="s-data">
        <h2 id="s-data">Your data</h2>
        <p>
          Your progress is {where}. There's no account and nothing is sent anywhere. The same link works on any device, but
          each browser keeps its own progress. To move it, export a file here and import it on the other device.
        </p>
        {store.lastWriteError && <p className="notice bad">{store.lastWriteError}</p>}
        <div className="kv">
          <div><span className="n tnum">{fmt(store.sessions.length)}</span><span className="k">rounds saved</span></div>
          <div><span className="n tnum">{fmt(store.items.size)}</span><span className="k">things tracked for review</span></div>
          <div><span className="n tnum">{fmt(store.records.size)}</span><span className="k">personal bests</span></div>
        </div>

        <div className="row">
          <button className="btn btn-primary" onClick={doExport}>Export data</button>
          <button className="btn btn-ghost" onClick={copy}>Copy data as text</button>
        </div>
        {copyText && (
          <div>
            <label className="field-label" htmlFor="export-text">Your data</label>
            <textarea id="export-text" className="code" readOnly value={copyText} onFocus={(e) => e.currentTarget.select()} />
          </div>
        )}

        <h3 className="field-label" style={{ marginTop: 16 }}>Import from another device</h3>
        <div className="row">
          <input ref={fileRef} id="import-file" type="file" accept="application/json,.json" className="sr-only" onChange={onFile} />
          <button className="btn btn-tile" onClick={() => fileRef.current?.click()}>Choose a file</button>
          <button className="btn btn-ghost" onClick={() => setShowPaste((s) => !s)} aria-expanded={showPaste}>Paste text instead</button>
        </div>
        {showPaste && (
          <div className="settings-grid" style={{ gap: 8 }}>
            <label className="field-label" htmlFor="import-text">Paste exported data</label>
            <textarea id="import-text" className="code" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder='{"app":"curious-minds", …}' />
            <div><button className="btn btn-sm btn-tile" disabled={!paste.trim()} onClick={() => stage(paste)}>Check this data</button></div>
          </div>
        )}
        {importError && <p className="notice bad" role="alert">{importError}</p>}
        {pending && preview && (
          <div className="notice good" role="region" aria-label="Import preview">
            <p>
              <b>Ready to import.</b> The file was exported {new Date(preview.exportedAt).toLocaleString()} and holds {fmt(preview.sessions)} rounds
              ({fmt(preview.newSessions)} new to this device), {fmt(preview.items)} review items and {fmt(preview.records)} personal bests.
              {pending.skipped > 0 && ` ${pending.skipped} damaged entries will be skipped.`}
            </p>
            <p className="small dim" style={{ marginTop: 8 }}>
              Merge keeps everything on this device and adds the file's rounds, keeping the better best score for each game. Replace makes this device match the file exactly.
            </p>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => apply('merge')}>Merge</button>
              <button className="btn btn-ghost btn-sm" onClick={() => apply('replace')}>Replace this device's data</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPending(null)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="setting">
          <div>
            <strong>Clear all data</strong>
            <span>Removes every score, record and review item from this browser. Export first if you want to keep them.</span>
          </div>
          {!confirmClear ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(true)}>Clear data…</button>
          ) : (
            <div className="row">
              <button
                className="btn btn-danger btn-sm"
                onClick={async () => {
                  await store.clearAll();
                  setSoundEnabled(false);
                  setConfirmClear(false);
                  toast('All data cleared from this browser.');
                }}
                autoFocus
              >
                Yes, clear everything
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(false)}>Keep my data</button>
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="s-offline">
        <h2 id="s-offline">Offline play</h2>
        <p>
          {offline === 'ready' && 'Ready. Everything needed to play is stored on this device, so the games work without a connection.'}
          {offline === 'installing' && 'Saving the games to this device for offline play. This finishes in the background.'}
          {offline === 'unsupported' && "This browser can't store the app for offline use. Games still work while you're online."}
          {offline === 'artifact' &&
            "This copy runs inside Claude, which doesn't allow offline storage. The self-hosted version works offline after your first visit; see the project's README."}
        </p>
      </section>

      <section className="section" aria-labelledby="s-privacy">
        <h2 id="s-privacy">Privacy and credits</h2>
        <p>
          Curious Minds has no accounts, analytics, ads or trackers, and never asks for your microphone, camera or location. Your answers
          never leave your device. The only outside requests are for the two typefaces (Gloock and Schibsted Grotesk) from Google Fonts on
          your first visit{inArtifactViewer() ? ', plus the Claude page that hosts this copy' : ''}.
        </p>
        <p className="small muted">
          Flags: flag-icons by Panayiotis Lipiridis (MIT). Country data: mledoze/countries (Open Database License), with editorial facts and
          capital notes by Curious Minds. Word lists, definitions and puzzles are original to Curious Minds.
        </p>
      </section>
    </main>
  );
}

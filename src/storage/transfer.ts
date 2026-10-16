/**
 * Getting a file to the player.
 * - Inside a Claude artifact viewer, page-initiated downloads are blocked; the viewer's `downloads`
 *   capability asks the player to confirm the save instead.
 * - Everywhere else (self-hosted), a normal Blob download.
 */

interface DownloadsNS {
  save(req: { filename: string; data: string | Blob }): Promise<{ status: string }>;
}
interface ClaudeHost {
  use(name: string): Promise<unknown>;
}

let downloadsPromise: Promise<DownloadsNS | null> | null = null;

function hostDownloads(): Promise<DownloadsNS | null> {
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  if (!host || typeof host.use !== 'function') return Promise.resolve(null);
  if (!downloadsPromise) {
    downloadsPromise = host.use('downloads').then((d) => (d as DownloadsNS) ?? null, () => null);
  }
  return downloadsPromise;
}

/** True when this page runs inside the Claude artifact viewer (affects offline and download messaging). */
export function inArtifactViewer(): boolean {
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  return !!host && typeof host.use === 'function';
}

export type SaveOutcome = 'saved' | 'declined' | 'unavailable';

export async function saveTextFile(filename: string, text: string): Promise<SaveOutcome> {
  if (inArtifactViewer()) {
    const d = await hostDownloads();
    if (!d) return 'unavailable';
    try {
      await d.save({ filename, data: text });
      return 'saved';
    } catch (err) {
      const code = (err as { code?: string })?.code;
      return code === 'declined' ? 'declined' : 'unavailable';
    }
  }
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return 'saved';
  } catch {
    return 'unavailable';
  }
}

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

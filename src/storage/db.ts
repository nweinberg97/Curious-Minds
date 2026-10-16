import { DB_NAME, DB_VERSION, STORES, type StoreName } from './schema';

/** Minimal persistence surface. Two implementations: IndexedDB and in-memory (fallback and tests). */
export interface Backend {
  readonly kind: 'indexeddb' | 'memory';
  getAll<T>(store: StoreName): Promise<T[]>;
  put<T>(store: StoreName, value: T): Promise<void>;
  putMany<T>(store: StoreName, values: T[]): Promise<void>;
  clear(store: StoreName): Promise<void>;
}

/** Key path per store. Every record carries its own key. */
const KEY_PATH: Record<StoreName, string> = {
  sessions: 'id',
  items: 'key',
  records: 'key',
  meta: 'key',
};

export class MemoryBackend implements Backend {
  readonly kind = 'memory' as const;
  private data = new Map<StoreName, Map<string, unknown>>(STORES.map((s) => [s, new Map()]));
  async getAll<T>(store: StoreName): Promise<T[]> {
    return [...this.data.get(store)!.values()].map((v) => structuredClone(v) as T);
  }
  async put<T>(store: StoreName, value: T): Promise<void> {
    const k = (value as Record<string, string>)[KEY_PATH[store]];
    this.data.get(store)!.set(k, structuredClone(value));
  }
  async putMany<T>(store: StoreName, values: T[]): Promise<void> {
    for (const v of values) await this.put(store, v);
  }
  async clear(store: StoreName): Promise<void> {
    this.data.get(store)!.clear();
  }
}

/**
 * Upgrade path. `oldVersion` is 0 for a brand-new database.
 * Add a `if (oldVersion < N)` block for each future version; never edit old blocks.
 */
function migrate(db: IDBDatabase, oldVersion: number) {
  if (oldVersion < 1) {
    db.createObjectStore('sessions', { keyPath: 'id' }).createIndex('gameId', 'gameId');
    db.createObjectStore('items', { keyPath: 'key' }).createIndex('gameId', 'gameId');
    db.createObjectStore('records', { keyPath: 'key' });
    db.createObjectStore('meta', { keyPath: 'key' });
  }
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export class IDBBackend implements Backend {
  readonly kind = 'indexeddb' as const;
  private constructor(private db: IDBDatabase) {
    // Another tab upgraded the schema: close so it can proceed. This tab keeps its in-memory state.
    db.onversionchange = () => db.close();
  }

  static open(timeoutMs = 3000): Promise<IDBBackend> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        settled = true;
        reject(new Error('IndexedDB timed out'));
      }, timeoutMs);
      try {
        const r = indexedDB.open(DB_NAME, DB_VERSION);
        r.onupgradeneeded = (e) => migrate(r.result, (e as IDBVersionChangeEvent).oldVersion);
        r.onsuccess = () => {
          clearTimeout(timer);
          if (settled) r.result.close();
          else resolve(new IDBBackend(r.result));
        };
        r.onerror = () => {
          clearTimeout(timer);
          if (!settled) reject(r.error);
        };
        r.onblocked = () => {
          /* wait; another tab will close on versionchange */
        };
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  private tx(store: StoreName, mode: IDBTransactionMode) {
    return this.db.transaction(store, mode).objectStore(store);
  }
  getAll<T>(store: StoreName): Promise<T[]> {
    return req(this.tx(store, 'readonly').getAll()) as Promise<T[]>;
  }
  async put<T>(store: StoreName, value: T): Promise<void> {
    await req(this.tx(store, 'readwrite').put(value));
  }
  putMany<T>(store: StoreName, values: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const t = this.db.transaction(store, 'readwrite');
      const s = t.objectStore(store);
      for (const v of values) s.put(v);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }
  async clear(store: StoreName): Promise<void> {
    await req(this.tx(store, 'readwrite').clear());
  }
}

/** Open IndexedDB, or fall back to memory (private browsing, blocked storage, very old browsers). */
export async function openBackend(): Promise<{ backend: Backend; error?: string }> {
  if (typeof indexedDB === 'undefined') {
    return { backend: new MemoryBackend(), error: 'This browser has no IndexedDB, so progress lasts until you close the tab.' };
  }
  try {
    return { backend: await IDBBackend.open() };
  } catch {
    return {
      backend: new MemoryBackend(),
      error: "This browser is blocking storage, so progress lasts until you close the tab. Export your data before leaving if you want to keep it.",
    };
  }
}

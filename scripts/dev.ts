/**
 * Local development: rebuilds dist/ when src/ or public/ change and serves it at http://localhost:5173.
 * (Service workers only register on https or localhost, so offline mode works here too.)
 */
import { watch } from 'node:fs';
import { join, normalize } from 'node:path';

const root = join(import.meta.dir, '..');
const dist = join(root, 'dist');
const port = Number(process.env.PORT ?? 5173);

async function build() {
  const p = Bun.spawn(['bun', join(root, 'scripts/build.ts')], { stdout: 'inherit', stderr: 'inherit' });
  await p.exited;
}

await build();
let timer: ReturnType<typeof setTimeout> | undefined;
for (const dir of ['src', 'public']) {
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = Bun.file(normalize(join(dist, path)));
    if (!file.name?.startsWith(dist) || !(await file.exists())) return new Response('Not found', { status: 404 });
    return new Response(file, { headers: { 'Cache-Control': 'no-store' } });
  },
});
console.log(`Curious Minds running at http://localhost:${port}`);

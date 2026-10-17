/**
 * Build Curious Minds into static files. No server, no framework CLI: Bun's bundler does the work.
 *
 *   bun run build            → dist/            (deployable site: index.html, app.js, app.css, flags/, sw.js, manifest)
 *   bun run build:artifact   → dist-artifact/   (single page for a Claude artifact; flags published alongside)
 *
 * The service worker's cache name includes a content hash, so every deploy refreshes offline copies.
 */
import { mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = join(import.meta.dir, '..');
const target = process.argv.includes('--artifact') ? 'artifact' : 'site';
const out = join(root, target === 'artifact' ? 'dist-artifact' : 'dist');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const result = await Bun.build({
  entrypoints: [join(root, 'src/main.tsx')],
  minify: true,
  target: 'browser',
  format: 'esm',
  define: { 'process.env.NODE_ENV': '"production"' },
  sourcemap: 'none',
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
const js = await result.outputs[0].text();
const css = readFileSync(join(root, 'src/styles/app.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\n\s*\n/g, '\n');

const FONTS = 'https://fonts.googleapis.com/css2?family=Lilita+One&family=Rubik:ital,wght@0,400..900;1,400..700&display=swap';
const DESCRIPTION = 'Quick, beautiful brain games for curious minds: wordplay, world knowledge and connections. Free, no account, private.';
const BOOT_CSS = `.boot{min-height:100vh;display:grid;place-items:center}`;

const hash = createHash('sha256').update(js).update(css).digest('hex').slice(0, 10);
const flags = readdirSync(join(root, 'public/flags')).filter((f) => f.endsWith('.svg')).sort();

if (target === 'site') {
  writeFileSync(join(out, 'app.js'), js);
  writeFileSync(join(out, 'app.css'), css + BOOT_CSS);
  cpSync(join(root, 'public'), out, { recursive: true });
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Curious Minds</title>
<meta name="description" content="${DESCRIPTION}">
<meta name="theme-color" content="#1b1036">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="app.css?v=${hash}">
</head>
<body>
<div id="root"></div>
<noscript><p style="padding:24px;color:#efe6d4;font-family:sans-serif">Curious Minds needs JavaScript to run its games.</p></noscript>
<script type="module" src="app.js?v=${hash}"></script>
</body>
</html>
`;
  writeFileSync(join(out, 'index.html'), html);
  const precache = ['./', 'index.html', `app.js?v=${hash}`, `app.css?v=${hash}`, 'manifest.webmanifest', 'icon.svg', ...flags.map((f) => `flags/${f}`)];
  const sw = readFileSync(join(root, 'src/sw.template.js'), 'utf8')
    .replace('__CACHE__', `curious-minds-${hash}`)
    .replace('__PRECACHE__', JSON.stringify(precache));
  writeFileSync(join(out, 'sw.js'), sw);
  console.log(`dist/ built: app.js ${(js.length / 1024).toFixed(0)} KB, css ${(css.length / 1024).toFixed(0)} KB, ${flags.length} flags, cache ${hash}`);
} else {
  // Artifact page: the platform wraps it in its own document skeleton, so no doctype/html/head/body here.
  const page = `<title>Curious Minds</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${DESCRIPTION}">
<link rel="stylesheet" href="${FONTS}">
<style>${css}${BOOT_CSS}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
  writeFileSync(join(out, 'index.html'), page);
  mkdirSync(join(out, 'flags'));
  for (const f of flags) cpSync(join(root, 'public/flags', f), join(out, 'flags', f));
  console.log(`dist-artifact/ built: page ${(page.length / 1024).toFixed(0)} KB + ${flags.length} flags`);
}

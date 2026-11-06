const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

module.exports = function buildSiteAssets(root, check) {
  const { buildSync } = require('esbuild');
  const bundle = buildSync({
    entryPoints: [path.join(root, 'scripts/build-site-ui.tsx')],
    bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', write: false,
    alias: { '@': root },
    define: { 'process.env.NODE_ENV': '"production"' },
  }).outputFiles[0].text;
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-site-'));
  const uiFile = path.join(temporary, 'ui.cjs');
  let ui;
  try {
    fs.writeFileSync(uiFile, bundle);
    ui = require(uiFile);
    const output = path.join(temporary, 'style.css');
    execFileSync(process.execPath, [
      path.join(root, 'node_modules/@tailwindcss/cli/dist/index.mjs'),
      '-i', path.join(root, 'styles/site.css'), '-o', output, '--minify',
    ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    const license = fs.readFileSync(path.join(root, 'styles/LICENSE.BoardUI.txt'), 'utf8').trim();
    const css = `/*! BoardUI — ${license.replace(/\*\//g, '* /')} */\n${fs.readFileSync(output, 'utf8')}`;
    const destination = path.join(root, 'docs/style.css');
    if (check) {
      if (fs.readFileSync(destination, 'utf8') !== css) throw new Error('style.css is stale; run npm run build:docs');
    } else fs.writeFileSync(destination, css);
  } finally {
    delete require.cache[uiFile];
    fs.rmSync(temporary, { recursive: true, force: true });
  }
  return ui;
};

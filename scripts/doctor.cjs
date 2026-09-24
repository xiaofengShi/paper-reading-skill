const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) {
  console.error(`Node.js ${process.versions.node} is too old. Install Node.js 20 or newer.`);
  process.exit(1);
}

for (const dependency of ['marked', 'katex']) {
  try {
    require.resolve(dependency, { paths: [root] });
  } catch {
    console.error(`${dependency} is missing. Run npm ci inside ${root}, then retry npm run doctor.`);
    process.exit(1);
  }
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-doctor-'));
try {
  const output = path.join(temporary, 'transformer.html');
  const result = spawnSync(process.execPath, [
    path.join(root, 'scripts/render-reading.cjs'),
    path.join(root, 'examples/attention-is-all-you-need-deep-read.md'),
    output,
  ], { cwd: root, encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error(result.stderr || result.error?.message || `Renderer exited with ${result.status}`);
    process.exitCode = 1;
  } else {
    const html = fs.readFileSync(output, 'utf8');
    if (!html.includes('<html lang="en">') || !html.includes('class="katex"') ||
        !html.includes('href="#section-1"') || !html.includes('data:image/svg+xml;base64,')) {
      console.error('Example rendered, but its language, math, navigation, or embedded diagram is incomplete.');
      process.exitCode = 1;
    } else {
      console.log(`Ready: Node.js ${process.versions.node}, dependencies, and one offline example render passed.`);
      console.log('Restart your agent and ask it to read a PDF or paper URL deeply.');
    }
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

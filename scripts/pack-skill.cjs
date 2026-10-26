#!/usr/bin/env node
// Build a small installable skill without copying the public gallery or dependencies.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const usage = `Usage: node scripts/pack-skill.cjs [--out <output-parent>] [--no-archive]

Build <output-parent>/paper-reading/ and a SHA-256 manifest. The default output
parent is this repository's dist/. Also create paper-reading.tar.gz when the
system tar command is available. Existing outputs are never overwritten.

The runtime tree excludes docs/, examples/, node_modules/, reports/, tests,
and website build scripts. Install its dependencies with npm ci, then run
npm run doctor. No paper download, model, or other installed skill is needed
for that renderer check.
`;

function filesUnder(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link in runtime inputs: ${path.relative(root, file)}`);
    if (entry.isDirectory()) result.push(...filesUnder(file));
    else if (entry.isFile()) result.push(file);
  }
  return result;
}

// Resolve existing ancestors too: --out may not exist yet, or may traverse a
// directory symlink. A lexical prefix check alone can write back into inputs.
function physicalPath(file) {
  const suffix = [];
  let ancestor = file;
  while (!fs.existsSync(ancestor)) {
    try { fs.lstatSync(ancestor); throw new Error(`Unresolvable output path: ${file}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(ancestor);
    if (parent === ancestor) throw new Error(`Unresolvable output path: ${file}`);
    suffix.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  return path.join(fs.realpathSync(ancestor), ...suffix);
}

function main() {
  let outputParent = path.join(root, 'dist');
  let archiveRequested = true;
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    if (args.length !== 1) throw new Error('Use --help on its own.');
    process.stdout.write(usage);
    return;
  }
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (seen.has(key)) throw new Error(`Repeated option: ${key}.`);
    seen.add(key);
    if (key === '--no-archive') archiveRequested = false;
    else if (key === '--out') {
      const value = args[++i];
      if (!value || value.startsWith('--') || /[\r\n\0]/.test(value)) throw new Error('Missing or invalid --out directory.');
      outputParent = path.resolve(value);
    } else throw new Error(`Unknown option: ${key}. Run with --help.`);
  }
  const destination = path.join(outputParent, 'paper-reading');
  const archive = path.join(outputParent, 'paper-reading.tar.gz');
  const physicalDestination = physicalPath(destination);
  for (const directory of ['references', 'evals', 'assets', 'scripts', 'agents']) {
    const inputDirectory = physicalPath(path.join(root, directory));
    if (physicalDestination === inputDirectory || physicalDestination.startsWith(inputDirectory + path.sep)) {
      throw new Error(`Output must stay outside runtime input directories: ${directory}/`);
    }
  }
  if (fs.existsSync(destination) || (archiveRequested && fs.existsSync(archive))) {
    throw new Error(`Output already exists; choose a new --out parent. Nothing was changed: ${outputParent}`);
  }
  const fixed = ['SKILL.md', 'LICENSE', 'CONTRIBUTING.md', 'CITATION.cff', 'package-lock.json'];
  const selected = new Map(fixed.map(relative => [relative, path.join(root, relative)]));
  for (const directory of ['references', 'evals', 'assets', 'scripts', 'agents']) {
    const sourceDirectory = path.join(root, directory);
    if (!fs.existsSync(sourceDirectory)) continue;
    if (fs.lstatSync(sourceDirectory).isSymbolicLink()) throw new Error(`Refusing symbolic link in runtime inputs: ${directory}`);
    for (const file of filesUnder(sourceDirectory)) {
      const relative = path.relative(root, file).split(path.sep).join('/');
      if (directory === 'scripts' && relative.split('/').slice(1).some(part => /^(?:test-|build-|pack-skill\.cjs$|tests$|__tests__$)/.test(part))) continue;
      selected.set(relative, file);
    }
  }
  for (const [relative, file] of selected) {
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`Refusing symbolic link in runtime inputs: ${relative}`);
    if (!fs.statSync(file).isFile()) throw new Error(`Missing runtime input: ${relative}`);
  }
  const packaged = new Set([...selected.keys(), 'README.md', 'package.json']);
  const isPackaged = relative => packaged.has(relative) || [...packaged].some(file => file.startsWith(relative.replace(/\/$/, '') + '/'));
  const rewriteLink = (sourceFile, match, open, target, close) => {
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(target)) return match;
    const [localTarget, fragment] = target.split('#', 2);
    let decoded;
    try { decoded = decodeURIComponent(localTarget); } catch { throw new Error(`Invalid local Markdown link in ${sourceFile}: ${target}`); }
    const resolved = path.resolve(path.dirname(sourceFile), decoded);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) throw new Error(`Markdown link escapes source tree: ${target}`);
    const relative = path.relative(root, resolved).split(path.sep).join('/');
    if (isPackaged(relative)) return match;
    if (!fs.existsSync(resolved)) throw new Error(`Broken source link in ${path.relative(root, sourceFile)}: ${target}`);
    const kind = fs.statSync(resolved).isDirectory() ? 'tree' : 'blob';
    const url = `https://github.com/xiaofengShi/paper-reading-skill/${kind}/main/${relative.split('/').map(encodeURIComponent).join('/')}${fragment ? '#' + fragment : ''}`;
    return `${open}${url}${close}`;
  };
  const upstreamLinks = (content, sourceFile) => {
    let fence = null;
    return content.split('\n').map(line => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (marker) {
        if (!fence) fence = { character: marker[1][0], length: marker[1].length };
        else if (marker[1][0] === fence.character && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
        return line;
      }
      if (fence || /^(?: {4}|\t)/.test(line)) return line;
      // Code examples document input syntax; their illustrative paths are not package dependencies.
      return line.split(/(`+[^`]*`+)/g).map((part, index) => index % 2 ? part : part.replace(
        /(!?\[[^\]\n]*\]\()([^\s)]+)(\))/g,
        (...args) => rewriteLink(sourceFile, ...args),
      )).join('');
    }).join('\n');
  };
  const contents = new Map();
  for (const [relative, sourceFile] of selected) {
    const raw = fs.readFileSync(sourceFile);
    contents.set(relative, relative.endsWith('.md') ? Buffer.from(upstreamLinks(raw.toString('utf8'), sourceFile)) : raw);
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  pkg.scripts = {
    doctor: 'node scripts/doctor.cjs',
    'init:reading': 'node scripts/init-reading.cjs',
    render: 'node scripts/render-reading.cjs',
  };
  contents.set('package.json', Buffer.from(JSON.stringify(pkg, null, 2) + '\n'));
  contents.set('README.md', Buffer.from(`# Paper Reading Skill — runtime package\n\nThis lightweight package contains the skill instructions, references, quality gates, renderer, initializer, and a synthetic smoke fixture. Public reading examples remain in the [source repository](https://github.com/xiaofengShi/paper-reading-skill) and [gallery](https://xiaofengshi.github.io/paper-reading-skill/).\n\nUse Node.js 20 or newer. In this directory:\n\n\`\`\`bash\nnpm ci\nnpm run doctor\nnode scripts/init-reading.cjs --help\n\`\`\`\n\nInstall this whole directory as paper-reading in your agent's skills directory, then start a new agent session. Give the agent a complete PDF or accessible paper URL and ask it to use paper-reading. The initializer creates unfinished inputs; the doctor checks rendering. Neither command performs or verifies a scientific deep read.\n\nContributor and gallery links may open the full repository online. manifest.json records the byte size and SHA-256 of each packaged file. Dependencies are installed separately with the included lockfile.\n`));
  const entries = [...contents].sort(([a], [b]) => a.localeCompare(b)).map(([file, content]) => ({
    path: file, bytes: content.length, sha256: crypto.createHash('sha256').update(content).digest('hex'),
  }));
  const manifest = {
    schemaVersion: 1,
    package: 'paper-reading-runtime',
    source: 'https://github.com/xiaofengShi/paper-reading-skill',
    totalBytes: entries.reduce((sum, file) => sum + file.bytes, 0),
    files: entries,
  };
  fs.mkdirSync(outputParent, { recursive: true });
  fs.mkdirSync(destination);
  for (const [relative, content] of contents) {
    const file = path.join(destination, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, { flag: 'wx' });
  }
  fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  console.log(`Built runtime tree: ${destination}`);
  console.log(`Manifest: ${path.join(destination, 'manifest.json')} (${entries.length} files, ${manifest.totalBytes} input bytes)`);
  if (archiveRequested) {
    const result = spawnSync('tar', ['-czf', archive, '-C', outputParent, 'paper-reading'], { encoding: 'utf8' });
    if (!result.error && result.status === 0) console.log(`Archive: ${archive} (${fs.statSync(archive).size} bytes)`);
    else {
      if (fs.existsSync(archive)) fs.unlinkSync(archive);
      console.log(`Runtime tree is ready; no archive was created (${result.error?.code || 'tar failed'}).`);
    }
  }
}

try { main(); } catch (error) {
  console.error(`Cannot package skill: ${error.message}`);
  process.exitCode = 1;
}

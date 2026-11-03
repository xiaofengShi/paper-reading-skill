// Build the standalone driving tutorial and its explicit, deterministic public bundle.
// Requires Node.js 20+ and Python 3 (zipfile); no browser or runtime Python dependency.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const guide = path.join(root, 'guides/driving-data-learning');
const docs = path.join(root, 'docs');
const meta = JSON.parse(fs.readFileSync(path.join(guide, 'guide.json'), 'utf8'));
const present = require(path.join(guide, 'presentation.cjs'));
const check = process.argv.includes('--check');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'driving-guide-'));
const esc = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const files = ['README.md','LICENSE','reading.md','assets/construction-scene.svg','assets/sample-trace.html',
  'assets/sampling-explorer.html','assets/update-explorer.html',
  'assets/scene-split.svg','assets/time-alignment.svg','assets/forward-graph.svg','assets/mask-denominator.svg',
  'assets/loss-landscape.svg','assets/update-rhythm.svg','assets/evaluation-loops.svg','assets/controlled-trial.svg','labs/audit_lab.py','labs/math_lab.py',
  'labs/torch_lab.py','labs/requirements.txt','labs/environment.json','labs/math-results.json',
  'labs/runs/audit-verified-20261103/audit-results.json','labs/runs/torch-verified-20261103/torch-results.json'];
try {
  execFileSync('python3',[path.join(guide,'build-visuals.py'),...(check?['--check']:[])],{stdio:'pipe'});
  const rendered = path.join(temporary, 'reading.html');
  execFileSync(process.execPath, [path.join(__dirname,'render-reading.cjs'),path.join(guide,'reading.md'),rendered],{stdio:'pipe'});
  let html = present(fs.readFileSync(rendered,'utf8'));
  html = html.replace('</head>', `<link rel="canonical" href="${esc(meta.url)}"><meta name="author" content="xiaofengShi"><meta property="og:type" content="article"><meta property="og:locale" content="zh_CN"><meta property="og:site_name" content="Paper Reading"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta property="og:url" content="${esc(meta.url)}"><meta property="og:image" content="${esc(meta.image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"></head>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(meta.description)}">`);
  if (/\/Users\/|file:\/\/|localhost|127\.0\.0\.1/.test(html)) throw new Error('Public tutorial contains a local-only dependency');
  fs.writeFileSync(rendered,html);
  const archive = path.join(temporary,'driving-data-learning-labs.zip');
  const script = `import sys,zipfile,pathlib,json
source=pathlib.Path(sys.argv[1]); html=pathlib.Path(sys.argv[2]); archive=sys.argv[3]; files=json.loads(sys.argv[4])
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_STORED) as output:
 for name in sorted(files+['reading.html']):
  data=html.read_bytes() if name=='reading.html' else (source/name).read_bytes()
  info=zipfile.ZipInfo('driving-data-learning/'+name,(2026,11,3,0,0,0));info.create_system=3;info.external_attr=0o100644<<16
  output.writestr(info,data)
`;
  execFileSync('python3',['-c',script,guide,rendered,archive,JSON.stringify(files)],{stdio:'pipe'});
  const outputs = new Map([
    ['driving-data-learning.html',Buffer.from(html)],
    ['downloads/driving-data-learning-labs.zip',fs.readFileSync(archive)],
    ['downloads/driving-data-learning.md',fs.readFileSync(path.join(guide,'reading.md'))],
    ['assets/driving-data-learning-share.png',fs.readFileSync(path.join(guide,'assets/share.png'))],
  ]);
  for (const [relative,data] of outputs) {
    const target = path.join(docs,relative);
    if (check) {
      if (!fs.existsSync(target)||!fs.readFileSync(target).equals(data)) throw new Error(`${relative} is stale; run npm run build:guides`);
    } else {fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}
  }
  console.log(`${check?'Checked':'Built'} standalone tutorial, offline experiment bundle, Markdown and share preview`);
} finally {fs.rmSync(temporary,{recursive:true,force:true});}

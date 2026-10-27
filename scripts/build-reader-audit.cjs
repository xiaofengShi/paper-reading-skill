const fs = require('node:fs');
const path = require('node:path');
async function main() {
const { marked } = await import('marked');

const root = path.resolve(__dirname, '..');
const reportFiles = fs.readdirSync(path.join(root, 'reports')).filter(file => file.endsWith('.md')).sort();
const esc = value => value.replace(/[&<>"]/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[char]));
for (const report of reportFiles) {
const source = fs.readFileSync(path.join(root, 'reports', report), 'utf8');
const title = source.match(/^# (.+)$/m)?.[1] || report;
const lang = /[\p{Script=Han}]/u.test(title) ? 'zh-CN' : 'en';
const body = marked.parse(source, { gfm: true })
  .replace(/href="\.\.\/docs\//g, 'href="./')
  .replace(/href="([^"/#]+)\.md"/g, (match, stem) => reportFiles.includes(stem + '.md') ? `href="${stem}.html"` : match);
const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>
:root{color-scheme:light;--ink:#18313b;--muted:#485f65;--line:#dce6e2;--teal:#16685f;--paper:#fffefa}*{box-sizing:border-box}body{margin:0;background:#f2f7f4;color:var(--ink);font:16px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif}a{color:var(--teal);text-underline-offset:3px}.top{padding:1.1rem max(1rem,calc((100vw - 1120px)/2));background:#173b40;color:#eff8f3;font-weight:800;letter-spacing:.12em}.top a{color:inherit;text-decoration:none}.wrap{max-width:1120px;margin:0 auto;padding:3rem 1.5rem 5rem;background:var(--paper)}h1{font-size:clamp(2rem,4vw,3.5rem);line-height:1.16;letter-spacing:-.035em}h2{margin:3rem 0 1rem;padding-top:1.5rem;border-top:1px solid var(--line);font-size:1.7rem;line-height:1.3}p,li{color:var(--muted)}p{margin:0 0 1.2rem}li{margin:.4rem 0}strong{color:var(--ink)}table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse;margin:1.5rem 0 2rem;font-size:.92rem}th,td{min-width:11rem;padding:.7rem .85rem;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:#eaf3ef}code,a{overflow-wrap:anywhere}pre{overflow-x:auto;padding:1rem;background:#eaf3ef;border-radius:6px}a:focus-visible{outline:3px solid #c16736;outline-offset:3px}@media(max-width:600px){.wrap{padding:1.5rem 1rem 3rem}h2{font-size:1.4rem}th,td{min-width:10rem}}@media print{body{background:#fff}.wrap{max-width:none;padding:0}.top{display:none}table{overflow:visible}tr{break-inside:avoid}}
</style></head><body><header class="top"><a href="./">PAPER / READING</a></header><main class="wrap">${body}</main></body></html>`;
const outputName = report.replace(/\.md$/, '.html');
const output = path.join(root, 'docs', outputName);
if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== html) throw new Error(`${outputName} is stale; run npm run build:audit`);
} else {
  fs.writeFileSync(output, html);
}
}

}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

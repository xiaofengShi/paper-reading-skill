// Resource checks are about browser requests, not every URL in a document.
// In particular, hyperlinks, SVG namespaces, data URLs and fragment references
// are legitimate in an offline page.
const fs = require('node:fs');
const path = require('node:path');

const escapeAttribute = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const offlinePolicy = "default-src 'none'; script-src 'unsafe-inline' data: blob:; style-src 'unsafe-inline' data:; img-src data: blob:; font-src data:; media-src data: blob:; frame-src about: data: blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const policyMeta = `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(offlinePolicy)}">`;

function decodeAttribute(value) {
  const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', colon: ':', sol: '/', bsol: '\\', Tab: '\t', NewLine: '\n', period: '.', semi: ';', equals: '=' };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z][a-z\d]*);?/gi, (raw, name) => {
    if (name[0] === '#') {
      const number = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
      return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : '\ufffd';
    }
    if (Object.hasOwn(entities, name)) return entities[name];
    if (!raw.endsWith(';')) return raw;
    throw new Error(`Offline asset has an unsupported HTML entity: ${raw}`);
  });
}

// A small HTML scanner, rather than an attribute-order-dependent replacement.
// It respects quoted > characters, comments, and raw script/style contents.
function scanHtml(html, visit) {
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf('<', cursor);
    if (start < 0) break;
    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4);
      if (end < 0) throw new Error('Offline asset audit found an unclosed HTML comment');
      cursor = end + 3; continue;
    }
    if (html.startsWith('<![CDATA[', start)) {
      const end = html.indexOf(']]>', start + 9);
      if (end < 0) throw new Error('Offline asset audit found unclosed CDATA');
      cursor = end + 3; continue;
    }
    if (/^<!|^<\?/.test(html.slice(start, start + 2))) {
      const end = html.indexOf('>', start + 2);
      if (end < 0) throw new Error('Offline asset audit found an unclosed declaration');
      const declaration = html.slice(start, end + 1);
      if (/\b(?:SYSTEM|PUBLIC|ENTITY)\b/i.test(declaration)) throw new Error('Offline asset audit rejects external document entities');
      cursor = end + 1; continue;
    }
    const nameMatch = /^<(\/?)([a-z][\w:-]*)/i.exec(html.slice(start));
    if (!nameMatch) { cursor = start + 1; continue; }
    const tag = { name: nameMatch[2].toLowerCase(), closing: !!nameMatch[1], start, attrs: new Map() };
    let index = start + nameMatch[0].length;
    while (index < html.length) {
      while (/\s/.test(html[index] || '') && index < html.length) index++;
      if (html[index] === '>' || (html[index] === '/' && html[index + 1] === '>')) break;
      const attrStart = index;
      const attrMatch = /^[^\s=<>"'`/]+/.exec(html.slice(index));
      if (!attrMatch) throw new Error(`Offline asset audit found a malformed <${tag.name}> attribute`);
      const name = attrMatch[0].toLowerCase();
      index += attrMatch[0].length;
      while (/\s/.test(html[index] || '') && index < html.length) index++;
      let value = '';
      if (html[index] === '=') {
        index++;
        while (/\s/.test(html[index] || '') && index < html.length) index++;
        const quote = html[index] === '"' || html[index] === "'" ? html[index++] : null;
        const valueStart = index;
        if (quote) {
          index = html.indexOf(quote, index);
          if (index < 0) throw new Error(`Offline asset audit found an unclosed <${tag.name}> attribute`);
          value = html.slice(valueStart, index++);
        } else {
          while (index < html.length && !/[\s>]/.test(html[index])) index++;
          value = html.slice(valueStart, index);
        }
      }
      if (tag.attrs.has(name)) throw new Error(`Offline asset audit rejects duplicate ${name} attributes`);
      tag.attrs.set(name, { name, value, start: attrStart, end: index });
    }
    if (index >= html.length) throw new Error(`Offline asset audit found an unclosed <${tag.name}> tag`);
    tag.end = index + (html[index] === '/' ? 2 : 1);
    cursor = tag.end;
    if (!tag.closing && ['script', 'style', 'textarea', 'title', 'xmp'].includes(tag.name)) {
      const close = new RegExp(`</${tag.name}\\s*>`, 'ig');
      close.lastIndex = cursor;
      const match = close.exec(html);
      if (!match) throw new Error(`Offline asset audit found an unclosed <${tag.name}> element`);
      tag.content = html.slice(cursor, match.index);
      tag.contentEnd = match.index;
      tag.elementEnd = close.lastIndex;
      cursor = close.lastIndex;
    }
    visit(tag);
  }
}

function dataPayload(url) {
  const match = /^data:([^,]*),([\s\S]*)$/i.exec(url);
  if (!match) throw new Error('Offline asset has an invalid data URL');
  const mime = match[1].split(';')[0].toLowerCase();
  let bytes;
  try { bytes = /;base64(?:;|$)/i.test(match[1]) ? Buffer.from(match[2], 'base64') : Buffer.from(decodeURIComponent(match[2])); }
  catch { throw new Error('Offline asset has an invalid data URL payload'); }
  return { mime, bytes };
}

function embeddedUrl(value, context, depth = 0) {
  const url = value.trim();
  if (url.startsWith('#')) return;
  if (!/^data:/i.test(url)) throw new Error(`Offline asset must be embedded (${context}): ${url.slice(0, 160)}`);
  if (depth > 8) throw new Error('Offline asset nesting is too deep');
  const { mime, bytes } = dataPayload(url);
  if (mime === 'image/svg+xml' || mime === 'text/html') auditHtml(bytes.toString('utf8'), { context, depth: depth + 1 });
  if (mime === 'text/css') auditCss(bytes.toString('utf8'), context, depth + 1);
}

function auditCss(css, context = 'CSS', depth = 0) {
  // Parse strings before functions so SVG data URLs may contain quotes, >, and ).
  const source = css;
  let index = 0;
  const readEscape = () => {
    const match = /^\\([\da-f]{1,6})(?:\r\n|[\t\n\r\f ])?|^\\([^\n\r\f])/i.exec(source.slice(index));
    if (!match) { index++; return ''; }
    index += match[0].length;
    return match[1] ? String.fromCodePoint(Math.min(parseInt(match[1], 16) || 0xfffd, 0x10ffff)) : match[2];
  };
  const readString = () => {
    const quote = source[index++];
    let value = '';
    while (index < source.length) {
      if (source[index] === quote) { index++; return value; }
      value += source[index] === '\\' ? readEscape() : source[index++];
    }
    throw new Error(`Offline asset audit found an unclosed CSS string (${context})`);
  };
  while (index < source.length) {
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2);
      if (end < 0) throw new Error(`Offline asset audit found an unclosed CSS comment (${context})`);
      index = end + 2; continue;
    }
    if (source[index] === '"' || source[index] === "'") { readString(); continue; }
    let identifier = '';
    if (source[index] === '@') identifier += source[index++];
    while (index < source.length && /[\w\\-]/.test(source[index])) identifier += source[index] === '\\' ? readEscape() : source[index++];
    if (identifier.toLowerCase() === '@import') throw new Error(`Offline asset CSS @import is unsupported (${context}); inline the stylesheet`);
    if (identifier) {
      while (/\s/.test(source[index] || '') && index < source.length) index++;
    }
    if (identifier.toLowerCase() === 'url' && source[index] === '(') {
      index++;
      while (/\s/.test(source[index] || '') && index < source.length) index++;
      let value;
      if (source[index] === '"' || source[index] === "'") value = readString();
      else {
        value = '';
        while (index < source.length && source[index] !== ')') value += source[index] === '\\' ? readEscape() : source[index++];
        if (index === source.length) throw new Error(`Offline asset audit found an unclosed CSS url (${context})`);
        value = value.trim();
      }
      while (/\s/.test(source[index] || '') && index < source.length) index++;
      if (source[index++] !== ')') throw new Error(`Offline asset audit found a malformed CSS url (${context})`);
      embeddedUrl(value, context, depth); continue;
    }
    // String-form image-set sources would otherwise bypass url() checking.
    if (/^(?:-webkit-)?image-set$/i.test(identifier) && source[index] === '(') throw new Error(`Offline asset CSS image-set is unsupported (${context}); use an embedded url()`);
    if (!identifier) index++;
  }
}

function auditHtml(html, { context = 'HTML', imageData, stripGoogleFonts = false, depth = 0 } = {}) {
  if (depth > 8) throw new Error('Offline asset nesting is too deep');
  const edits = [];
  const replace = (attribute, value) => edits.push({ start: attribute.start, end: attribute.end, value: `${attribute.name}="${escapeAttribute(value)}"` });
  scanHtml(html, tag => {
    if (tag.closing) return;
    const attr = name => tag.attrs.has(name) ? decodeAttribute(tag.attrs.get(name).value) : null;
    if (stripGoogleFonts && tag.name === 'link') {
      const href = attr('href');
      if (href && /^https:\/\/fonts\.(?:googleapis|gstatic)\.com(?:\/|$)/i.test(href)) {
        edits.push({ start: tag.start, end: tag.end, value: '' }); return;
      }
    }
    if (attr('style') !== null) auditCss(attr('style'), `${context} style attribute`, depth);
    if (tag.name === 'style') auditCss(tag.content, `${context} stylesheet`, depth);
    if (tag.name === 'base' || ['object', 'embed', 'applet'].includes(tag.name)) throw new Error(`Offline asset element <${tag.name}> is unsupported (${context})`);
    if (tag.name === 'meta' && (/^refresh$/i.test(attr('http-equiv') || '') || (/^content-security-policy$/i.test(attr('http-equiv') || '') && attr('content') !== offlinePolicy))) {
      throw new Error(`Offline asset meta ${attr('http-equiv')} is unsupported in source (${context})`);
    }
    for (const name of ['srcset', 'imagesrcset', 'ping', 'manifest', 'codebase', 'archive']) {
      if (tag.attrs.has(name)) throw new Error(`Offline asset attribute ${name} is unsupported (${context}); use an embedded single resource`);
    }
    if (tag.name === 'iframe') {
      if (attr('src') !== null && attr('src') !== 'about:blank') throw new Error(`Offline asset iframe must use srcdoc (${context})`);
      if (attr('srcdoc') !== null) {
        auditHtml(attr('srcdoc'), { context: `${context} iframe`, depth: depth + 1 });
      }
    }
    for (const [name, attribute] of tag.attrs) {
      const hrefResource = ['href', 'xlink:href'].includes(name) && !['a', 'link'].includes(tag.name);
      const linkResource = name === 'href' && tag.name === 'link' && !/^(?:canonical|alternate|author|help|license|next|prev)$/i.test(attr('rel') || '');
      const srcResource = name === 'src' && tag.name !== 'iframe';
      if (!hrefResource && !linkResource && !srcResource && !['poster', 'background'].includes(name)) continue;
      const value = decodeAttribute(attribute.value);
      if (tag.name === 'img' && name === 'src' && imageData) replace(attribute, imageData(value));
      else embeddedUrl(value, `${context} <${tag.name}> ${name}`, depth);
    }
  });
  edits.sort((a, b) => b.start - a.start);
  for (const edit of edits) html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
  return html;
}

function withOfflinePolicy(html) {
  let headEnd;
  scanHtml(html, tag => { if (tag.name === 'head' && !tag.closing && headEnd === undefined) headEnd = tag.end; });
  return headEnd === undefined ? policyMeta + html : html.slice(0, headEnd) + policyMeta + html.slice(headEnd);
}

function assertDistinctOutput(source, output) {
  if (path.resolve(source) === path.resolve(output)) throw new Error('Output must not overwrite the source');
  if (!fs.existsSync(output)) return;
  const sourceStat = fs.statSync(source);
  const outputStat = fs.statSync(output);
  if (fs.realpathSync(source) === fs.realpathSync(output) || (sourceStat.dev === outputStat.dev && sourceStat.ino === outputStat.ino)) {
    throw new Error('Output must not overwrite the source (including symlink and hard link aliases)');
  }
}

function createAssets(sourcePath) {
  const sourceDir = path.dirname(path.resolve(sourcePath));
  const realDir = fs.realpathSync(sourceDir);
  const contained = (root, file) => { const relative = path.relative(root, file); return relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative); };
  const localFile = relative => {
    let decoded;
    try { decoded = decodeURIComponent(relative.trim()); } catch { throw new Error(`Invalid visual path: ${relative}`); }
    const absolute = path.resolve(sourceDir, decoded);
    if (path.isAbsolute(decoded) || !contained(sourceDir, absolute)) throw new Error(`Visual must stay beside source: ${relative}`);
    const realFile = fs.realpathSync(absolute);
    if (!contained(realDir, realFile)) throw new Error(`Visual must stay beside source: ${relative}`);
    if (!fs.statSync(realFile).isFile()) throw new Error(`Visual is not a regular file: ${relative}`);
    return realFile;
  };
  const imageData = relative => {
    if (/^data:/i.test(relative)) {
      const { mime } = dataPayload(relative);
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(mime)) throw new Error(`Unsupported image source: ${mime}`);
      embeddedUrl(relative, 'image'); return relative;
    }
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(relative)) throw new Error(`Unsupported image source: ${relative}`);
    const file = localFile(relative);
    const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' }[path.extname(file).toLowerCase()];
    if (!mime) throw new Error(`Unsupported image: ${relative}`);
    const data = fs.readFileSync(file);
    if (mime === 'image/svg+xml') auditHtml(data.toString('utf8'), { context: `SVG ${relative}` });
    return `data:${mime};base64,${data.toString('base64')}`;
  };
  return { localFile, imageData };
}

module.exports = { auditHtml, auditCss, createAssets, assertDistinctOutput, policyMeta, withOfflinePolicy };

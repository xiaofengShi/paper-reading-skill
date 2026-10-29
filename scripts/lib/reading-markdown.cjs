// Marked 17 passes token objects to renderers. Keeping extensions at the token
// boundary leaves fenced/indented code and code spans to Markdown's own lexer.
function parseReadingHeader(source) {
  const language = source.match(/^<!-- paper-reading-lang: (en|zh-CN) -->\r?\n/);
  if (!language) throw new Error('Declare the reading language on the first line: <!-- paper-reading-lang: en --> or <!-- paper-reading-lang: zh-CN -->');
  const header = { lang: language[1], theme: 'forest', mode: 'brief' };
  const choices = { theme: ['forest', 'cobalt', 'plum', 'saffron'], mode: ['brief', 'deep'] };
  const seen = new Set();
  let body = source.slice(language[0].length);
  let marker;
  while ((marker = body.match(/^<!-- paper-reading-(theme|mode): ([^\r\n]*?) -->\r?\n/))) {
    const [, key, value] = marker;
    if (seen.has(key)) throw new Error(`Repeated paper-reading ${key} marker`);
    if (!choices[key].includes(value)) throw new Error(`Unknown paper-reading ${key}: ${value}`);
    seen.add(key);
    header[key] = value;
    body = body.slice(marker[0].length);
  }
  return { ...header, body };
}

// TextRenderer retains Markdown's HTML entities. Escape markup once while
// preserving those references, so both `A & B` and `A &amp; B` display correctly.
function escapeMarkdownText(text, esc) {
  return esc(text).replace(/&amp;((?:#\d+|#x[\da-f]+|[a-z][\da-z]*);)/gi, '&$1');
}
function renderReadingMarkdown(Marked, source, { esc, imageData, katex, labels, blocks, renderArchify }) {
  let heroMap = null;
  let title = 'Paper Reading';
  let foundTitle = false;
  let visualCount = 0;
  const sections = [];
  const sourcePattern = /（PDF[^）]+）|\(PDF[^)]+\)|，PDF pp?\.\s*\d+(?:[–-]\d+)?(?=。)|PDF pp?\.\s*\d+(?:[–-]\d+)?/;
  const markdown = new Marked({
    gfm: true,
    extensions: [
      {
        name: 'readingDisplayMath', level: 'block',
        tokenizer(text) {
          const match = /^ {0,3}\$\$([\s\S]+?)\$\$[ \t]*(?:\n|$)/.exec(text);
          if (match) return { type: 'readingDisplayMath', raw: match[0], math: match[1].trim() };
        },
        renderer(token) {
          visualCount++;
          return `<div class="display-math">${katex.renderToString(token.math, { output: 'htmlAndMathml', displayMode: true, throwOnError: true })}</div>`;
        },
      },
      {
        name: 'readingInlineMath', level: 'inline',
        start: text => text.indexOf('$'),
        tokenizer(text) {
          if (this.lexer.state.inRawBlock) return;
          const match = /^\$([^$\n]+)\$([，。；：、,.;:]?)/.exec(text);
          if (match) return { type: 'readingInlineMath', raw: match[0], math: match[1].trim(), punctuation: match[2] };
        },
        renderer: token => `<span class="inline-math">${katex.renderToString(token.math, { output: 'htmlAndMathml', throwOnError: true })}${esc(token.punctuation)}</span>`,
      },
      {
        name: 'readingSourceRef', level: 'inline',
        start: text => text.search(sourcePattern),
        tokenizer(text) {
          if (this.lexer.state.inRawBlock) return;
          const match = sourcePattern.exec(text);
          if (match?.index === 0) return { type: 'readingSourceRef', raw: match[0] };
        },
        renderer: token => `<span class="source-ref">${esc(token.raw)}</span>`,
      },
      {
        name: 'readingArchify', level: 'block',
        tokenizer(text) {
          const match = /^ {0,3}<!-- archify:([^|>]+)\|([^>]+) -->[ \t]*(?:\n|$)/.exec(text);
          if (match) return { type: 'readingArchify', raw: match[0], file: match[1], title: match[2].trim() };
        },
        renderer(token) { visualCount++; return renderArchify(token.file, token.title); },
      },
      { name: 'readingVisual', renderer: token => token.html },
      {
        name: 'readingFigure',
        renderer(token) {
          visualCount++;
          const image = this.parser.renderer.image(token.image);
          const caption = this.parser.parseInline(token.caption.tokens);
          return `<figure class="paper-figure"><div class="figure-hint">${labels.inspectFigure}</div><div class="figure-viewport" tabindex="0" aria-label="${labels.inspectFigure}">${image}</div><figcaption>${caption}</figcaption></figure>`;
        },
      },
    ],
    hooks: {
      processAllTokens(tokens) {
        const topLevel = new Set(tokens);
        markdown.walkTokens(tokens, token => {
          if (!topLevel.has(token) && ((token.type === 'code' && Object.hasOwn(blocks, token.lang)) || ['readingArchify', 'readingDisplayMath'].includes(token.type))) {
            throw new Error('Custom visual blocks and display math must be at the top level');
          }
        });
        for (const token of tokens) {
          if (token.type !== 'code' || !Object.hasOwn(blocks, token.lang)) continue;
          const data = JSON.parse(token.text);
          let html;
          if (token.lang === 'paper-map' && !heroMap) {
            blocks[token.lang](data); // Validate before lifting the first map into the hero.
            heroMap = data; html = '';
          } else { html = blocks[token.lang](data); visualCount++; }
          Object.assign(token, { type: 'readingVisual', html });
        }
        // A standalone Markdown image, a blank line, and a single italic caption.
        // Using tokens also supports image titles/references and nested bold text.
        for (let i = 0; i < tokens.length; i++) {
          const image = tokens[i];
          const gap = tokens[i + 1];
          const caption = tokens[i + 2];
          if (image.type !== 'paragraph' || image.tokens.length !== 1 || image.tokens[0].type !== 'image' || gap?.type !== 'space' || caption?.type !== 'paragraph' || caption.tokens.length !== 1 || caption.tokens[0].type !== 'em' || /\n/.test(caption.tokens[0].raw)) continue;
          tokens.splice(i, 3, { type: 'readingFigure', raw: image.raw + gap.raw + caption.raw, image: image.tokens[0], caption: caption.tokens[0] });
        }
        return tokens;
      },
    },
    renderer: {
      image(token) {
        const alt = this.parser.parseInline(token.tokens, this.parser.textRenderer);
        return `<img src="${imageData(token.href)}" alt="${escapeMarkdownText(alt, esc)}"${token.title ? ` title="${esc(token.title)}"` : ''} loading="lazy" decoding="async">`;
      },
      heading({ depth, tokens }) {
        const heading = this.parser.parseInline(tokens);
        const textOnly = Object.create(this.parser.textRenderer);
        textOnly.html = () => '';
        const text = this.parser.parseInline(tokens, textOnly);
        if (depth === 1 && !foundTitle) { title = text; foundTitle = true; return ''; }
        if (depth === 2) {
          const id = `section-${sections.length + 1}`;
          sections.push({ id, heading: text });
          return `<h2 id="${id}">${heading}</h2>\n`;
        }
        return `<h${depth}>${heading}</h${depth}>\n`;
      },
    },
  });
  const body = markdown.parse(source);
  return { body, heroMap, title, sections, visualCount };
}

module.exports = { parseReadingHeader, renderReadingMarkdown, escapeMarkdownText };

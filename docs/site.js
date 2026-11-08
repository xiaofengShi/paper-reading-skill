// Progressive enhancements only: the readings and install commands work without JS.
(() => {
  const english = document.documentElement.lang === 'en';
  for (const button of document.querySelectorAll('.copy-code')) {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const block = button.closest('.copy-block');
      const code = block.querySelector('code');
      const status = block.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(code.textContent);
        status.textContent = english ? 'Copied to clipboard.' : '已复制到剪贴板。';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = english ? 'Text selected. Press Ctrl+C or ⌘C to copy.' : '已选中文字，请按 Ctrl+C 或 ⌘C 复制。';
      }
    });
  }
  const filter = document.querySelector('.gallery-filter');
  if (!filter) return;
  const entries = [...document.querySelectorAll('[data-reading-lang]')];
  if (!entries.length) return;
  const list = document.querySelector('#reading-list');
  const groups = [...list.querySelectorAll('.gallery-group')];
  const groupOrder = new Map(groups.map((group, index) => [group.dataset.group, index]));
  const controls = document.querySelector('.gallery-controls');
  const search = controls.querySelector('input');
  const pagination = document.querySelector('.gallery-pagination');
  const previous = pagination.querySelector('[data-page="previous"]');
  const next = pagination.querySelector('[data-page="next"]');
  const pageSize = 6;
  const searchable = entries.map(entry => entry.textContent.toLowerCase());
  let language = 'all';
  let tag = 'all';
  let mode = 'all';
  let page = 0;
  function render() {
    const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matching = entries.filter((entry, index) =>
      (language === 'all' || entry.dataset.readingLang === language) &&
      (tag === 'all' || entry.dataset.tags.split(' ').includes(tag)) &&
      (mode === 'all' || entry.dataset.readingMode === mode) &&
      words.every(word => searchable[index].includes(word)));
    const grouped = language !== 'all' || tag !== 'all' || mode !== 'all' || words.length > 0;
    if (grouped) {
      // Stable sorting preserves newest-first order within each topic.
      matching.sort((a, b) => groupOrder.get(a.dataset.primaryTag) - groupOrder.get(b.dataset.primaryTag));
    }
    const pages = Math.max(1, Math.ceil(matching.length / pageSize));
    page = Math.min(page, pages - 1);
    const visible = new Set(matching.slice(page * pageSize, (page + 1) * pageSize));
    for (const entry of entries) {
      entry.hidden = !visible.has(entry);
      if (entry.hidden) entry.querySelector('details').open = false;
    }
    if (!grouped) list.append(...entries, ...groups);
    for (const group of groups) {
      const members = entries.filter(entry => entry.dataset.primaryTag === group.dataset.group);
      if (grouped) list.append(group, ...members);
      group.hidden = !grouped || !members.some(entry => visible.has(entry));
      group.querySelector('span').textContent = String(matching.filter(entry => entry.dataset.primaryTag === group.dataset.group).length);
    }
    const start = matching.length ? page * pageSize + 1 : 0;
    const end = Math.min((page + 1) * pageSize, matching.length);
    controls.querySelector('.gallery-status').textContent = english
      ? `${start}–${end} of ${matching.length} readings`
      : `显示 ${start}–${end} 篇，共 ${matching.length} 篇`;
    document.querySelector('.gallery-empty').hidden = matching.length !== 0;
    pagination.hidden = pages <= 1;
    previous.disabled = page === 0;
    next.disabled = page === pages - 1;
    pagination.querySelector('.gallery-page').textContent = english
      ? `Page ${page + 1} of ${pages}` : `第 ${page + 1} / ${pages} 页`;
  }
  controls.hidden = false;
  const reset = controls.querySelector('.gallery-reset');
  reset.addEventListener('click', () => {
    language = tag = mode = 'all';
    page = 0;
    search.value = '';
    for (const button of filter.querySelectorAll('[data-filter]')) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === 'all'));
    }
    render();
    search.focus({ preventScroll: true });
  });
  search.addEventListener('input', () => { page = 0; render(); });
  for (const button of filter.querySelectorAll('[data-filter]')) {
    button.addEventListener('click', () => {
      if (button.dataset.filterKind === 'tag') tag = button.dataset.filter;
      else if (button.dataset.filterKind === 'mode') mode = button.dataset.filter;
      else language = button.dataset.filter;
      page = 0;
      for (const peer of button.closest('[data-filter-scope]').querySelectorAll('[data-filter]')) {
        peer.setAttribute('aria-pressed', String(peer === button));
      }
      render();
    });
  }
  for (const button of [previous, next]) {
    button.addEventListener('click', () => {
      page += button === next ? 1 : -1;
      render();
      const firstLink = list.querySelector('[data-reading-lang]:not([hidden]) strong a');
      firstLink.focus({ preventScroll: true });
      firstLink.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  }
  render();
})();

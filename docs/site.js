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
  filter.hidden = false;
  const groups = [...document.querySelectorAll('.gallery-group')];
  const list = document.querySelector('#readings ul');
  const state = { lang: 'all', tag: 'all' };
  const apply = () => {
    for (const entry of entries) {
      const langOk = state.lang === 'all' || entry.dataset.readingLang === state.lang;
      const tags = (entry.dataset.tags || '').split(' ').filter(Boolean);
      const tagOk = state.tag === 'all' || tags.includes(state.tag);
      entry.hidden = !(langOk && tagOk);
    }
    const flat = state.tag !== 'all';
    if (list) {
      let current = null;
      const counts = new Map();
      for (const li of list.children) {
        if (li.classList.contains('gallery-group')) {
          current = flat ? null : li;
          li.hidden = flat;
          if (current) counts.set(current, 0);
        } else if (current && !li.hidden) {
          counts.set(current, counts.get(current) + 1);
        }
      }
      for (const [group, count] of counts) group.hidden = count === 0;
    }
    const count = entries.filter(entry => !entry.hidden).length;
    filter.querySelector('.gallery-status').textContent = english ? `${count} readings shown` : `显示 ${count} 份阅读文档`;
  };
  for (const button of filter.querySelectorAll('[data-filter]')) {
    button.addEventListener('click', () => {
      const row = button.closest('[data-filter-scope]');
      if (!row) return;
      for (const peer of row.querySelectorAll('[data-filter]')) {
        peer.setAttribute('aria-pressed', String(peer === button));
      }
      state[button.dataset.filterKind] = button.dataset.filter;
      apply();
    });
  }
})();

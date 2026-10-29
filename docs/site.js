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
  for (const button of filter.querySelectorAll('[data-filter]')) {
    button.addEventListener('click', () => {
      for (const peer of filter.querySelectorAll('[data-filter]')) {
        peer.setAttribute('aria-pressed', String(peer === button));
      }
      for (const entry of entries) {
        entry.hidden = button.dataset.filter !== 'all' && entry.dataset.readingLang !== button.dataset.filter;
      }
      const count = entries.filter(entry => !entry.hidden).length;
      filter.querySelector('.gallery-status').textContent = english ? `${count} readings shown` : `显示 ${count} 份阅读文档`;
    });
  }
})();

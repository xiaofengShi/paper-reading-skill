"""Browser checks. Run with with_server.py and a Python environment with Playwright.
Uses the locally installed Google Chrome; no browser download is needed.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
BASE = 'http://127.0.0.1:8796/'
READINGS = json.loads((ROOT / 'readings.json').read_text())['readings']
results = []


def check(name, condition, details=None):
    if not condition:
        raise AssertionError(f'{name}: {details}')
    results.append({'check': name, 'passed': True, **({'details': details} if details is not None else {})})


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless=True)
    context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
    page = context.new_page()
    errors = []
    external = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda request: external.append(request.url) if not request.url.startswith(BASE) else None)
    for file in ['index.html', 'zh.html']:
        for width in [320, 375, 768, 1024, 1440]:
            page.set_viewport_size({'width': width, 'height': 900 if width > 760 else 667})
            page.goto(BASE + file)
            page.wait_for_load_state('networkidle')
            dimensions = page.evaluate('({scroll:document.documentElement.scrollWidth, viewport:innerWidth})')
            check(f'{file} {width}px no horizontal page overflow', dimensions['scroll'] <= dimensions['viewport'], dimensions)
            check(f'{file} {width}px all header routes visible', all(page.locator('.site-header nav a').nth(i).is_visible() for i in range(5)))
            check(f'{file} {width}px initial six readings', page.locator('[data-reading-lang]:visible').count() == 6)
            if width in [375, 1440]:
                page.screenshot(path=str(OUT / f'{file[:-5]}-{width}-hero.png'))
                page.locator('.gallery-controls').scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f'{file[:-5]}-{width}-gallery.png'))
            page.locator('[data-filter-kind="mode"][data-filter="deep"]').click()
            expected = len([r for r in READINGS if r['mode'] == 'deep'])
            check(f'{file} {width}px Deep filter', page.locator('[data-reading-lang]:visible').count() == min(6, expected))
            page.locator('[data-filter-kind="lang"][data-filter="en"]').click()
            expected = len([r for r in READINGS if r['mode'] == 'deep' and r['lang'] == 'en'])
            check(f'{file} {width}px combined filters', page.locator('[data-reading-lang]:visible').count() == min(6, expected))
            page.locator('.gallery-reset').click()
            check(f'{file} {width}px reset restores filters and focus', page.locator('[data-reading-lang]:visible').count() == 6 and page.locator('.gallery-search input').evaluate('(el)=>el===document.activeElement'))
            page.locator('.gallery-search input').fill('no-reading-exists-938231')
            check(f'{file} {width}px empty state', page.locator('.gallery-empty').is_visible() and page.locator('[data-reading-lang]:visible').count() == 0)
            page.locator('.gallery-reset').click()
            page.locator('.gallery-search input').fill('2106.09685')
            check(f'{file} {width}px full-catalog arXiv search', page.locator('[data-reading-lang]:visible strong a').filter(has_text='LoRA').count() >= 1)
            page.locator('.gallery-reset').click()
            before = page.locator('[data-reading-lang]:visible strong a').all_text_contents()
            page.locator('[data-page="next"]').click()
            after = page.locator('[data-reading-lang]:visible strong a').all_text_contents()
            check(f'{file} {width}px pagination changes entries', before != after)
            focus = page.evaluate('''()=>{const el=document.activeElement,r=el.getBoundingClientRect();return {visible:r.top>=0&&r.bottom<=innerHeight, tag:el.tagName, reading:!!el.closest('[data-reading-lang]')}}''')
            check(f'{file} {width}px pagination focus stays in viewport', focus['visible'] and focus['tag'] == 'A' and focus['reading'], focus)
            page.locator('.gallery-reset').click()
            page.locator('[data-filter-kind="tag"][data-filter="RL"]').click()
            expected = len([r for r in READINGS if 'RL' in r.get('tags', [])])
            check(f'{file} {width}px topic filter', page.locator('[data-reading-lang]:visible').count() == min(6, expected))
        page.goto(BASE + file)
        page.wait_for_load_state('networkidle')
        code = page.locator('.copy-block code').first.inner_text()
        page.locator('.copy-code').first.click()
        check(f'{file} clipboard matches command', page.evaluate('navigator.clipboard.readText()') == code)
        page.keyboard.press('Tab')
        check(f'{file} keyboard focus is visible', page.evaluate('getComputedStyle(document.activeElement).outlineStyle!=="none"'))
        page.emulate_media(media='print')
        check(f'{file} print includes all readings', page.locator('[data-reading-lang]:visible').count() == len(READINGS))
        check(f'{file} print hides interactive controls', not page.locator('.gallery-controls').is_visible())
        page.emulate_media(media='screen', reduced_motion='reduce')
        check(f'{file} reduced motion disables smooth scrolling', page.evaluate('getComputedStyle(document.documentElement).scrollBehavior') == 'auto')
        page.emulate_media(reduced_motion='no-preference')
    check('no page JavaScript errors', not errors, errors)
    check('homepage makes no external network requests', not external, external)
    context.close()

    fallback = browser.new_context()
    fallback.add_init_script('Object.defineProperty(navigator,"clipboard",{value:{writeText:()=>Promise.reject(new Error("denied"))}})')
    page = fallback.new_page()
    page.goto(BASE + 'index.html')
    page.wait_for_load_state('networkidle')
    page.locator('.copy-code').first.click()
    check('clipboard denial selects the command for manual copy', page.evaluate('getSelection().getRangeAt(0).toString()') == page.locator('.copy-block code').first.text_content())
    fallback.close()

    for file in ['index.html', 'zh.html']:
        offline = browser.new_context(java_script_enabled=False, offline=True, viewport={'width':375,'height':667})
        page = offline.new_page()
        page.goto((ROOT / 'docs' / file).as_uri())
        check(f'{file} offline without JavaScript exposes all readings', page.locator('[data-reading-lang]:visible').count() == len(READINGS))
        check(f'{file} no-script controls stay hidden', not page.locator('.gallery-controls').is_visible() and not page.locator('.copy-code').first.is_visible())
        summary = page.locator('#reading-list details summary').first
        summary.focus()
        page.keyboard.press('Enter')
        check(f'{file} no-script summaries work with keyboard', page.locator('#reading-list details').first.get_attribute('open') is not None)
        check(f'{file} offline preview image loads', page.locator('.hero-visual img').evaluate('(el)=>el.complete&&el.naturalWidth>0'))
        offline.close()
    browser.close()

(OUT / 'browser-checks.json').write_text(json.dumps({'browser':'Google Chrome / Playwright','checks':results}, ensure_ascii=False, indent=2)+'\n')
print(f'Passed {len(results)} browser checks')

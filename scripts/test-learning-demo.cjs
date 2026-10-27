const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

// Arithmetic/handler checks only. Real iframe controls are exercised separately
// in a browser; this DOM stub does not establish keyboard or visual behavior.
function loadDemo() {
  const html = fs.readFileSync(path.join(__dirname, '../examples/lora-rank.workflow.html'), 'utf8');
  const elements = new Map();
  const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { value: ({ x1: 2, x3: 1, rank: 3 })[id], style: {}, handlers: {}, attributes: {},
      addEventListener(name, handler) { this.handlers[name] = handler; },
      setAttribute(name, value) { this.attributes[name] = value; } });
    return elements.get(id);
  } };
  const context = vm.createContext({ document });
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  return { context, element: id => document.getElementById(id) };
}

test('LoRA worked example handles positive, zero and reversed corrections and preserves merging', () => {
  const { context } = loadDemo();
  const examples = [
    [2, 1, [3, 3, 1, 3], [1, 2, 0, -1]],
    [1, 1, [1, 1, 1, 3], [0, 0, 0, 0]],
    [-1, 2, [-4, -5, 2, 5], [-3, -6, 0, 3]],
  ];
  for (const [x1, x3, expected, delta] of examples) {
    const result = context.loraExample(x1, x3);
    assert.deepEqual(Array.from(result.sum), expected);
    assert.deepEqual(Array.from(result.delta, v => v === 0 ? 0 : v), delta);
  }
  for (let x1 = -2; x1 <= 3; x1++) for (let x3 = -2; x3 <= 3; x3++) {
    const result = context.loraExample(x1, x3);
    assert.deepEqual(Array.from(result.merged), Array.from(result.sum));
  }
});

test('budget controls remain independent of the rank-1 example and reset restores the baseline', () => {
  const { element } = loadDemo();
  element('x1').value = -1; element('x3').value = 2;
  element('x1').handlers.input();
  assert.equal(element('sum').textContent, '(-4, -5, 2, 5)');
  for (const [index, count, ratio] of [[0, '8,192', '0.048828125%'], [7, '1,048,576', '6.25%']]) {
    element('rank').value = index; element('rank').handlers.input();
    assert.equal(element('count').textContent, count);
    assert.equal(element('ratio').textContent, ratio);
    assert.equal(element('sum').textContent, '(-4, -5, 2, 5)');
  }
  element('reset').handlers.click();
  assert.equal(element('sum').textContent, '(3, 3, 1, 3)');
});

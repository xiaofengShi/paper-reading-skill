<!-- paper-reading-lang: en -->
<!-- paper-reading-theme: cobalt -->
# SYNTHETIC SMOKE TEST

This tiny fixture tests rendering only. Its diagram, equation, and values are invented test data, not a paper or scientific evidence.

```paper-map
{"thesis":"Synthetic data exercises the renderer without a downloaded paper.","items":[{"number":"01","label":"Renderer check","text":"Check local assets, math, and navigation.","source":"Synthetic smoke fixture; not a paper"}]}
```

## Rendering checks

The synthetic equation $x+1=2$ should stay inline. A display equation follows.

$$
y=2x
$$

This invented diagram checks local SVG embedding.

![Synthetic diagram: an input is connected to an output](smoke-diagram.svg)

*Synthetic diagram for a renderer test, not an original paper figure.*

```paper-chart
{"type":"bars","title":"Synthetic values","unit":" test units","source":"Synthetic smoke fixture; not measured results","rows":[{"label":"A","value":1},{"label":"B","value":2}]}
```

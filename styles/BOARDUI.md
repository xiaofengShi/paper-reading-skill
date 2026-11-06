# BoardUI source and static-site integration

The homepage vendors official source from [BoardUI](https://github.com/BoardUI/boardui), installed with `boardui@0.5.9 add button --yes` from the public [component registry](https://www.boardui.com/r/registry.json) on 2026-11-06. The BoardUI agent skill reports version `2026.11.5`; the live registry is a separate, mutable source and is recorded below by SHA-256.

`components/base/buttons/button.tsx`, `utils/`, `theme.css`, `typography.css`, and `globals.css` retain their upstream source. `site.css` supplies this project's layout and accent mapping. `scripts/build-site-ui.tsx` renders the real Button/ButtonLink components to static markup at build time. React, Tailwind, esbuild and icons are development dependencies; visitors receive local CSS and a small progressive-enhancement script, with all reading links available without JavaScript. The reading renderer and examples use their existing styles.

Refresh upstream source deliberately and review changes before replacing it. A plain `npm run build:docs` uses checked-in source and the lockfile; it does not fetch the registry. `npm run check:docs` checks compiled CSS and both homepages.

| Vendored file | SHA-256 at installation |
| --- | --- |
| `utils/cx.ts` | `db35ea5afa8b2e0fd51319bc49288c4df7c98ec53440b43903636a32e3319d9d` |
| `utils/directional-icon.ts` | `02692ff42abfea0e3ddf0ca79cd1f816cdce65f923efb0d61d2f3663a9202c47` |
| `styles/theme.css` | `3c7fcc7710b0f44be0d86bc8e822e88f737d0269d207e9e2f4d2e73fd6da8f34` |
| `styles/typography.css` | `dfd4e9b446998d063efe96a47fc31fd2492639bf641d0da1b60645fe4dcc32a1` |
| `styles/globals.css` | `672abee06f77039727bd7d65e4a248c00d7cc693609103eff187a367d9347259` |
| `components/base/buttons/button.tsx` | `b147c988c73dd8c226ab6ede3d7019eac9a7125191bbd646fcdd25bea803ca41` |

## Upstream MIT license

See [LICENSE.BoardUI.txt](LICENSE.BoardUI.txt). The docs build includes the complete notice in the generated stylesheet, so standalone GitHub Pages distributions retain it.

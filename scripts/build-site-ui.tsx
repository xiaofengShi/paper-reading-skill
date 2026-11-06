// BoardUI is rendered at build time. The published pages need no React runtime.
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, ButtonLink } from '@/components/base/buttons/button';

export function button(label: string, props: Record<string, unknown> = {}) {
  return renderToStaticMarkup(<Button variant="secondary" {...props}>{label}</Button>);
}

export function buttonLink(label: string, href: string, primary = false) {
  return renderToStaticMarkup(<ButtonLink variant={primary ? 'primary' : 'secondary'} href={href} className="site-action">{label}</ButtonLink>);
}

'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    background: '#141c2b',
    primaryColor: '#1b2537',
    primaryBorderColor: '#26324a',
    primaryTextColor: '#e8edf5',
    lineColor: '#8a98b0',
    secondaryColor: '#141c2b',
    tertiaryColor: '#141c2b',
    fontFamily: 'var(--font-plex-mono)',
  },
});

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;
    const id = `m-${Math.random().toString(36).slice(2)}`;
    mermaid
      .render(id, chart)
      .then((res) => {
        if (!cancelled) setSvg(res.svg);
      })
      .catch(() => {
        if (!cancelled) setSvg('<pre>diagram failed to render</pre>');
      });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return <div ref={ref} className="my-6 overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}

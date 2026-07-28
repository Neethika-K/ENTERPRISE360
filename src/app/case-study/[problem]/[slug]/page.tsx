import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from '@/components/case-study/Mermaid';
import { getProblem, problems } from '@/content/case-study/problems';

export function generateStaticParams() {
  return problems.flatMap((p) => p.docs.map((slug) => ({ problem: p.slug, slug })));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ problem: string; slug: string }>;
}) {
  const { problem, slug } = await params;
  const p = getProblem(problem);
  if (!p || !p.docs.includes(slug as (typeof p.docs)[number])) notFound();

  const file = path.join(process.cwd(), 'src/content/case-study', problem, `${slug}.md`);
  const md = fs.readFileSync(file, 'utf8');
  return (
    <div className="doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const text = String(children);
            if (className?.includes('language-mermaid')) return <Mermaid chart={text.replace(/\n$/, '')} />;
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}

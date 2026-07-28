import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from '@/components/case-study/Mermaid';

const SLUGS = ['charter', 'status-report', 'roadmap', 'sprint-plan', 'retrospective'] as const;
type Slug = (typeof SLUGS)[number];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export default async function DeliveryDoc({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUGS.includes(slug as Slug)) notFound();

  const file = path.join(process.cwd(), 'src/content/delivery', `${slug}.md`);
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

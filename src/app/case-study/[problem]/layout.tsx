import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProblem, problems } from '@/content/case-study/problems';

const LABEL: Record<string, string> = {
  brd: 'BRD',
  frd: 'FRD',
  'user-stories': 'User Stories',
  'process-flow': 'Process Flow',
};

export function generateStaticParams() {
  return problems.map((p) => ({ problem: p.slug }));
}

export default async function ProblemLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ problem: string }>;
}) {
  const { problem } = await params;
  const p = getProblem(problem);
  if (!p) notFound();
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[210px_1fr]">
      <aside className="md:sticky md:top-8 md:self-start">
        <Link href="/case-study" className="eyebrow mb-3 block hover:text-text">
          ← All problems
        </Link>
        <nav className="flex flex-col gap-1">
          <Link
            href={`/case-study/${p.slug}`}
            className="rounded-[var(--radius)] px-2 py-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:bg-panel hover:text-text"
          >
            Overview
          </Link>
          {p.docs.map((d) => (
            <Link
              key={d}
              href={`/case-study/${p.slug}/${d}`}
              className="rounded-[var(--radius)] px-2 py-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:bg-panel hover:text-text"
            >
              {LABEL[d]}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}

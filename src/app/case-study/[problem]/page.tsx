import Link from 'next/link';
import { notFound } from 'next/navigation';
import TraceabilityTable from '@/components/case-study/TraceabilityTable';
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

export default async function ProblemOverview({ params }: { params: Promise<{ problem: string }> }) {
  const { problem } = await params;
  const p = getProblem(problem);
  if (!p) notFound();
  return (
    <div className="doc">
      <div className="eyebrow">Case study</div>
      <h1>{p.title}</h1>
      <p>{p.blurb}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {p.docs.map((d) => (
          <Link
            key={d}
            href={`/case-study/${p.slug}/${d}`}
            className="panel block p-4 no-underline transition-colors hover:border-accent"
          >
            <div className="font-display text-base font-semibold text-text">{LABEL[d]}</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-10">Requirements Traceability Matrix</h2>
      <p>Every requirement → user story → acceptance criteria → the feature that ships it. Click a header to sort.</p>
      <div className="mt-4">
        <TraceabilityTable rows={p.rtm} />
      </div>
    </div>
  );
}

import Link from 'next/link';
import { problems } from '@/content/case-study/problems';

export default function CaseStudyHub() {
  return (
    <div className="doc">
      <div className="eyebrow">Problem library</div>
      <h1>Business Analysis case studies</h1>
      <p>
        Each problem is a complete BA package — requirements, user stories, process
        flow, and a traceability matrix mapping every requirement to a working feature.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {problems.map((p) => (
          <Link
            key={p.slug}
            href={`/case-study/${p.slug}`}
            className="panel block p-4 no-underline transition-colors hover:border-accent"
          >
            <div className="font-display text-base font-semibold text-text">{p.title}</div>
            <div className="mt-1 text-sm text-muted">{p.blurb}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

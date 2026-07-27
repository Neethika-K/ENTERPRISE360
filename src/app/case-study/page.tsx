import Link from 'next/link';

const deliverables = [
  ['BRD', 'Business Requirements — the problem, objectives, stakeholders, scope, metrics', '/case-study/brd'],
  ['FRD', 'Functional Requirements — FR-1…FR-10, each mapped to an engine rule', '/case-study/frd'],
  ['User Stories', 'US-1…US-8 with Given/When/Then acceptance criteria', '/case-study/user-stories'],
  ['Process Flow', 'The Order-to-Cash × Procure-to-Pay swimlane', '/case-study/process-flow'],
  ['Traceability (RTM)', 'Every requirement → story → acceptance → the feature that ships it', '/case-study/rtm'],
] as const;

export default function CaseStudyIndex() {
  return (
    <div className="doc">
      <div className="eyebrow">Flagship problem</div>
      <h1>Inventory Shortage → Procurement</h1>
      <p>
        A complete Business Analysis package for the problem this platform simulates:
        how a mid-size omnichannel retailer stops running out of stock by automating
        the reorder loop — and how every requirement traces to a working feature.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {deliverables.map(([title, desc, href]) => (
          <Link key={href} href={href} className="panel block p-4 no-underline transition-colors hover:border-accent">
            <div className="font-display text-base font-semibold text-text">{title}</div>
            <div className="mt-1 text-sm text-muted">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

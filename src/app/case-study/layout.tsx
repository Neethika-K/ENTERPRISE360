import Link from 'next/link';

const docs = [
  ['Overview', '/case-study'],
  ['BRD', '/case-study/brd'],
  ['FRD', '/case-study/frd'],
  ['User Stories', '/case-study/user-stories'],
  ['Process Flow', '/case-study/process-flow'],
  ['Traceability (RTM)', '/case-study/rtm'],
] as const;

export default function CaseStudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[210px_1fr]">
      <aside className="md:sticky md:top-8 md:self-start">
        <div className="eyebrow mb-3">Case Study</div>
        <nav className="flex flex-col gap-1">
          {docs.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-[var(--radius)] px-2 py-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:bg-panel hover:text-text"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}

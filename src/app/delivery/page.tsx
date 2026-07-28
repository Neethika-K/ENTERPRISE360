import Link from 'next/link';

const artifacts = [
  ['Project Charter', 'Vision, objectives, scope, stakeholders, milestones', '/delivery/charter', 'PM'],
  ['RAID Log', 'Risks, Assumptions, Issues, Dependencies — sortable', '/delivery/raid', 'PM'],
  ['Status Report', 'Where the project stands, accomplishments, metrics', '/delivery/status-report', 'PM'],
  ['Product Roadmap', 'Delivered increments and what is next', '/delivery/roadmap', 'Agile'],
  ['Sprint Plan', 'Each problem as an independent sprint', '/delivery/sprint-plan', 'Agile'],
  ['Retrospective', 'What went well, what was tricky, what to improve', '/delivery/retrospective', 'Agile'],
] as const;

export default function DeliveryIndex() {
  return (
    <div className="doc">
      <div className="eyebrow">Project management &amp; delivery</div>
      <h1>How Enterprise360 was delivered</h1>
      <p>
        The project-management and Agile artifacts behind the build — the charter and RAID
        log that framed it, the status and roadmap that tracked it, and the sprint plan and
        retrospective that ran it. Each reflects this actual project, not a template.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {artifacts.map(([title, desc, href, tag]) => (
          <Link key={href} href={href} className="panel block p-4 no-underline transition-colors hover:border-accent">
            <div className="flex items-center justify-between">
              <div className="font-display text-base font-semibold text-text">{title}</div>
              <span className="font-mono text-[0.625rem] uppercase tracking-wider text-muted">{tag}</span>
            </div>
            <div className="mt-1 text-sm text-muted">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

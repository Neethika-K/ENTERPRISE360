// Color-code the system log by event family so the causal chain reads at a glance.
const TONE: Record<string, string> = {
  order_placed: 'text-info',
  demand_spike: 'text-info',
  inventory_decremented: 'text-muted',
  backorder: 'text-alert',
  reorder_triggered: 'text-accent',
  pr_created: 'text-accent',
  pr_approved: 'text-accent',
  po_placed: 'text-accent',
  po_delayed: 'text-alert',
  po_received: 'text-positive',
  inventory_replenished: 'text-positive',
  invoice_issued: 'text-muted',
  invoice_paid: 'text-muted',
  kpi_snapshot: 'text-muted',
  ticket_opened: 'text-alert',
  ticket_resolved: 'text-positive',
  return_created: 'text-info',
  return_restocked: 'text-positive',
  return_writeoff: 'text-alert',
  refund_issued: 'text-muted',
  order_flagged: 'text-accent',
  order_cleared: 'text-muted',
  order_rejected: 'text-alert',
  chargeback: 'text-alert',
};

export default function EventFeed({
  events,
}: {
  events: { simDay: number; eventType: string; message: string }[];
}) {
  return (
    <div className="panel p-4">
      <div className="eyebrow mb-3">System Log — audit trail</div>
      <ol className="space-y-1.5 font-mono text-xs">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-10 shrink-0 text-muted">D{String(e.simDay).padStart(2, '0')}</span>
            <span className={`w-40 shrink-0 ${TONE[e.eventType] ?? 'text-muted'}`}>{e.eventType}</span>
            <span className="text-text/90">{e.message}</span>
          </li>
        ))}
        {events.length === 0 && (
          <li className="text-muted">No activity yet — press “Advance Day” to run the company.</li>
        )}
      </ol>
    </div>
  );
}

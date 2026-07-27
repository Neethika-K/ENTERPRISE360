export default function EventFeed({
  events,
}: {
  events: { simDay: number; eventType: string; message: string }[];
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-sm font-medium text-neutral-600">Recent Activity</div>
      <ol className="space-y-2">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="w-14 shrink-0 text-neutral-400">Day {e.simDay}</span>
            <span className="rounded bg-neutral-100 px-1.5 text-xs text-neutral-500">{e.eventType}</span>
            <span className="text-neutral-700">{e.message}</span>
          </li>
        ))}
        {events.length === 0 && (
          <li className="text-sm text-neutral-400">No activity yet — click “Advance Day”.</li>
        )}
      </ol>
    </div>
  );
}

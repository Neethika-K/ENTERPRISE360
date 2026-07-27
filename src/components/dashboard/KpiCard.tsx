export default function KpiCard({
  title,
  value,
  hint,
  tone = 'default',
}: {
  title: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'alert' | 'accent';
}) {
  const toneClass =
    tone === 'positive'
      ? 'text-positive'
      : tone === 'alert'
        ? 'text-alert'
        : tone === 'accent'
          ? 'text-accent'
          : 'text-text';
  return (
    <div className="panel p-4">
      <div className="eyebrow">{title}</div>
      <div className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      {hint && <div className="mt-1 font-mono text-[0.6875rem] text-muted">{hint}</div>}
    </div>
  );
}

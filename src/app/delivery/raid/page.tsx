import RaidTable from '@/components/delivery/RaidTable';
import { raid } from '@/content/delivery/raid';

export default function RaidPage() {
  return (
    <div className="doc">
      <div className="eyebrow">RAID Log</div>
      <h1>Risks, Assumptions, Issues &amp; Dependencies</h1>
      <p>
        The real delivery risks and decisions behind this project — determinism fragility,
        Prisma version drift, the FK-cleanup playbook, and the path to hosting. Click a
        column header to sort.
      </p>
      <div className="mt-4">
        <RaidTable rows={raid} />
      </div>
    </div>
  );
}

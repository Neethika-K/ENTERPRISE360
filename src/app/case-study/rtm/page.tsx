import TraceabilityTable from '@/components/case-study/TraceabilityTable';
import { rtm } from '@/content/case-study/rtm';

export default function RtmPage() {
  return (
    <div className="doc">
      <div className="eyebrow">Requirements Traceability Matrix</div>
      <h1>Every requirement, traced to a working feature</h1>
      <p>
        Each functional requirement maps to a user story, its acceptance criteria,
        and the exact file that implements it. Click a column header to sort.
      </p>
      <div className="mt-4">
        <TraceabilityTable rows={rtm} />
      </div>
    </div>
  );
}

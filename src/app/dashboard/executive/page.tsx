import TickControls from '@/components/dashboard/TickControls';
import EventFeed from '@/components/dashboard/EventFeed';
import { getCurrentDay, getRecentEvents } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

export default async function ExecutivePage() {
  const [day, events] = await Promise.all([getCurrentDay(), getRecentEvents()]);
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Executive</h1>
        <TickControls currentDay={day} />
      </div>
      <EventFeed events={events} />
    </main>
  );
}

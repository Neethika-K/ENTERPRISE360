export interface RtmRow {
  reqId: string;
  description: string;
  userStory: string;
  acceptanceCriteria: string;
  feature: string;
}

export type DocSlug = 'brd' | 'frd' | 'user-stories' | 'process-flow';

export interface Problem {
  slug: string;
  title: string;
  blurb: string;
  docs: DocSlug[];
  rtm: RtmRow[];
}

export const problems: Problem[] = [
  {
    slug: 'inventory-procurement',
    title: 'Inventory Shortage → Procurement',
    blurb:
      'How a mid-size omnichannel retailer stops running out of stock by automating the reorder loop — every requirement traced to a working feature.',
    docs: ['brd', 'frd', 'user-stories', 'process-flow'],
    rtm: [
      {
        reqId: 'FR-1',
        description: 'Generate daily customer demand (incl. spikes)',
        userStory: 'US-5',
        acceptanceCriteria: 'Advancing a day records new orders; spikes occur occasionally',
        feature: 'src/lib/sim/rules/demand.ts · /dashboard/sales',
      },
      {
        reqId: 'FR-2',
        description: 'Fulfil or backorder each line (whole-line)',
        userStory: 'US-5',
        acceptanceCriteria: 'Stock ≥ qty ⇒ filled & decremented; else backordered',
        feature: 'src/lib/sim/rules/fulfillment.ts · /dashboard/sales',
      },
      {
        reqId: 'FR-3',
        description: 'Detect reorder-point breach and raise a request',
        userStory: 'US-1',
        acceptanceCriteria: 'Position < reorder point and no open PR/PO ⇒ pending request',
        feature: 'src/lib/sim/rules/reorder.ts · /dashboard/inventory',
      },
      {
        reqId: 'FR-4',
        description: 'Approve requests by threshold or review delay',
        userStory: 'US-2',
        acceptanceCriteria: 'Under threshold auto-approves; else approved after review period',
        feature: 'src/lib/sim/rules/approval.ts · /dashboard/procurement',
      },
      {
        reqId: 'FR-5',
        description: 'Place a PO against supplier lead time',
        userStory: 'US-3',
        acceptanceCriteria: 'Approved request ⇒ PO with ETA = day + lead time (+ delay)',
        feature: 'src/lib/sim/rules/procurement.ts · /dashboard/procurement',
      },
      {
        reqId: 'FR-6',
        description: 'Receive a PO and replenish stock',
        userStory: 'US-4',
        acceptanceCriteria: 'PO due today ⇒ received; on-hand up, incoming down',
        feature: 'src/lib/sim/rules/receiving.ts · /dashboard/inventory',
      },
      {
        reqId: 'FR-7',
        description: 'Record revenue and cost (instant settlement)',
        userStory: 'US-6',
        acceptanceCriteria: 'Fulfilled sale / received PO ⇒ paid invoice recorded',
        feature: 'src/lib/sim/rules/finance.ts · /dashboard/finance',
      },
      {
        reqId: 'FR-8',
        description: 'Snapshot company KPIs each day',
        userStory: 'US-6',
        acceptanceCriteria: 'Each advanced day writes one KPI snapshot powering trends',
        feature: 'src/lib/sim/rules/kpis.ts · /dashboard/executive',
      },
      {
        reqId: 'FR-9',
        description: 'Five connected department dashboards',
        userStory: 'US-6',
        acceptanceCriteria: 'Views are current and mutually consistent with the log',
        feature: 'src/app/dashboard/* · /dashboard',
      },
      {
        reqId: 'FR-10',
        description: 'Deterministic replay and reset',
        userStory: 'US-7',
        acceptanceCriteria: 'Same seed reproduces events; reset returns to day 0',
        feature: 'src/lib/sim/engine.ts · TickControls',
      },
    ],
  },
  {
    slug: 'customer-service',
    title: 'Supplier Delay → Customer Service → NPS',
    blurb:
      'When a supplier misses or stock runs out, the customer feels it. Tickets, CSAT, and NPS make that ripple visible — and traceable back to the upstream cause.',
    docs: ['brd', 'frd', 'user-stories', 'process-flow'],
    rtm: [
      { reqId: 'FR-CS-1', description: 'Open a ticket for a backordered order', userStory: 'US-CS-1', acceptanceCriteria: 'Order backordered today ⇒ open backorder ticket', feature: 'src/lib/sim/rules/customerService.ts · /dashboard/customer-service' },
      { reqId: 'FR-CS-2', description: 'Open a ticket for a late delivery', userStory: 'US-CS-1', acceptanceCriteria: 'PO received after its ETA ⇒ open late_delivery ticket', feature: 'src/lib/sim/rules/customerService.ts · /dashboard/customer-service' },
      { reqId: 'FR-CS-3', description: 'Resolve tickets after handling time', userStory: 'US-CS-2', acceptanceCriteria: 'currentDay ≥ target ⇒ resolved with resolution day', feature: 'src/lib/sim/rules/customerService.ts' },
      { reqId: 'FR-CS-4', description: 'Score CSAT (biased by wait/category)', userStory: 'US-CS-3', acceptanceCriteria: 'Resolved ticket gets CSAT 1–5, lower for long waits/backorders', feature: 'src/lib/sim/rules/customerService.ts' },
      { reqId: 'FR-CS-5', description: 'Compute NPS / CSAT / backlog KPIs', userStory: 'US-CS-4', acceptanceCriteria: 'Daily snapshot carries nps, csat, openTickets, avgResolutionDays', feature: 'src/lib/sim/rules/kpis.ts · /dashboard/executive' },
      { reqId: 'FR-CS-6', description: 'Customer Service dashboard + Exec NPS', userStory: 'US-CS-5', acceptanceCriteria: 'CS view shows NPS/CSAT/tickets; Executive shows NPS tile', feature: '/dashboard/customer-service · /dashboard/executive' },
    ],
  },
];

export function getProblem(slug: string): Problem | undefined {
  return problems.find((p) => p.slug === slug);
}

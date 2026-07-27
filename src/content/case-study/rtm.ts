export interface RtmRow {
  reqId: string;
  description: string;
  userStory: string;
  acceptanceCriteria: string;
  feature: string;
}

export const rtm: RtmRow[] = [
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
];

export type RaidType = 'Risk' | 'Assumption' | 'Issue' | 'Dependency';

export interface RaidRow {
  ref: string;
  type: RaidType;
  description: string;
  response: string; // impact + mitigation / resolution
  owner: string;
  status: string;
}

export const raid: RaidRow[] = [
  {
    ref: 'R-1',
    type: 'Risk',
    description: 'SQLite is single-writer — limits concurrency and public multi-user hosting.',
    response: 'Local-first for now; a cloud release would switch the Prisma datasource to Postgres.',
    owner: 'Eng',
    status: 'Open (accepted)',
  },
  {
    ref: 'R-2',
    type: 'Risk',
    description: 'Determinism is fragile: reordering pipeline rules or changing RNG draw order alters replay.',
    response: 'New rules appended at the end in a fixed draw order; determinism test compares run-to-run.',
    owner: 'Eng',
    status: 'Mitigated',
  },
  {
    ref: 'R-3',
    type: 'Risk',
    description: 'Prisma major-version drift (v7 removed url-in-schema, requires driver adapters).',
    response: 'Pinned Prisma to v6; upgrade is a deliberate, separate migration.',
    owner: 'Eng',
    status: 'Mitigated',
  },
  {
    ref: 'R-4',
    type: 'Risk',
    description: 'No automated UI / end-to-end tests — only the engine is covered by tests.',
    response: 'Manual browser verification each increment; add Playwright e2e as a follow-up.',
    owner: 'QA',
    status: 'Open',
  },
  {
    ref: 'A-1',
    type: 'Assumption',
    description: 'Time advances only when a visitor clicks — no always-on process.',
    response: 'Keeps hosting free/idle-cost-zero and the demo deterministic.',
    owner: 'Product',
    status: 'Holding',
  },
  {
    ref: 'A-2',
    type: 'Assumption',
    description: 'A curated set of ~6 hero SKUs keeps cause-and-effect legible.',
    response: 'Seed tuned so the reorder cascade fires within the first few days.',
    owner: 'Product',
    status: 'Holding',
  },
  {
    ref: 'I-1',
    type: 'Issue',
    description: 'Chargebacks were too rare to demo (fraud must also be fulfilled, not backordered).',
    response: 'Raised flag/fraud rates so chargebacks surface within ~20 days. Resolved.',
    owner: 'Eng',
    status: 'Closed',
  },
  {
    ref: 'I-2',
    type: 'Issue',
    description: 'Stale .next generated types referenced deleted routes after the hub refactor.',
    response: 'Cleared .next and rebuilt to regenerate route types. Resolved.',
    owner: 'Eng',
    status: 'Closed',
  },
  {
    ref: 'I-3',
    type: 'Issue',
    description: 'Adding an FK table broke the whole suite (parents deleted before children).',
    response: 'Add each new table to the three cleanup lists (setup/seed/reset) before its parents.',
    owner: 'Eng',
    status: 'Closed (playbook)',
  },
  {
    ref: 'D-1',
    type: 'Dependency',
    description: 'Node runtime provisioned via nvm (no system Node on the build machine).',
    response: 'Node 20 LTS pinned; documented in the README and project memory.',
    owner: 'Eng',
    status: 'Resolved',
  },
  {
    ref: 'D-2',
    type: 'Dependency',
    description: 'A future public demo depends on a hosted Postgres + host (e.g. Neon + Vercel).',
    response: 'Accounts to be created at deploy time; app logic unchanged by the swap.',
    owner: 'Eng',
    status: 'Future',
  },
];

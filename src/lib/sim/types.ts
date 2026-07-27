import type { Prisma } from '@prisma/client';

export interface SimEventInput {
  eventType: string;
  entityType?: string;
  entityId?: number;
  message: string;
  payload?: unknown;
}

export interface TickContext {
  tx: Prisma.TransactionClient;
  day: number;
  rng: () => number;
  events: SimEventInput[];
}

export type RuleFn = (ctx: TickContext) => Promise<void>;
